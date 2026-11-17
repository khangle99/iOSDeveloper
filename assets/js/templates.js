// Shared HTML templates.
// Used in the browser by script.js and at build time by scripts/build.js,
// so the pre-rendered HTML and the live page always match.
(function (root) {
    const PROJECT_IDS = ['gotyme', 'wifiesta', 'hifpt', 'shimauma', 'kaka'];

    const hero = (data) => {
        const buttonsHtml = data.buttons.map(btn => `
            <a href="${btn.link}" class="${btn.class}">${btn.label}</a>
        `).join('');

        const socialLinksHtml = data.socialLinks.map(link => `
            <a href="${link.link}" ${link.label === 'LinkedIn' ? 'target="_blank"' : ''} aria-label="${link.label}">
                <i class="${link.icon}"></i>
            </a>
        `).join('');

        const profileContent = data.profileImage
            ? `<img src="${data.profileImage}" alt="Profile">`
            : `<i class="${data.profileIcon}"></i>`;

        return `
            <div class="hero-text">
                <span class="badge">${data.badge}</span>
                <h1>${data.title}</h1>
                <p>${data.description}</p>
                <div class="hero-btns">
                    ${buttonsHtml}
                </div>
                <div class="social-links">
                    ${socialLinksHtml}
                </div>
            </div>
            <div class="hero-image">
                <div class="blob"></div>
                <div class="profile-img-container">
                    ${profileContent}
                </div>
            </div>
        `;
    };

    const about = (data) => {
        const statsHtml = data.stats.map(stat => `
            <div class="stat-item">
                <span class="stat-number">${stat.number}</span>
                <span class="stat-label">${stat.label}</span>
            </div>
        `).join('');

        return `
            <div class="about-card">
                <h3>${data.summary.title}</h3>
                <p>${data.summary.text}</p>
            </div>
            <div class="stats-grid">
                ${statsHtml}
            </div>
        `;
    };

    const experience = (data) => data.items.map(item => `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-date">${item.period}</div>
                <div class="timeline-content">
                    <div class="company-header">
                        <img src="${item.logo}" alt="${item.company} Logo" class="company-logo">
                        <h3>${item.role}</h3>
                    </div>
                    <h4>${item.company}, ${item.location}</h4>
                    <ul>
                        ${item.details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                    <div class="tech-stack">
                        ${item.techStack.map(tech => `<span>${tech}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');

    const skills = (data) => data.categories.map(category => `
            <div class="skill-category">
                <h3>${category.title}</h3>
                <div class="skill-tags">
                    ${category.skills.map(skill => `
                        <span class="skill-tag ${skill.filled ? 'filled' : ''}">${skill.name}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');

    const education = (data) => data.items.map(item => `
            <div class="education-card">
                <i class="${item.icon} edu-icon"></i>
                <div class="edu-details">
                    <h3>${item.title}</h3>
                    <h4>${item.subtitle}</h4>
                    ${item.year ? `<p class="edu-year">${item.year}</p>` : ''}
                </div>
            </div>
        `).join('');

    const contact = (data) => {
        const linksHtml = data.links.map(link => `
            <a href="${link.url}" ${link.type === 'linkedin' ? 'target="_blank"' : ''} class="contact-link">
                <i class="${link.icon}"></i>
                <span>${link.text}</span>
            </a>
        `).join('');

        return `
            <p>${data.description}</p>
            <div class="contact-info">
                ${linksHtml}
            </div>
        `;
    };

    const rating = (value) => {
        if (!value) return '';
        return `
            <div class="rating">
                <i class="fas fa-star"></i> ${value}
            </div>
        `;
    };

    const statusBadge = (project) => project.status === 'discontinued'
        ? `<span class="badge-sm">Discontinued</span>`
        : '';

    const actionButton = (project) => {
        if (project.status === 'discontinued') {
            return `
                <button class="btn-store disabled" disabled>
                    <i class="fas fa-ban"></i> ${project.statusText || 'Discontinued'}
                </button>
            `;
        }
        return `
            <a href="${project.storeLink}" target="_blank" class="btn-store">
                <i class="fab fa-app-store-ios"></i> App Store
            </a>
        `;
    };

    const projectCard = (project) => `
            <div class="project-card">
                <div class="project-info">
                    <div class="project-header">
                        <div class="project-title-group">
                            <img src="assets/projects/${project.id}/icon.png" alt="${project.title} Icon" class="project-icon">
                            <h3>${project.title}</h3>
                        </div>
                        ${rating(project.rating)}
                        ${statusBadge(project)}
                    </div>
                    <p class="project-desc">${project.description}</p>
                    <div class="project-tags">
                        ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
                    </div>
                    ${actionButton(project)}
                </div>
                <div class="project-image">
                    <img src="assets/projects/${project.id}/screenshot.png" alt="${project.title} App">
                </div>
            </div>
        `;

    const projects = (projectContents) => PROJECT_IDS
        .map(id => projectContents[id])
        .filter(Boolean)
        .map(projectCard)
        .join('');

    root.Templates = { PROJECT_IDS, hero, about, experience, skills, education, contact, projects };
})(typeof window !== 'undefined' ? window : globalThis);
