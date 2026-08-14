/* ==========================================================================
   INTERACTIVE LOGIC & GSAP ANIMATIONS - MOLE EL REFUGIO
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Register GSAP plugins
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initGSAPAnimations();
    } else {
        console.warn('GSAP or ScrollTrigger CDNs failed to load. Falling back to CSS transitions.');
        fallbackStatsAnimation();
    }

    // Initialize UI Components
    initSmoothScroll();
    initCustomCursor();
    initScrollReveal();
    initStickyNavbar();
    initMobileMenu();
    initProductSlider();
    initComparisonData();
    initModalLogic();
});

/* ==========================================================================
   SMOOTH SCROLL (LENIS)
   ========================================================================== */
function initSmoothScroll() {
    if (typeof Lenis === 'undefined') {
        console.warn('Lenis Smooth Scroll library failed to load.');
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const lenis = new Lenis({
        duration: 0.95,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.75,
        touchMultiplier: 1,
        syncTouch: false,
        infinite: false
    });

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const target = link.getAttribute('href');

            if (!target || target === '#') return;

            const targetElement = document.querySelector(target);
            if (!targetElement) return;

            event.preventDefault();
            lenis.scrollTo(targetElement, {
                offset: -96,
                duration: 0.95,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        });
    });

    // Update ScrollTrigger on scroll
    lenis.on('scroll', () => {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.update();
        }
    });

    // Integrate with GSAP RequestAnimationFrame ticker
    if (typeof gsap !== 'undefined') {
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }
}

/* ==========================================================================
   CUSTOM CURSOR (DESKTOP INTERACTION)
   ========================================================================== */
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    // Track mouse coordinates
    window.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });

    // Detect hovers on interactive links and buttons
    const interactiveElements = document.querySelectorAll('a, button, .product-card, .recipe-card, .tab-btn, .carousel-nav');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });
}


/* ==========================================================================
   SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const selectors = [
        '.intro-box',
        '.stat-card',
        '.products-section .section-header',
        '.product-card',
        '.comparison-container',
        '.recipe-card',
        '.newsletter-box',
        '.footer-grid > *',
        '.footer-bottom',
        '.mole-product-hero > *',
        '.mole-story-panel > *',
        '.mole-package-section > *',
        '.mole-deep-card',
        '.mole-nutrition-row > *',
        '.mole-ingredients-row > *',
        '.mole-stat-band > *',
        '.mole-recipes-tease h3',
        '.mole-recipe-pair article',
        '.mole-faq-strip > *'
    ];

    const elements = document.querySelectorAll(selectors.join(','));
    if (!elements.length) return;

    elements.forEach((el, index) => {
        el.classList.add('reveal-ready');
        el.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 90}ms`);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

    elements.forEach((el) => observer.observe(el));

    // Safety net: content must never remain hidden if observers are delayed.
    window.setTimeout(() => {
        elements.forEach((el) => el.classList.add('is-visible'));
    }, 2200);
}

/* ==========================================================================
   STICKY NAVBAR
   ========================================================================== */
function initStickyNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/* ==========================================================================
   MOBILE MENU DRAWER
   ========================================================================== */
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.classList.toggle('modal-open');
    });

    // Close menu when a link inside mobile drawer is clicked
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('modal-open');
        });
    });
}

/* ==========================================================================
   PRODUCT SLIDER (HORIZONTAL CAROUSEL)
   ========================================================================== */
function initProductSlider() {
    const track = document.getElementById('prod-track');
    const prevBtn = document.getElementById('prod-prev');
    const nextBtn = document.getElementById('prod-next');
    if (!track || !prevBtn || !nextBtn) return;

    // Scroll settings
    const scrollAmount = 340; // Card width + gap

    nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    // Enable mouse drag-to-scroll for desktop luxury feel
    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener('mousedown', (e) => {
        isDown = true;
        track.style.cursor = 'grabbing';
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
        isDown = false;
        track.style.cursor = 'grab';
    });

    track.addEventListener('mouseup', () => {
        isDown = false;
        track.style.cursor = 'grab';
    });

    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.5; // Scroll speed multiplier
        track.scrollLeft = scrollLeft - walk;
    });
}

/* ==========================================================================
   INTERACTIVE NUTRITION COMPARISON DATA (Metate vs Industrial)
   ========================================================================== */
const comparisonData = {
    poblano: {
        animalTitle: 'Mole Comercial',
        plant: [
            { name: 'Ingredientes Naturales', val: 100, unit: '%', max: 100 },
            { name: 'Cacao Puro de Origen', val: 100, unit: '%', max: 100 },
            { name: 'Azúcar Añadida', val: 12, unit: '%', max: 60 },
            { name: 'Molienda en Metate', val: 100, unit: '%', max: 100 }
        ],
        animal: [
            { name: 'Ingredientes Naturales', val: 30, unit: '%', max: 100 },
            { name: 'Cacao Puro de Origen', val: 10, unit: '%', max: 100 },
            { name: 'Azúcar Añadida', val: 55, unit: '%', max: 60 },
            { name: 'Molienda en Metate', val: 0, unit: '%', max: 100 }
        ],
        plantHighlight: 'Molienda de piedra, cacao de origen y sin harinas',
        animalHighlight: 'Contiene almidones, harinas y colorantes artificiales'
    },
    negro: {
        animalTitle: 'Mole Negro Industrial',
        plant: [
            { name: 'Ingredientes Naturales', val: 100, unit: '%', max: 100 },
            { name: 'Cacao Negro y Cenizas', val: 100, unit: '%', max: 100 },
            { name: 'Azúcar Añadida', val: 8, unit: '%', max: 60 },
            { name: 'Molienda en Metate', val: 100, unit: '%', max: 100 }
        ],
        animal: [
            { name: 'Ingredientes Naturales', val: 25, unit: '%', max: 100 },
            { name: 'Cacao Negro y Cenizas', val: 5, unit: '%', max: 100 },
            { name: 'Azúcar Añadida', val: 52, unit: '%', max: 60 },
            { name: 'Molienda en Metate', val: 0, unit: '%', max: 100 }
        ],
        plantHighlight: 'Cenizas de chiles, cacao negro selecto y piloncillo',
        animalHighlight: 'Usa colorante artificial negro y grasas vegetales'
    },
    verde: {
        animalTitle: 'Mole Verde Industrial',
        plant: [
            { name: 'Ingredientes Naturales', val: 100, unit: '%', max: 100 },
            { name: 'Pepita de Calabaza', val: 100, unit: '%', max: 100 },
            { name: 'Hierbas Frescas', val: 100, unit: '%', max: 100 },
            { name: 'Espesantes Químicos', val: 0, unit: '%', max: 100 }
        ],
        animal: [
            { name: 'Ingredientes Naturales', val: 20, unit: '%', max: 100 },
            { name: 'Pepita de Calabaza', val: 15, unit: '%', max: 100 },
            { name: 'Hierbas Frescas', val: 5, unit: '%', max: 100 },
            { name: 'Espesantes Químicos', val: 45, unit: '%', max: 100 }
        ],
        plantHighlight: 'Semillas de calabaza molidas y hierbas frescas reales',
        animalHighlight: 'Colorantes artificiales y exceso de almidón de maíz'
    }
};

function initComparisonData() {
    // Populate default (poblano) comparison on page load
    switchComparison('poblano');
}

function switchComparison(productKey) {
    const data = comparisonData[productKey];
    if (!data) return;

    // Update Animal Title
    const animalTitle = document.getElementById('animal-title');
    if (animalTitle) animalTitle.textContent = data.animalTitle;

    // Toggle Tab Active Classes
    const tabs = document.querySelectorAll('.comparison-tabs .tab-btn');
    tabs.forEach((tab, index) => {
        // Tab mapping: 0=poblano, 1=negro, 2=verde
        const keys = ['poblano', 'negro', 'verde'];
        if (keys[index] === productKey) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Populate Plant Column (El Refugio)
    const plantContainer = document.getElementById('plant-stats');
    plantContainer.innerHTML = '';
    data.plant.forEach(stat => {
        plantContainer.innerHTML += createStatHTML(stat, true);
    });

    // Add Plant Highlight
    plantContainer.innerHTML += `<div class="nutrition-highlight">${data.plantHighlight}</div>`;

    // Populate Animal Column (Industrial)
    const animalContainer = document.getElementById('animal-stats');
    animalContainer.innerHTML = '';
    data.animal.forEach(stat => {
        animalContainer.innerHTML += createStatHTML(stat, false);
    });

    // Add Animal Highlight
    animalContainer.innerHTML += `<div class="nutrition-highlight">${data.animalHighlight}</div>`;

    // Trigger bar fill animation
    setTimeout(() => {
        const fills = document.querySelectorAll('.stat-bar-fill');
        fills.forEach(fill => {
            const width = fill.getAttribute('data-width');
            fill.style.width = `${width}%`;
        });

        // Trigger number counting animation
        animateStatNumbers();
    }, 50);
}

function createStatHTML(stat, isPlant) {
    const percentage = (stat.val / stat.max) * 100;
    return `
        <div class="stat-bar-container">
            <div class="stat-meta">
                <span class="stat-name">${stat.name}</span>
                <span class="stat-value"><span class="counter" data-target="${stat.val}">${stat.val}</span>${stat.unit}</span>
            </div>
            <div class="stat-bar-track">
                <div class="stat-bar-fill" data-width="${percentage}" style="width: 0%;"></div>
            </div>
        </div>
    `;
}

function animateStatNumbers() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const duration = 1000; // 1 second
        const startTime = performance.now();
        const startValue = 0;

        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            if (elapsed >= duration) {
                counter.textContent = target % 1 === 0 ? target : target.toFixed(1);
                return;
            }
            const progress = elapsed / duration;
            const easeOutQuad = progress * (2 - progress); // basic quad ease out
            const currentVal = startValue + (target - startValue) * easeOutQuad;
            
            counter.textContent = target % 1 === 0 ? Math.floor(currentVal) : currentVal.toFixed(1);
            requestAnimationFrame(updateNumber);
        }
        requestAnimationFrame(updateNumber);
    });
}

function fallbackStatsAnimation() {
    // Basic styling adjustments in case JS fails
    const fills = document.querySelectorAll('.stat-bar-fill');
    fills.forEach(fill => {
        fill.style.width = fill.getAttribute('data-width') + '%';
    });
}

/* ==========================================================================
   PRODUCT DETAILS MODAL WINDOW (Mole El Refugio)
   ========================================================================== */
const modalProductData = {
    poblano: {
        title: 'Mole Poblano',
        tag: 'Receta de la Casa - Artesanal',
        desc: 'Nuestra receta insignia. Un balance celestial de chiles secos selectos (mulato, ancho y pasilla) desvenados a mano y tostados lentamente, combinados con cacao orgánico de mesa de alta calidad, plátano macho, pasas, almendras, ajonjolí y nuestra mezcla secreta de especias, molidos con amor en metate tradicional.',
        protein: '100%',
        cholesterol: '0%',
        iron: 'Libre',
        ingredients: 'Chile mulato, chile ancho, chile pasilla, cacao orgánico, plátano macho, ajonjolí, almendras, pasas, piloncillo, canela, clavo de olor, ajo, sal de grano.',
        image: 'assets/mole_jar.png'
    },
    negro: {
        title: 'Mole Negro',
        tag: 'Estilo Oaxaqueño - Ahumado',
        desc: 'Receta tradicional oaxaqueña. De tonalidad sumamente oscura y perfil complejo, dulce y ahumado. Se elabora tostando casi al punto de quemar las semillas y venas de los chiles secos chihuacle y mulato negro para obtener su color, mezclado con chocolate amargo y un toque aromático de hoja de aguacate.',
        protein: '100%',
        cholesterol: '0%',
        iron: 'Libre',
        ingredients: 'Chile chihuacle negro, chile mulato ahumado, cenizas de venas de chiles, cacao negro, piloncillo, plátano macho, pasas, ajonjolí, canela, clavo, hoja de aguacate.',
        image: 'assets/mole_jar.png'
    },
    verde: {
        title: 'Mole Verde',
        tag: 'Esmeralda - Herbal',
        desc: 'Fresco, ligero y de notas herbales. Este delicioso mole se prepara tostando y moliendo pepitas de calabaza crudas y ajonjolí en comal, para luego licuarlos y cocerlos lentamente con chiles serranos verdes, tomatillo verde de milpa, epazote silvestre, hoja santa, cilantro y hojas de aguacate fresco.',
        protein: '100%',
        cholesterol: '0%',
        iron: 'Libre',
        ingredients: 'Pepita de calabaza, ajonjolí, chile serrano verde, tomatillo verde, hoja santa, epazote, cilantro, hoja de aguacate, ajo, sal de grano, caldo vegetal.',
        image: 'assets/mole_jar.png'
    },
    pipian: {
        title: 'Pipían Rojo',
        tag: 'Semilla y Picante Suave',
        desc: 'Salsa tersa y untuosa con gran cuerpo y presencia. Tradicional de las cocinas del centro del país. Elaborado con una base abundante de pepita de calabaza y ajonjolí tostado en comal, sazonado con chiles guajillos y anchos que aportan notas frutales y un picante muy suave y balanceado.',
        protein: '100%',
        cholesterol: '0%',
        iron: 'Libre',
        ingredients: 'Pepita de calabaza, ajonjolí, chile guajillo, chile ancho, cacahuate, pimienta gorda, clavo de olor, cebolla, ajo, caldo de verduras concentrado.',
        image: 'assets/mole_jar.png'
    }
};

function initModalLogic() {
    const modal = document.getElementById('product-modal');
    const closeBtn = document.getElementById('modal-close');
    if (!modal || !closeBtn) return;

    // Close Modal Event Listener
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    });

    // Close Modal on Overlay Click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    });
}

function showProductDetails(productKey) {
    const product = modalProductData[productKey];
    if (!product) return;

    const modal = document.getElementById('product-modal');
    
    // Populate Modal Content
    document.getElementById('modal-product-img').src = product.image;
    document.getElementById('modal-product-img').alt = product.title;
    
    // Add visual filters to make jars look color-coded to match the cards
    const modalImg = document.getElementById('modal-product-img');
    if (productKey === 'negro') {
        modalImg.style.filter = 'brightness(0.85) sepia(0.2)';
    } else if (productKey === 'verde') {
        modalImg.style.filter = 'hue-rotate(60deg) brightness(0.95)';
    } else if (productKey === 'pipian') {
        modalImg.style.filter = 'hue-rotate(340deg) saturate(1.2)';
    } else {
        modalImg.style.filter = '';
    }

    document.getElementById('modal-product-tag').textContent = product.tag;
    document.getElementById('modal-product-name').textContent = product.title;
    document.getElementById('modal-product-desc').textContent = product.desc;
    document.getElementById('modal-nut-protein').textContent = product.protein;
    document.getElementById('modal-nut-chol').textContent = product.cholesterol;
    document.getElementById('modal-nut-iron').textContent = product.iron;
    document.getElementById('modal-product-ingredients').textContent = product.ingredients;

    // Dynamically update WhatsApp Order URL with product-specific prefilled message
    const modalWaBtn = document.getElementById('modal-whatsapp-btn');
    if (modalWaBtn) {
        const message = `¡Hola! Me interesa realizar un pedido de ${product.title} en Mole El Refugio. 🌶️`;
        modalWaBtn.href = `https://wa.me/525512345678?text=${encodeURIComponent(message)}`;
    }

    // Show Modal
    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

/* ==========================================================================
   GSAP & SCROLLTRIGGER PREMIUM ANIMATIONS
   ========================================================================== */
function initGSAPAnimations() {
    // 1. Hero Load Entry Animation
    const heroTl = gsap.timeline();
    heroTl.from('.hero-steak-sub', { opacity: 0, y: -20, duration: 0.6, ease: 'power2.out' })
          .from('.hero-steak-tagline', { opacity: 0, scale: 0.8, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.3')
          .from('.hero-steak-title', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, '-=0.4')
          .from('.title-steak-plate', { opacity: 0, scale: 0.3, y: -50, rotation: -45, duration: 1, ease: 'back.out(1.5)' }, '-=0.6');

    // Fly-in corner blobs
    gsap.from('.floating-food.top-left', { x: -100, y: -100, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.5 });
    gsap.from('.floating-food.top-right', { x: 100, y: -100, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.6 });
    gsap.from('.floating-food.bottom-left', { x: -100, y: 100, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.7 });
    gsap.from('.floating-food.bottom-right', { x: 100, y: 100, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.8 });

    // 2. Hero food images leave the section as the user scrolls down.
    const outX = () => Math.max(window.innerWidth * 0.42, 420);
    const outY = () => Math.max(window.innerHeight * 0.42, 320);
    const scrollTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: '+=85%',
            scrub: 0.8,
            invalidateOnRefresh: true
        }
    });

    scrollTl.to('.hero-steak-content', { y: -140, opacity: 0, scale: 0.96, ease: 'none' }, 0)
            .to('.title-steak-plate', { y: 180, scale: 0.45, opacity: 0, ease: 'none' }, 0)
            .to('.floating-food.top-left', { x: () => -outX(), y: () => -outY(), rotation: -18, opacity: 0, ease: 'none' }, 0)
            .to('.floating-food.top-right', { x: () => outX(), y: () => -outY(), rotation: 18, opacity: 0, ease: 'none' }, 0)
            .to('.floating-food.bottom-left', { x: () => -outX(), y: () => outY(), rotation: 16, opacity: 0, ease: 'none' }, 0)
            .to('.floating-food.bottom-right', { x: () => outX(), y: () => outY(), rotation: -16, opacity: 0, ease: 'none' }, 0);

    // 3. Intro Section scroll-triggered load
    gsap.from('.intro-box h2, .intro-box .red-line, .intro-box .intro-text', {
        opacity: 0,
        y: 40,
        stagger: 0.2,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.intro-section',
            start: 'top 80%',
            toggleActions: 'play none none none'
        }
    });

    // 3. Intro stat cards entry and number trigger
    gsap.from('.stat-card', {
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.stat-grid',
            start: 'top 85%',
            onEnter: () => {
                // Trigger stats count up
                animateIntroNumbers();
            }
        }
    });

    // 4. Products Section header entry
    gsap.from('.products-section .section-header', {
        opacity: 0,
        y: 35,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.products-section',
            start: 'top 80%'
        }
    });

    // 5. Keep product cards visible; the carousel should not depend on ScrollTrigger firing.
    gsap.set('.products-section .product-card', { opacity: 1, y: 0, clearProps: 'transform' });

    // 6. Comparison Section card slide up
    gsap.from('.comparison-container', {
        opacity: 0,
        y: 50,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.comparison-section',
            start: 'top 75%'
        }
    });

    // 7. Recipes Grid staggered card slide up
    gsap.from('.recipe-card', {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.recipes-grid',
            start: 'top 80%'
        }
    });

    // 8. Newsletter section box pop-in
    gsap.from('.newsletter-box', {
        scale: 0.95,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.2)',
        scrollTrigger: {
            trigger: '.newsletter-section',
            start: 'top 80%'
        }
    });
}

// Special function for the intro stat values counting up
function animateIntroNumbers() {
    const stats = [
        { id: 'stat-water', target: 100, isHours: false },
        { id: 'stat-land', target: 24, isHours: true },
        { id: 'stat-emissions', target: 0, isHours: false }
    ];

    stats.forEach(stat => {
        const el = document.getElementById(stat.id);
        if (!el) return;

        let obj = { val: 0 };
        gsap.to(obj, {
            val: stat.target,
            duration: 1.5,
            ease: 'power1.out',
            onUpdate: function () {
                const displayVal = Math.floor(obj.val);
                el.textContent = stat.isHours ? `${displayVal}h` : `${displayVal}%`;
            }
        });
    });
}
