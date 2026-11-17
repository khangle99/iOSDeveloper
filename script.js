document.addEventListener('DOMContentLoaded', () => {

    // --- Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');

    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateIcon(theme);
    };

    const updateIcon = (theme) => {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    };

    // Initial icon state based on theme set in head
    const currentTheme = document.documentElement.getAttribute('data-theme');
    updateIcon(currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            let newTheme;

            // Determine current effective theme
            let isDark = false;
            if (currentTheme) {
                isDark = currentTheme === 'dark';
            } else {
                isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }

            // Toggle
            newTheme = isDark ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.classList.contains('btn-download')) return;

            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile Menu Toggle (Basic implementation)
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            // Toggle generic mobile class or style
            // ideally we would add an 'active' class
            const isFlex = navLinks.style.display === 'flex';

            if (isFlex) {
                navLinks.style.display = '';
                navLinks.classList.remove('active');
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = '#0d1117';
                navLinks.style.padding = '1rem';
                navLinks.style.borderBottom = '1px solid #30363d';
                navLinks.classList.add('active');
            }
        });
    }

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        section.classList.add('fade-in-section');
        observer.observe(section);
    });

    // Carousel Logic
    const track = document.querySelector('.carousel-track');
    const dotsContainer = document.querySelector('.carousel-dots');
    const nextBtn = document.querySelector('.nav-btn.next');
    const prevBtn = document.querySelector('.nav-btn.prev');

    // --- Dynamic Content Rendering ---
    // Markup lives in assets/js/templates.js (shared with scripts/build.js,
    // which pre-renders the same HTML into index.html for crawlers and link previews).
    const T = window.Templates;

    const render = (id, data, template) => {
        const container = document.getElementById(id);
        if (container && data) container.innerHTML = template(data);
    };

    // Update Download CV link in Navbar
    const downloadBtn = document.getElementById('download-cv');
    if (downloadBtn && window.heroContent && window.heroContent.cvPath) {
        downloadBtn.href = window.heroContent.cvPath;
    }

    render('hero-container', window.heroContent, T.hero);
    render('about-content', window.aboutContent, T.about);
    render('experience-timeline', window.experienceContent, T.experience);
    render('skills-grid', window.skillsContent, T.skills);
    render('education-grid', window.educationContent, T.education);
    render('contact-content', window.contactContent, T.contact);

    // --- Projects Carousel ---
    const loadProjects = () => {
        if (!track) return;

        if (!window.projectContents) {
            console.error('Project contents not loaded');
            track.innerHTML = '<p class="error-msg">Failed to load projects data.</p>';
            return;
        }

        try {
            track.innerHTML = T.projects(window.projectContents);
            initCarousel();
        } catch (error) {
            console.error('Error rendering projects:', error);
            track.innerHTML = '<p class="error-msg">Error rendering projects.</p>';
        }
    };

    // Initialize Carousel Logic (after content loaded)
    const initCarousel = () => {
        const cards = document.querySelectorAll('.project-card');
        if (cards.length === 0) return;

        let currentIndex = 0;
        const totalCards = cards.length;
        let autoScrollInterval;

        // Clear existing dots
        dotsContainer.innerHTML = '';

        // Create Dots
        cards.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                scrollToIndex(index);
                resetAutoScroll();
            });
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.dot');

        const updateDots = (index) => {
            dots.forEach(d => d.classList.remove('active'));
            dots[index].classList.add('active');
        };

        const scrollToIndex = (index) => {
            if (index < 0) index = totalCards - 1;
            if (index >= totalCards) index = 0;

            currentIndex = index;

            track.scrollTo({
                left: cards[index].offsetLeft - track.offsetLeft,
                behavior: 'smooth'
            });

            updateDots(currentIndex);
        };

        const nextSlide = () => {
            scrollToIndex(currentIndex + 1);
        };

        const prevSlide = () => {
            scrollToIndex(currentIndex - 1);
        };

        // Event Listeners (ensure we remove old ones or just add new ones carefully - actually here we are initing once)
        // Note: fetch is async, so this runs once. If we re-run, duplicate listeners might be an issue if not handled.
        // But we put this inside loadProjects which runs once on load.

        nextBtn.onclick = () => {
            nextSlide();
            resetAutoScroll();
        };

        prevBtn.onclick = () => {
            prevSlide();
            resetAutoScroll();
        };

        // Auto Scroll
        const startAutoScroll = () => {
            stopAutoScroll(); // ensure no dupes
            autoScrollInterval = setInterval(() => {
                nextSlide();
            }, 5000);
        };

        const stopAutoScroll = () => {
            clearInterval(autoScrollInterval);
        };

        const resetAutoScroll = () => {
            stopAutoScroll();
            startAutoScroll();
        };

        track.onmouseenter = stopAutoScroll;
        track.onmouseleave = startAutoScroll;

        // Scroll Observer for Dots
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = Array.from(cards).indexOf(entry.target);
                    if (index !== -1) {
                        currentIndex = index;
                        updateDots(currentIndex);
                    }
                }
            });
        }, { threshold: 0.6, root: track });

        cards.forEach(card => scrollObserver.observe(card));

        // Start
        startAutoScroll();
    };

    // Start loading
    loadProjects();
});

// Add dynamic CSS for animations
const style = document.createElement('style');
style.innerHTML = `
    .fade-in-section {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    .fade-in-section.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);
