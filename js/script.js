document.addEventListener('DOMContentLoaded', function () {

    // --- Navbar Active State & Smooth Scrolling ---
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const sections = document.querySelectorAll('section[id]');
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar.offsetHeight;

    function smoothScroll(targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const elementPosition = targetElement.getBoundingClientRect().top;
            // Adjust offset calculation if navbar height changes dynamically
            const currentNavbarHeight = document.querySelector('.navbar').offsetHeight;
            const offsetPosition = elementPosition + window.pageYOffset - currentNavbarHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });

            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                const toggler = document.querySelector('.navbar-toggler');
                toggler.click();
            }
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            if (this.hash !== "") {
                e.preventDefault();
                const targetId = this.hash.substring(1);
                smoothScroll(targetId);
            }
        });
    });

    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton && ctaButton.hash !== "") {
        ctaButton.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.hash.substring(1);
            smoothScroll(targetId);
        });
    }

    function updateActiveNavLink() {
        let currentSectionId = '';
        const currentNavbarHeight = document.querySelector('.navbar').offsetHeight; // Get current height

        sections.forEach(section => {
            // Ensure section exists before getting offsetTop
            if (section) {
                const sectionTop = section.offsetTop - currentNavbarHeight - 50;
                const sectionHeight = section.offsetHeight;
                if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                    currentSectionId = section.getAttribute('id');
                }
            }
        });

        if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 50) {
            const lastSection = sections[sections.length - 1];
            if (lastSection) currentSectionId = lastSection.getAttribute('id'); // Default to last section
        }
        else if (window.pageYOffset < (sections[0]?.offsetTop || 0) - currentNavbarHeight - 50) { // Check if sections[0] exists
            currentSectionId = 'hero';
        }


        navLinks.forEach(link => {
            link.classList.remove('active');
            // Ensure link has href before checking
            if (link.getAttribute('href') === '#' + currentSectionId) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink);
    window.addEventListener('resize', updateActiveNavLink); // Update on resize too
    updateActiveNavLink(); // Initial check

    // --- Counter Animation ---
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const animateCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const increment = Math.ceil(target / speed);

        const updateCount = () => {
            count += increment;
            if (count < target) {
                counter.innerText = Math.min(count, target); // Prevent exceeding target during fast increments
                requestAnimationFrame(updateCount);
            } else {
                counter.innerText = target;
            }
        };
        requestAnimationFrame(updateCount); // Start animation smoothly
        counter.dataset.animated = 'true';
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                animateCounter(entry.target);
                // observer.unobserve(entry.target); // Optional: Stop observing after animation
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        if (counter) { // Ensure counter exists
            counterObserver.observe(counter);
        }
    });

    // --- Contact Form Mock Submission & Validation ---
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (contactForm.checkValidity()) {
                // Collect data (optional for mock)
                // const name = document.getElementById('name').value;
                // const email = document.getElementById('email').value;
                // const mobile = document.getElementById('mobile').value;
                // const workType = document.getElementById('work-type').value;
                // const message = document.getElementById('message').value;
                // console.log("Mock Submit:", { name, email, mobile, workType, message });

                alert('Inquiry sent successfully! (This is a simulation - no data was actually sent.)');
                contactForm.reset();
                contactForm.classList.remove('was-validated');
            } else {
                // Optional: Slightly more user-friendly alert than the default browser pop-up
                // You could implement a custom modal here instead of alert.
                // alert('Please fill out all required fields correctly before submitting.');
                contactForm.classList.add('was-validated');
            }
        });
    }

    // --- CSS Lightbox Image Update ---
    const portfolioLinks = document.querySelectorAll('.portfolio-gallery a');
    const lightboxImage = document.querySelector('.lightbox-content');
    const lightbox = document.querySelector('.lightbox');

    portfolioLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // No preventDefault needed for hash links
            const imageSrc = this.getAttribute('data-image');
            if (lightboxImage && imageSrc) {
                lightboxImage.setAttribute('src', imageSrc);
            }
        });
    });

    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) {
                window.location.hash = '#'; // Use non-existent hash or just '#' to close
            }
        });
        // Optional: Close lightbox with Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === "Escape" && window.location.hash === "#lightbox") {
                window.location.hash = '#';
            }
        });
    }


}); // End DOMContentLoaded




