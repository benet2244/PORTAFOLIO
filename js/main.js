document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000,
        once: true,
    });

    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (navMenu.classList.contains('nav-active')) {
                navMenu.classList.remove('nav-active');
                burger.classList.remove('toggle');
                document.body.style.overflow = 'visible';
            }
            document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
        });
    });

    const burger = document.querySelector('.burger');
    const navMenu = document.querySelector('.nav-links');

    burger.addEventListener('click', () => {
        navMenu.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
        document.body.style.overflow = navMenu.classList.contains('nav-active') ? 'hidden' : 'visible';

        navMenu.querySelectorAll('li').forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
    });

    const typedTextElement = document.querySelector('.typed-text');
    const roles = ["Analista de SOC", "Estudiante de Ingeniería en Sistemas", "Estudiante Fullstack Dev"];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeWriter() {
        const currentRole = roles[roleIndex];
        if (isDeleting) {
            typedTextElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typedTextElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            typingSpeed = 500;
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
        }
        setTimeout(typeWriter, typingSpeed);
    }
    typeWriter();

    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('¡Mensaje enviado! (Funcionalidad de envío real requiere un backend)');
            this.reset();
        });
    }
});