document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------- Año del footer ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Menú móvil ---------- */
    const burger = document.querySelector('.burger');
    const navMenu = document.querySelector('.nav-links');

    const closeMenu = () => {
        navMenu.classList.remove('nav-active');
        burger.classList.remove('toggle');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    burger.addEventListener('click', () => {
        const open = navMenu.classList.toggle('nav-active');
        burger.classList.toggle('toggle', open);
        burger.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
    });

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const id = link.getAttribute('href');
            const target = id.length > 1 ? document.querySelector(id) : null;
            if (!target) return;
            e.preventDefault();
            closeMenu();
            target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    });

    /* ---------- Scroll: barra de progreso + header ---------- */
    const progress = document.querySelector('.scroll-progress');
    const header = document.getElementById('top-header');
    let ticking = false;

    const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        progress.style.transform = `scaleX(${p})`;
        header.classList.toggle('scrolled', window.scrollY > 30);
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    /* ---------- Enlace activo según sección ---------- */
    const navLinks = [...document.querySelectorAll('.nav-links a')];
    const sections = navLinks
        .map(a => document.querySelector(a.getAttribute('href')))
        .filter(Boolean);

    const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(a =>
                    a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id)
                );
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));

    /* ---------- Animaciones de entrada (reveal) ---------- */
    const setTiltReady = el => {
        if (el.hasAttribute('data-tilt')) {
            // Espera a que termine la animación de entrada antes de activar el tilt
            const delay = 900 + (parseInt(el.style.getPropertyValue('--i')) || 0) * 110;
            setTimeout(() => el.classList.add('tilt-ready'), delay);
        }
    };

    if (reduceMotion || !('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('visible');
            setTiltReady(el);
        });
    } else {
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    setTiltReady(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    }

    /* ---------- Tilt 3D en tarjetas ---------- */
    if (finePointer && !reduceMotion) {
        document.querySelectorAll('[data-tilt]').forEach(card => {
            const glare = document.createElement('div');
            glare.className = 'tilt-glare';
            card.appendChild(glare);

            const max = card.classList.contains('about-card') ? 5 : 9;
            let raf = null;

            card.addEventListener('mousemove', e => {
                if (!card.classList.contains('tilt-ready')) return;
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width;
                const y = (e.clientY - r.top) / r.height;
                cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    card.style.setProperty('--ry', ((x - 0.5) * 2 * max).toFixed(2) + 'deg');
                    card.style.setProperty('--rx', ((0.5 - y) * 2 * max).toFixed(2) + 'deg');
                    card.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
                    card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
                });
            });

            card.addEventListener('mouseleave', () => {
                cancelAnimationFrame(raf);
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
            });
        });
    }

    /* ---------- Botones magnéticos ---------- */
    if (finePointer && !reduceMotion) {
        document.querySelectorAll('.magnetic').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
                const dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
                btn.style.transform = `translate(${dx}px, ${dy}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    }

    /* ---------- Resplandor que sigue al cursor ---------- */
    const glow = document.querySelector('.cursor-glow');
    if (glow && finePointer && !reduceMotion) {
        let tx = 0, ty = 0, cx = 0, cy = 0;
        window.addEventListener('mousemove', e => {
            tx = e.clientX; ty = e.clientY;
            glow.classList.add('on');
        }, { passive: true });
        const follow = () => {
            cx += (tx - cx) * 0.12;
            cy += (ty - cy) * 0.12;
            glow.style.transform = `translate(${cx}px, ${cy}px)`;
            requestAnimationFrame(follow);
        };
        follow();
    }

    /* ---------- Texto con efecto máquina de escribir ---------- */
    const typedTextElement = document.querySelector('.typed-text');
    const roles = [
        'ANALISTA DE CIBERSEGURIDAD',
        'PROGRAMADOR ASISTIDO POR IA',
        'MAESTRIA EN SEGURIDAD DE LA INFORMACION',
        'INGENIERIA EN SISTEMAS'
    ];

    if (typedTextElement) {
        if (reduceMotion) {
            typedTextElement.textContent = roles[0];
        } else {
            let roleIndex = 0;
            let charIndex = 0;
            let isDeleting = false;

            const typeWriter = () => {
                const currentRole = roles[roleIndex];
                let delay;

                if (isDeleting) {
                    charIndex--;
                    delay = 35;
                } else {
                    charIndex++;
                    delay = 85;
                }
                typedTextElement.textContent = currentRole.substring(0, charIndex);

                if (!isDeleting && charIndex === currentRole.length) {
                    delay = 1800;
                    isDeleting = true;
                } else if (isDeleting && charIndex === 0) {
                    delay = 450;
                    isDeleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                }
                setTimeout(typeWriter, delay);
            };
            setTimeout(typeWriter, 700);
        }
    }

    /* ---------- Formulario de contacto ---------- */
    // Sin backend: abre el cliente de correo con el mensaje ya redactado.
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        const status = contactForm.querySelector('.form-status');
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const data = new FormData(contactForm);
            const nombre = data.get('nombre');
            const email = data.get('email');
            const mensaje = data.get('mensaje');

            const subject = encodeURIComponent(`Contacto desde tu portafolio - ${nombre}`);
            const body = encodeURIComponent(`${mensaje}\n\n— ${nombre} (${email})`);
            window.location.href = `mailto:benetcolindres@gmail.com?subject=${subject}&body=${body}`;

            status.textContent = '¡Gracias! Se abrió tu cliente de correo para enviar el mensaje.';
            contactForm.reset();
        });
    }
});
