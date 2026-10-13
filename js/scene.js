import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('bg3d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglAvailable() {
    try {
        const c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) {
        return false;
    }
}

if (canvas && webglAvailable()) {
    init();
}

function init() {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070f, 0.055);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 7);

    const CYAN = 0x00e5ff;
    const BLUE = 0x3b82f6;
    const VIOLET = 0x8b5cf6;

    /* --- Objeto principal: nudo toroidal + núcleo + anillos --- */
    const hero = new THREE.Group();
    scene.add(hero);

    const knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.25, 0.36, 180, 24, 2, 3),
        new THREE.MeshBasicMaterial({ color: CYAN, wireframe: true, transparent: true, opacity: 0.38 })
    );
    hero.add(knot);

    const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.62, 1),
        new THREE.MeshBasicMaterial({ color: VIOLET, wireframe: true, transparent: true, opacity: 0.85 })
    );
    hero.add(core);

    const ringMat = new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.5 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.012, 8, 160), ringMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.01, 8, 160), ringMat);
    ring1.rotation.x = Math.PI / 2.3;
    ring2.rotation.y = Math.PI / 2.6;
    hero.add(ring1, ring2);

    /* --- Partículas --- */
    const COUNT = window.innerWidth < 700 ? 900 : 2000;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const palette = [new THREE.Color(CYAN), new THREE.Color(BLUE), new THREE.Color(VIOLET)];

    for (let i = 0; i < COUNT; i++) {
        const r = 4 + Math.random() * 14;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        const c = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particles = new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false })
    );
    scene.add(particles);

    /* --- Cubos flotantes --- */
    const floaters = [];
    const boxGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const edges = new THREE.EdgesGeometry(boxGeo);
    for (let i = 0; i < 14; i++) {
        const m = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: i % 2 ? CYAN : VIOLET, transparent: true, opacity: 0.55 })
        );
        m.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 12, -2 - Math.random() * 8);
        m.scale.setScalar(0.5 + Math.random() * 1.4);
        m.userData = { speed: 0.2 + Math.random() * 0.5, offset: Math.random() * 10 };
        floaters.push(m);
        scene.add(m);
    }

    /* --- Interacción --- */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('mousemove', e => {
        mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    let scrollP = 0;
    let scrollSmooth = 0;
    const updateScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        scrollP = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    /* --- Layout responsivo del objeto principal --- */
    let baseX = 2.6;
    let baseScale = 1;
    const layout = () => {
        const w = window.innerWidth;
        renderer.setSize(w, window.innerHeight);
        camera.aspect = w / window.innerHeight;
        camera.updateProjectionMatrix();
        if (w < 860) { baseX = 0; baseScale = 0.62; }
        else if (w < 1200) { baseX = 2.0; baseScale = 0.85; }
        else { baseX = 2.7; baseScale = 1; }
    };
    window.addEventListener('resize', layout);
    layout();

    /* --- Bucle --- */
    const clock = new THREE.Clock();
    let running = true;
    document.addEventListener('visibilitychange', () => {
        running = !document.hidden;
        if (running) { clock.getDelta(); loop(); }
    });

    function render() {
        const t = clock.getElapsedTime();

        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;
        scrollSmooth += (scrollP - scrollSmooth) * 0.06;

        // El objeto principal se desplaza de lado a lado y se aleja al hacer scroll
        const sway = Math.cos(scrollSmooth * Math.PI * 4);
        const targetX = baseX * sway;
        hero.position.x += (targetX - hero.position.x) * 0.08;
        hero.position.y = Math.sin(t * 0.8) * 0.15 - scrollSmooth * 1.2;
        hero.scale.setScalar(baseScale * (1 - scrollSmooth * 0.25));

        knot.rotation.x = t * 0.18 + mouse.y * 0.5;
        knot.rotation.y = t * 0.25 + mouse.x * 0.7;
        core.rotation.x = -t * 0.5;
        core.rotation.y = t * 0.4;
        ring1.rotation.z = t * 0.3;
        ring2.rotation.x = Math.PI / 2 + Math.sin(t * 0.4) * 0.5;
        ring2.rotation.z = -t * 0.2;

        particles.rotation.y = t * 0.02 + scrollSmooth * 1.6;
        particles.rotation.x = scrollSmooth * 0.6;

        floaters.forEach(f => {
            const { speed, offset } = f.userData;
            f.rotation.x = t * speed + offset;
            f.rotation.y = t * speed * 0.8;
            f.position.y += Math.sin(t * speed + offset) * 0.002;
        });

        camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.04;
        camera.position.y += (-mouse.y * 0.4 - camera.position.y) * 0.04;
        camera.position.z = 7 + scrollSmooth * 2.5;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }

    function loop() {
        if (!running) return;
        render();
        requestAnimationFrame(loop);
    }

    if (reduceMotion) {
        render();
        window.addEventListener('resize', render);
    } else {
        loop();
    }
}
