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
    const cards = document.querySelectorAll('.project-card');
    const nextBtn = document.querySelector('.nav-btn.next');
    const prevBtn = document.querySelector('.nav-btn.prev');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (track && cards.length > 0) {
        let currentIndex = 0;
        const totalCards = cards.length;
        let autoScrollInterval;

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
            const cardWidth = cards[0].offsetWidth + 32; // width + gap (approx 2rem = 32px)
            // Or better, just scroll to the offsetLeft of the target card

            // To be robust with resize, let's use scrollIntoView behavior? 
            // Better yet, calculate offset.

            // Actually, we set scroll-snap-type on track, so simple scroll logic:
            track.scrollTo({
                left: cards[index].offsetLeft - track.offsetLeft, // adjust relative to track
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

        // Event Listeners
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoScroll();
        });

        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoScroll();
        });

        // Auto Scroll
        const startAutoScroll = () => {
            autoScrollInterval = setInterval(() => {
                nextSlide();
            }, 5000); // 5 seconds
        };

        const stopAutoScroll = () => {
            clearInterval(autoScrollInterval);
        };

        const resetAutoScroll = () => {
            stopAutoScroll();
            startAutoScroll();
        };

        track.addEventListener('mouseenter', stopAutoScroll);
        track.addEventListener('mouseleave', startAutoScroll);

        // Handle manual scroll (touch/trackpad) updating dots
        // Use IntersectionObserver to update dots on scroll
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Find which card this is
                    const index = Array.from(cards).indexOf(entry.target);
                    if (index !== -1) {
                        currentIndex = index;
                        updateDots(currentIndex);
                    }
                }
            });
        }, { threshold: 0.6, root: track }); // 60% visibility in track

        cards.forEach(card => scrollObserver.observe(card));

        // Initial Start
        startAutoScroll();
    }
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
