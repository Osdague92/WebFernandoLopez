/* ================================================================
   FERNANDO LÓPEZ - LANDING PAGE
   JavaScript Vanilla | Interactividad y Funcionalidades
   ================================================================ */

// ========================
// INICIALIZACIÓN DEL DOM
// ========================
document.addEventListener('DOMContentLoaded', function() {
    initializeMenuToggle();
    setDynamicYear();
    initializeScrollAnimations();
    addSmoothScrolling();
});

// ========================
// MENÚ HAMBURGUESA
// ========================
/**
 * Gestiona la apertura y cierre del menú responsivo
 */
function initializeMenuToggle() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (!hamburger || !navMenu) {
        console.warn('Elementos del menú no encontrados');
        return;
    }
    
    // Toggle menú al hacer click en hamburger
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Cerrar menú al hacer click en un enlace
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Cerrar menú al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// ========================
// AÑO DINÁMICO EN FOOTER
// ========================
/**
 * Inserta el año actual automáticamente en el footer
 */
function setDynamicYear() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ========================
// SCROLL SUAVE
// ========================
/**
 * Implementa scroll suave para los enlaces internos
 * (complementa el scroll-behavior: smooth del CSS)
 */
function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// ========================
// ANIMACIONES AL SCROLL
// ========================
/**
 * Anima elementos cuando entran en la viewport
 * Utiliza Intersection Observer API para mejor rendimiento
 */
function initializeScrollAnimations() {
    // Elementos a animar
    const elementsToAnimate = [
        '.work-card',
        '.about-content',
        '.about-image',
        '.contact-form',
        '.featured-quote'
    ];
    
    // Opciones del Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    // Crear observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Agregar clase de animación
                entry.target.classList.add('fade-in-on-scroll');
                
                // Opcionalmente, dejar de observar después de animar
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar elementos
    elementsToAnimate.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            observer.observe(element);
        });
    });
}

// ========================
// VALIDACIÓN DE FORMULARIO
// ========================
/**
 * Valida el formulario de contacto antes del envío
 */
function validateContactForm() {
    const form = document.querySelector('.contact-form');
    
    if (!form) {
        console.warn('Formulario de contacto no encontrado');
        return;
    }
    
    form.addEventListener('submit', function(e) {
        const nameInput = this.querySelector('#name');
        const emailInput = this.querySelector('#email');
        const messageInput = this.querySelector('#message');
        
        let isValid = true;
        const errors = [];
        
        // Validar nombre
        if (!nameInput.value.trim()) {
            errors.push('El nombre es requerido');
            isValid = false;
        } else if (nameInput.value.trim().length < 3) {
            errors.push('El nombre debe tener al menos 3 caracteres');
            isValid = false;
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim()) {
            errors.push('El email es requerido');
            isValid = false;
        } else if (!emailRegex.test(emailInput.value)) {
            errors.push('El email no es válido');
            isValid = false;
        }
        
        // Validar mensaje
        if (!messageInput.value.trim()) {
            errors.push('El mensaje es requerido');
            isValid = false;
        } else if (messageInput.value.trim().length < 10) {
            errors.push('El mensaje debe tener al menos 10 caracteres');
            isValid = false;
        }
        
        // Mostrar errores si existen
        if (!isValid) {
            e.preventDefault();
            showValidationErrors(errors);
        }
    });
}

/**
 * Muestra errores de validación al usuario
 * @param {Array} errors - Array de mensajes de error
 */
function showValidationErrors(errors) {
    // Crear contenedor de errores
    let errorContainer = document.querySelector('.form-errors');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'form-errors';
        errorContainer.style.cssText = `
            background-color: #ffe8e8;
            border: 1px solid #ff9999;
            color: #cc0000;
            padding: 1rem;
            border-radius: 2px;
            margin-bottom: 1.5rem;
            font-size: 0.95rem;
        `;
        
        const form = document.querySelector('.contact-form');
        form.insertBefore(errorContainer, form.firstChild);
    }
    
    // Agregar errores
    errorContainer.innerHTML = '<strong>Por favor, corrige los siguientes errores:</strong><ul style="margin-left: 1.5rem; margin-top: 0.5rem;">';
    
    errors.forEach(error => {
        errorContainer.innerHTML += `<li>${error}</li>`;
    });
    
    errorContainer.innerHTML += '</ul>';
    
    // Scroll al contenedor de errores
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Remover errores después de 5 segundos
    setTimeout(() => {
        errorContainer.remove();
    }, 5000);
}

// ========================
// DETECCIÓN DE NAVEGADOR
// ========================
/**
 * Detecta características del navegador para optimizar la experiencia
 */
function detectBrowserFeatures() {
    // Verificar soporte para Intersection Observer
    if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver no soportado, animaciones al scroll deshabilitadas');
    }
    
    // Detectar si es dispositivo táctil
    if (window.matchMedia('(hover: none)').matches) {
        document.body.classList.add('is-touch-device');
    }
}

// ========================
// MANEJO DE NAVEGACIÓN ACTIVA
// ========================
/**
 * Marca el enlace de navegación activo basado en la sección visible
 */
function initializeActiveNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', function() {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 200) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('active');
            }
        });
    });
}

// ========================
// OPTIMIZACIÓN DE IMÁGENES
// ========================
/**
 * Lazy loading mejorado para imágenes
 */
function initializeImageOptimization() {
    // Verificar soporte para loading attribute
    if ('loading' in HTMLImageElement.prototype) {
        // El navegador ya soporta lazy loading nativo
        return;
    }
    
    // Fallback para navegadores antiguos
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// ========================
// PREFERENCIAS DEL USUARIO
// ========================
/**
 * Respeta las preferencias de movimiento y tema del usuario
 */
function respectUserPreferences() {
    // Detectar preferencia de tema oscuro
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        document.documentElement.classList.add('dark-mode');
    }
    
    // Detectar preferencia de movimiento reducido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        document.documentElement.classList.add('reduce-motion');
    }
}

// ========================
// MONITOREO DE RENDIMIENTO
// ========================
/**
 * Registra métricas básicas de rendimiento en consola (desarrollo)
 */
function logPerformanceMetrics() {
    if (window.performance && window.performance.timing) {
        window.addEventListener('load', function() {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            
            console.log('=== Métricas de Rendimiento ===');
            console.log(`Tiempo total de carga: ${pageLoadTime}ms`);
            console.log(`DOM interactivo: ${perfData.domInteractive - perfData.navigationStart}ms`);
            console.log(`Recursos completados: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
        });
    }
}

// ========================
// INICIALIZACIÓN GLOBAL
// ========================
/**
 * Ejecuta todas las funciones de inicialización
 */
function initializeApp() {
    detectBrowserFeatures();
    initializeActiveNavigation();
    initializeImageOptimization();
    respectUserPreferences();
    validateContactForm();
    
    // Log de rendimiento en desarrollo
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        logPerformanceMetrics();
    }
    
    console.log('✓ Aplicación inicializada correctamente');
}

// Ejecutar inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}