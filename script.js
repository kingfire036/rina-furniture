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
    const mainNavbar = document.getElementById('main-navbar'); // Target the navbar by ID

    // Function to get current navbar height safely
    const getNavbarHeight = () => {
        return mainNavbar ? mainNavbar.offsetHeight : 60; // Default height if navbar not found
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

            // Close mobile navbar if open
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
            // Check if the link is internal (starts with #)
            if (this.hash && this.hash.startsWith('#') && document.getElementById(this.hash.substring(1))) {
                e.preventDefault();
                const targetId = this.hash.substring(1);
                smoothScroll(targetId);
            }
            // Allow external links or non-hash links to work normally
        });
    });

    // Add smooth scroll to CTA button(s)
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
        const offsetMargin = 50; // Extra margin for better activation point

        sections.forEach(section => {
            if (section) { // Ensure section exists
                const sectionTop = section.offsetTop - navbarHeight - offsetMargin;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    currentSectionId = section.getAttribute('id');
                }
            }
        });

        // Handle edge cases: Top of page and Bottom of page
        const firstSection = sections[0];
        if (firstSection && scrollPosition < firstSection.offsetTop - navbarHeight - offsetMargin) {
             // Check if the current active link is already the first one ('hero')
             const activeLink = document.querySelector('.navbar-nav .nav-link.active');
             if (!activeLink || (activeLink && activeLink.getAttribute('href') !== '#hero')) {
                 currentSectionId = 'hero'; // Default to hero if above first section
             } else {
                 // Keep hero active if already active and near top
                 currentSectionId = 'hero';
             }
        } else if ((window.innerHeight + scrollPosition) >= document.body.offsetHeight - offsetMargin) {
            // At the bottom of the page, activate the last section's link
             const lastSection = sections[sections.length - 1];
            if (lastSection) {
                currentSectionId = lastSection.getAttribute('id');
            }
        }

        // Update active class on links
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            if (linkHref === '#' + currentSectionId) {
                link.classList.add('active');
            }
        });
    }

    // Throttled scroll/resize listener for performance
    let scrollTimeout;
    const throttledUpdate = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveNavLink, 100); // Update active link 100ms after scroll/resize stops
    };

    window.addEventListener('scroll', throttledUpdate);
    window.addEventListener('resize', throttledUpdate);
    updateActiveNavLink(); // Initial check on load

    // --- Counter Animation ---
    const counters = document.querySelectorAll('.stat-number');
    const counterSpeed = 30; // Lower number = faster animation (ms per step)

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 // Trigger when 50% visible
    };

    const animateCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        if (isNaN(target)) {
            console.error("Invalid data-target value for counter:", counter);
            return; // Skip if target is not a number
        }
        let count = 0;
        // Calculate increment dynamically based on target and desired duration
        const duration = 1500; // Total animation time in ms
        const steps = duration / counterSpeed;
        const increment = Math.max(1, Math.ceil(target / steps)); // Ensure increment is at least 1

        const updateCount = () => {
            count += increment;
            if (count < target) {
                counter.innerText = count;
                setTimeout(updateCount, counterSpeed); // Use setTimeout for consistent speed
            } else {
                counter.innerText = target; // Ensure final value is exact target
                 counter.dataset.animated = 'true'; // Mark as animated
            }
        };

        // Check if already animated before starting
        if (!counter.dataset.animated) {
             counter.innerText = '0'; // Start from 0
            updateCount(); // Start the animation
        }
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Trigger if intersecting and not already animated
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                animateCounter(entry.target);
                // Optionally unobserve after animation to save resources
                // observer.unobserve(entry.target);
            }
             // Optional: Reset animation if element scrolls out of view
             /*
            else if (!entry.isIntersecting && entry.target.dataset.animated) {
                 entry.target.innerText = '0'; // Reset text
                 delete entry.target.dataset.animated; // Remove animated flag
             }
             */
        });
    }, observerOptions);

    counters.forEach(counter => {
        if (counter && counter.getAttribute('data-target')) { // Ensure counter exists and has target
            counterObserver.observe(counter);
        } else if (counter) {
             console.warn("Counter element found without a data-target attribute:", counter);
        }
    });


    // --- Contact Form Handling ---
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message'); // Message display area
    const recipientEmail = 'rina-furniture@outlook.com'; // Keep your email here

    if (contactForm && formMessage) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent default browser submission
            event.stopPropagation();

            contactForm.classList.add('was-validated'); // Trigger Bootstrap validation styles

            if (contactForm.checkValidity()) {
                // --- Option 1: Mailto Link (Current Implementation - Unreliable) ---
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
                    // Display a message guiding the user
                    formMessage.innerHTML = `<div class="alert alert-info">Opening your email client... Please review and send the email.</div>`;
                    formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // Attempt to open mail client
                    window.location.href = mailtoLink;

                    // Reset form after a short delay (assuming mail client opened)
                    setTimeout(() => {
                        contactForm.reset();
                        contactForm.classList.remove('was-validated');
                        // Optionally clear the info message or replace it
                        // formMessage.innerHTML = '';
                    }, 3000); // 3 second delay

                } catch (error) {
                    console.error("Error creating mailto link:", error);
                     formMessage.innerHTML = `<div class="alert alert-danger">Could not open your email client automatically. Please copy the details or try calling us.</div>`;
                    formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                 // --- Option 2: Integrate with a Form Backend (Recommended) ---
                /*
                // Example using fetch API (replace with your backend endpoint/service)
                const formData = new FormData(contactForm);
                const submitButton = contactForm.querySelector('button[type="submit"]');
                submitButton.disabled = true; // Disable button during submission
                formMessage.innerHTML = `<div class="alert alert-info">Sending inquiry...</div>`;

                fetch('YOUR_BACKEND_ENDPOINT_URL', { // <-- Replace with your endpoint
                    method: 'POST',
                    body: formData // Or convert to JSON if required by your backend
                    // headers: { 'Content-Type': 'application/json' }, // If sending JSON
                    // body: JSON.stringify(Object.fromEntries(formData)),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json(); // Or response.text() depending on backend response
                })
                .then(data => {
                    console.log('Success:', data);
                    formMessage.innerHTML = `<div class="alert alert-success">Thank you! Your inquiry has been sent successfully. We'll be in touch soon.</div>`;
                    contactForm.reset();
                    contactForm.classList.remove('was-validated');
                })
                .catch((error) => {
                    console.error('Error:', error);
                    formMessage.innerHTML = `<div class="alert alert-danger">Sorry, there was an error sending your message. Please try again later or call us.</div>`;
                })
                .finally(() => {
                    submitButton.disabled = false; // Re-enable button
                });
                */
                // --- End Option 2 ---

            } else {
                // Form is invalid
                 formMessage.innerHTML = `<div class="alert alert-warning">Please fill out all required fields correctly.</div>`;
                // Find the first invalid field and focus it for better UX
                const firstInvalidField = contactForm.querySelector(':invalid');
                if (firstInvalidField) {
                    firstInvalidField.focus();
                    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });

        // Optional: Remove validation styles on input
        contactForm.addEventListener('input', function (event) {
             if (event.target.checkValidity() && contactForm.classList.contains('was-validated')) {
                // If you want instant feedback removal, you might need more complex logic
                // For now, rely on the next submit validation or manual reset
             }
        });
    } else {
        console.warn("Contact form or form message area not found.");
    }

    // --- Lightbox Image Update (Kept for potential Portfolio use) ---
    const portfolioLinks = document.querySelectorAll('.portfolio-gallery a[data-image]'); // More specific selector
    const lightboxImage = document.querySelector('.lightbox-content');
    const lightbox = document.querySelector('.lightbox'); // Target the main lightbox div

    portfolioLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // No preventDefault here if using :target pseudo-class for lightbox
            const imageSrc = this.getAttribute('data-image');
            if (lightboxImage && imageSrc) {
                 lightboxImage.setAttribute('src', imageSrc);
                 // Optional: Preload image? Might be complex.
            } else if (!lightboxImage) {
                console.warn("Lightbox image element (.lightbox-content) not found.");
            }
        });
    });

    // Close lightbox by clicking outside the image or on close button
    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            // Close if clicked directly on the background (lightbox) or on the close button
            if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
                // Use history back or set hash to something non-existent to close :target lightbox
                // window.history.back(); // Might go back too far
                 window.location.hash = '#_'; // Set to a non-existent hash
                 e.preventDefault(); // Prevent default if it was the close link
            }
        });

        // Close lightbox with Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === "Escape" && window.location.hash === "#lightbox") {
                window.location.hash = '#_';
            }
        });
    }

     // --- Footer Current Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

}); // End DOMContentLoaded