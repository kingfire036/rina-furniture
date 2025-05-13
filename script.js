document.addEventListener('DOMContentLoaded', function () {

    // --- Initialize AOS ---
    AOS.init({
        duration: 800, // Animation duration
        once: true, // Whether animation should happen only once - while scrolling down
        offset: 50, // Offset (in px) from the original trigger point
        easing: 'ease-in-out', // Default easing
    });

    // --- Navbar Active State & Smooth Scrolling ---
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const sections = document.querySelectorAll('section[id]');
    const mainNavbar = document.getElementById('main-navbar');

    const getNavbarHeight = () => {
        return mainNavbar ? mainNavbar.offsetHeight : 60;
    };

    function smoothScroll(targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const navbarHeight = getNavbarHeight();
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });

            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                const toggler = document.querySelector('.navbar-toggler');
                if (toggler) {
                    toggler.click();
                }
            }
        } else {
            console.warn(`Smooth scroll target element #${targetId} not found.`);
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            if (this.hash && this.hash.startsWith('#')) {
                const targetId = this.hash.substring(1);
                if (document.getElementById(targetId)) {
                    e.preventDefault();
                    smoothScroll(targetId);
                }
            }
        });
    });

    document.querySelectorAll('.cta-button').forEach(button => {
        if (button.hash && button.hash.startsWith('#') && document.getElementById(button.hash.substring(1))) {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.hash.substring(1);
                smoothScroll(targetId);
            });
        }
    });

    function updateActiveNavLink() {
        let currentSectionId = null;
        const scrollPosition = window.pageYOffset;
        const navbarHeight = getNavbarHeight();
        const offsetMargin = navbarHeight + 50;

        sections.forEach(section => {
            if (section) {
                const sectionTop = section.offsetTop - offsetMargin;
                const sectionBottom = sectionTop + section.offsetHeight;
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    currentSectionId = section.getAttribute('id');
                }
            }
        });

        if (!currentSectionId && scrollPosition < (sections[0] ? sections[0].offsetTop - offsetMargin : window.innerHeight / 3)) {
            currentSectionId = 'hero';
        }
        else if ((window.innerHeight + scrollPosition) >= document.body.offsetHeight - 50) {
            const lastSection = sections[sections.length - 1];
            if (lastSection) {
                currentSectionId = lastSection.getAttribute('id');
            }
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            if (linkHref === '#' + currentSectionId) {
                link.classList.add('active');
            }
        });

        const anyLinkActive = document.querySelector('.navbar-nav .nav-link.active');
        if (!anyLinkActive && scrollPosition < 100 && navLinks[0]?.getAttribute('href') === '#hero') {
            navLinks[0].classList.add('active');
        }
    }

    let scrollTimeout;
    const throttledUpdate = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveNavLink, 100);
    };

    window.addEventListener('scroll', throttledUpdate);
    window.addEventListener('resize', throttledUpdate);
    updateActiveNavLink();

    // --- Counter Animation ---
    const counters = document.querySelectorAll('.stat-number');
    const counterSpeed = 30;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const animateCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        if (isNaN(target)) {
            console.error("Invalid data-target value for counter:", counter);
            return;
        }
        let count = 0;
        const duration = 1500;
        const steps = duration / counterSpeed;
        const increment = Math.max(1, Math.ceil(target / steps));

        const updateCount = () => {
            count += increment;
            if (count < target) {
                counter.innerText = count;
                setTimeout(updateCount, counterSpeed);
            } else {
                counter.innerText = target;
                counter.dataset.animated = 'true';
            }
        };

        if (!counter.dataset.animated) {
            counter.innerText = '0';
            updateCount();
        }
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                animateCounter(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        if (counter && counter.getAttribute('data-target')) {
            counterObserver.observe(counter);
        } else if (counter) {
            console.warn("Counter element found without a data-target attribute:", counter);
        }
    });


    // --- Contact Form Handling (Mailto Link) ---
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const recipientEmail = 'rina-furniture@outlook.com'; // Keep your email here

    if (contactForm && formMessage) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopPropagation();

            contactForm.classList.add('was-validated');

            if (contactForm.checkValidity()) {
                const name = document.getElementById('name').value.trim();
                const mobile = document.getElementById('mobile').value.trim();
                const workType = document.getElementById('work-type').value;
                const message = document.getElementById('message').value.trim();

                const subject = `Website Inquiry: ${workType} from ${name}`;
                const body = `New Inquiry from RINA FURNITURE Website:\n
-------------------------------------------\n
Name: ${name}\n
Mobile: ${mobile}\n
Service Interested In: ${workType}\n
Message:\n${message}\n
-------------------------------------------\n`;

                const encodedSubject = encodeURIComponent(subject);
                const encodedBody = encodeURIComponent(body);
                const mailtoLink = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;

                try {
                    formMessage.innerHTML = `<div class="alert alert-info">Opening your email client... Please review and send the email.</div>`;
                    formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    window.location.href = mailtoLink;

                    setTimeout(() => {
                        contactForm.reset();
                        contactForm.classList.remove('was-validated');
                        // formMessage.innerHTML = ''; // Optionally clear message
                    }, 3000);

                } catch (error) {
                    console.error("Error creating mailto link:", error);
                    formMessage.innerHTML = `<div class="alert alert-danger">Could not open your email client automatically. Please copy the details or try calling us.</div>`;
                    formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                formMessage.innerHTML = `<div class="alert alert-warning">Please fill out all required fields correctly.</div>`;
                const firstInvalidField = contactForm.querySelector(':invalid');
                if (firstInvalidField) {
                    firstInvalidField.focus();
                    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    } else {
        console.warn("Contact form or form message area not found.");
    }

    // --- Portfolio Carousel Initialization (Bootstrap handles auto-play with data-bs-ride) ---
    const portfolioCarousel = document.getElementById('portfolioCarousel');
    if (portfolioCarousel) {
        // Bootstrap's data-bs-ride="carousel" attribute handles automatic sliding.
        // If you need to manually control it or customize options:
        // const carousel = new bootstrap.Carousel(portfolioCarousel, {
        //  interval: 3000, // Time in ms
        //  wrap: true // Whether carousel should cycle continuously or stop at the last item
        // });
        // console.log("Portfolio carousel initialized.");
    }


    // --- Footer Current Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Back to Top Button ---
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.style.display = 'flex';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Tutorial Modal Logic ---
    const tutorialModalElement = document.getElementById('tutorialModal');
    const openTutorialButton = document.getElementById('openTutorialModal');
    const closeTutorialButton = document.getElementById('closeTutorial');
    const dontShowAgainCheckbox = document.getElementById('dontShowAgain');

    if (tutorialModalElement && openTutorialButton && closeTutorialButton && dontShowAgainCheckbox) {
        const tutorialModal = new bootstrap.Modal(tutorialModalElement);

        const showTutorial = () => {
            if (localStorage.getItem('hideRinaFurnitureTutorial') !== 'true') {
                tutorialModal.show();
            }
        };

        showTutorial();

        openTutorialButton.addEventListener('click', () => {
            tutorialModal.show();
        });

        closeTutorialButton.addEventListener('click', () => {
            if (dontShowAgainCheckbox.checked) {
                localStorage.setItem('hideRinaFurnitureTutorial', 'true');
            }
        });

        tutorialModalElement.querySelectorAll('.modal-link').forEach(link => {
            link.addEventListener('click', function (e) {
                if (this.hash && this.hash.startsWith('#')) {
                    const targetId = this.hash.substring(1);
                    if (document.getElementById(targetId)) {
                        e.preventDefault();
                        tutorialModal.hide();
                        tutorialModalElement.addEventListener('hidden.bs.modal', () => {
                            smoothScroll(targetId);
                        }, { once: true });
                    }
                }
            });
        });

    } else {
        console.warn("Tutorial modal elements not found.");
    }

}); // End DOMContentLoaded
