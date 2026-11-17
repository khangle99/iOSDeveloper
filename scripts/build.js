#!/usr/bin/env node
// Pre-renders the portfolio content into index.html so the page has real
// content without JavaScript (search engines, link previews, AI tools).
//
// Edit content in assets/**/content.js as usual, then run:
//   node scripts/build.js
// (A GitHub Action also runs this automatically on every push to main.)
//
// It is safe to run repeatedly: it only rewrites the text between
// <!-- prerender:NAME --> and <!-- /prerender:NAME --> markers.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const SITE_URL = 'https://khangle99.github.io/iOSDeveloper/';

// Load content.js files and templates.js into a sandbox that has a `window`.
const sandbox = { window: {} };
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);

const html = fs.readFileSync(INDEX, 'utf8');
const scriptSrcs = [...html.matchAll(/<script src="(assets\/[^"]+\.js)"><\/script>/g)].map(m => m[1]);
for (const src of scriptSrcs) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, src), 'utf8'), sandbox, { filename: src });
}

const w = sandbox.window;
const T = w.Templates;
if (!T) throw new Error('assets/js/templates.js was not loaded');

const stripTags = (s) => String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const jsonLd = () => {
    const sameAs = (w.heroContent.socialLinks || [])
        .map(l => l.link)
        .filter(l => /^https?:/.test(l));
    const current = (w.experienceContent.items || [])[0];
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: stripTags(w.heroContent.title).replace(/^Hello, I'm\s*/i, ''),
        jobTitle: 'iOS Developer',
        url: SITE_URL,
        image: SITE_URL + w.heroContent.profileImage,
        description: w.aboutContent.summary.text,
        sameAs,
        knowsAbout: w.skillsContent.categories.flatMap(c => c.skills.map(s => s.name)),
        alumniOf: (w.educationContent.items || [])
            .filter(i => /bachelor|engineer|university|institute/i.test(i.title + i.subtitle))
            .map(i => ({ '@type': 'CollegeOrUniversity', name: i.subtitle })),
    };
    if (current) data.worksFor = { '@type': 'Organization', name: current.company };
    return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
};

const sections = {
    jsonld: jsonLd(),
    hero: T.hero(w.heroContent),
    about: T.about(w.aboutContent),
    projects: T.projects(w.projectContents),
    experience: T.experience(w.experienceContent),
    skills: T.skills(w.skillsContent),
    education: T.education(w.educationContent),
    contact: T.contact(w.contactContent),
};

let out = html;
for (const [name, content] of Object.entries(sections)) {
    const re = new RegExp(`(<!-- prerender:${name} -->)[\\s\\S]*?(<!-- \\/prerender:${name} -->)`);
    if (!re.test(out)) throw new Error(`Marker for "${name}" not found in index.html`);
    out = out.replace(re, (_, open, close) => `${open}${content}${close}`);
}

// Keep the navbar CV link in sync with heroContent.cvPath.
if (w.heroContent.cvPath) {
    out = out.replace(/(<a href=")[^"]*(" id="download-cv")/, `$1${w.heroContent.cvPath}$2`);
}

if (out !== html) {
    fs.writeFileSync(INDEX, out);
    console.log('index.html updated');
} else {
    console.log('index.html already up to date');
}
