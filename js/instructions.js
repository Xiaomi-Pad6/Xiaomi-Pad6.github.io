/*
 * Instructions Page JavaScript
 * Includes: Copy-to-Clipboard, Smooth Scrolling, Dark/Light Mode Toggle, Scroll Animations.
 */

document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const steps = document.querySelectorAll('.step');
    const header = document.querySelector('header');
    const navLinks = document.querySelectorAll('a[href^="#"]');
    const copyButtons = document.querySelectorAll('.copy-btn');

    // --- 1. Theme Toggle (Dark/Light Mode) ---
    const currentTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', currentTheme);
    updateThemeToggleIcon(currentTheme);

    function updateThemeToggleIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    themeToggle.addEventListener('click', function() {
        const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeToggleIcon(newTheme);
    });

    // --- 2. Copy-to-Clipboard Functionality ---
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commandBlock = this.closest('.command-block');
            const code = commandBlock.querySelector('code');
            // Use innerText to get the content without HTML tags
            const textToCopy = code.innerText.trim();
            
            // Fallback for environments where navigator.clipboard is not available
            if (!navigator.clipboard) {
                const tempTextarea = document.createElement('textarea');
                tempTextarea.value = textToCopy;
                document.body.appendChild(tempTextarea);
                tempTextarea.select();
                document.execCommand('copy');
                document.body.removeChild(tempTextarea);
                console.warn('Clipboard API not available. Used fallback.');
            } else {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Success animation
                    const originalIconClass = this.querySelector('i').className;
                    this.classList.add('copied');
                    this.querySelector('i').className = 'fas fa-check';
                    
                    setTimeout(() => {
                        this.classList.remove('copied');
                        this.querySelector('i').className = originalIconClass;
                    }, 1500);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    alert('Failed to copy command. Please copy manually.');
                });
            }
        });
    });

    // --- 3. Smooth Scrolling for Anchor Links ---
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                // Offset by header height for smooth scroll
                const headerHeight = header.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20; // Added 20px padding
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- 4. Scroll Progress Indicator ---
    const scrollProgress = document.createElement('div');
    scrollProgress.id = 'scroll-progress';
    document.body.prepend(scrollProgress);

    function updateScrollProgress() {
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / scrollHeight) * 100;
        scrollProgress.style.width = progress + '%';
    }

    // --- 5. Step Reveal Animation (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const stepObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    steps.forEach(step => {
        stepObserver.observe(step);
    });

    // --- 6. Event Listeners ---
    window.addEventListener('scroll', function() {
        updateScrollProgress();
    });

    // Initial call to set progress and check for visible steps on load
    updateScrollProgress();
});
