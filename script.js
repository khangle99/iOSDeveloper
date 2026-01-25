document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
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

    // Projects Data Config
    const projectIds = ['gotyme', 'wifiesta', 'hifpt', 'shimauma', 'kaka'];

    // Function to generate Star Rating HTML
    const generateRating = (rating) => {
        if (!rating) return '';
        return `
            <div class="rating">
                <i class="fas fa-star"></i> ${rating}
            </div>
        `;
    };

    // Function to generate Status Badge HTML
    const generateStatusBadge = (project) => {
        if (project.status === 'discontinued') {
            return `<span class="badge-sm">Discontinued</span>`;
        }
        return '';
    };

    // Function to generate Action Button HTML
    const generateActionButton = (project) => {
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

    // Function to create Project Card HTML
    const createProjectCard = (project) => {
        const ratingHtml = generateRating(project.rating);
        const statusBadgeHtml = generateStatusBadge(project);
        const actionButtonHtml = generateActionButton(project);
        const tagsHtml = project.tags.map(tag => `<span>${tag}</span>`).join('');

        return `
            <div class="project-card">
                <div class="project-info">
                    <div class="project-header">
                        <div class="project-title-group">
                            <img src="assets/projects/${project.id}/icon.svg" alt="${project.title} Icon" class="project-icon">
                            <h3>${project.title}</h3>
                        </div>
                        ${ratingHtml}
                        ${statusBadgeHtml}
                    </div>
                    <p class="project-desc">${project.description}</p>
                    <div class="project-tags">
                        ${tagsHtml}
                    </div>
                    ${actionButtonHtml}
                </div>
                <div class="project-image">
                    <img src="assets/projects/${project.id}/image.svg" alt="${project.title} App">
                </div>
            </div>
        `;
    };

    // Load Projects
    const loadProjects = () => {
        if (!track) return;

        // Check if project contents are loaded
        if (!window.projectContents) {
            console.error('Project contents not loaded');
            track.innerHTML = '<p class="error-msg">Failed to load projects data.</p>';
            return;
        }

        try {
            // Clear loading/placeholder if any
            track.innerHTML = '';

            // Generate HTML for each project in correct order
            projectIds.forEach(id => {
                const project = window.projectContents[id];
                if (project) {
                    track.innerHTML += createProjectCard(project);
                }
            });

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
