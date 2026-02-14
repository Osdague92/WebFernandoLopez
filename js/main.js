document.addEventListener('DOMContentLoaded', () => {
  setCurrentYear();
  setupNavbarScrollEffect();
  setupNavbarScrollHighlight();
  setupSmoothNavClose();
  setupAnimations();
  setupContactForm();
  setupPhoneValidation();
  setupModalEnhancements();
  enhanceFormVisibility();
});

function setCurrentYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function setupNavbarScrollEffect() {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return;

  const toggleScrolled = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };

  toggleScrolled();
  window.addEventListener('scroll', toggleScrolled);
}

function setupSmoothNavClose() {
  const navLinks = document.querySelectorAll('.navbar .nav-link');
  const navCollapse = document.getElementById('navbarContent');
  if (!navCollapse) return;

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const collapseInstance = bootstrap.Collapse.getInstance(navCollapse);
      if (collapseInstance) collapseInstance.hide();
    });
  });
}

function setupAnimations() {
  if (window.AOS) {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
    });
  }
}

function setupContactForm() {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const spinner = document.getElementById('submitSpinner');
  const alertBox = document.getElementById('formAlert');

  if (!form || !submitBtn || !spinner || !alertBox) return;

  let isSubmitting = false;

  const showAlert = (type, message) => {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
  };

  const hideAlert = () => {
    alertBox.classList.add('d-none');
    alertBox.textContent = '';
  };

  // Validación adicional para teléfono
  const validateForm = () => {
    const phoneInput = form.phone;
    const phoneValue = phoneInput?.value.replace(/\D/g, '') || '';
    
    // Validar que teléfono no esté vacío y tenga mínimo 10 dígitos
    if (phoneInput && phoneInput.hasAttribute('required')) {
      if (!phoneValue) {
        phoneInput.classList.add('is-invalid');
        return false;
      } else if (phoneValue.length < 10) {
        phoneInput.classList.add('is-invalid');
        showAlert('warning', 'El teléfono debe tener al menos 10 dígitos.');
        return false;
      } else {
        phoneInput.classList.remove('is-invalid');
        phoneInput.classList.add('is-valid');
      }
    }
    
    return true;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert();

    if (isSubmitting) return;

    // Validación de teléfono adicional
    if (!validateForm()) {
      event.stopPropagation();
      return;
    }

    if (!form.checkValidity()) {
      event.stopPropagation();
      form.classList.add('was-validated');
      showAlert('warning', 'Revisa los campos obligatorios antes de enviar.');
      return;
    }

    form.classList.add('was-validated');

    const phoneInput = form.phone;
    const phoneClean = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: phoneClean,
      message: form.message.value.trim(),
    };

    isSubmitting = true;
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');

    try {
      const response = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No fue posible enviar el mensaje.');
      }

      form.reset();
      form.classList.remove('was-validated');
      
      // Limpiar estados de validación
      const inputs = form.querySelectorAll('.form-control');
      inputs.forEach(input => {
        input.classList.remove('is-valid', 'is-invalid');
      });
      
      showAlert('success', data.message || 'Mensaje enviado correctamente.');
    } catch (error) {
      showAlert('danger', error.message || 'Ocurrió un error inesperado. Inténtalo nuevamente.');
    } finally {
      isSubmitting = false;
      submitBtn.disabled = false;
      spinner.classList.add('d-none');
    }
  });
}

/* ================================================================
   MEJORAS NUEVAS - VALIDACIÓN DE TELÉFONO
   ================================================================ */
function setupPhoneValidation() {
  const phoneInput = document.getElementById('phone');
  if (!phoneInput) return;

  // Validar formato de teléfono
  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Limitar a máximo 15 dígitos
    if (value.length > 15) {
      value = value.slice(0, 15);
    }
    
    // Agregar formato visual
    if (value.length > 0) {
      if (value.length <= 3) {
        e.target.value = value;
      } else if (value.length <= 6) {
        e.target.value = value.slice(0, 3) + ' ' + value.slice(3);
      } else if (value.length <= 10) {
        e.target.value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6);
      } else {
        e.target.value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6, 10) + ' ' + value.slice(10);
      }
    }
  });

  // Validar en el evento blur
  phoneInput.addEventListener('blur', (e) => {
    const value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0 && value.length < 10) {
      e.target.classList.add('is-invalid');
      const feedback = e.target.nextElementSibling;
      if (feedback) {
        feedback.textContent = 'El teléfono debe tener al menos 10 dígitos.';
      }
    } else if (value.length > 0) {
      e.target.classList.remove('is-invalid');
      e.target.classList.add('is-valid');
    }
  });

  // Limpiar validación al hacer focus
  phoneInput.addEventListener('focus', (e) => {
    e.target.classList.remove('is-invalid', 'is-valid');
  });
}

/* ================================================================
   MEJORAS NUEVAS - DESTAQUE DEL NAVBAR AL HACER SCROLL
   ================================================================ */
function setupNavbarScrollHighlight() {
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  if (navLinks.length === 0) return;

  const highlightActiveLink = () => {
    let current = '';
    
    // Obtener todas las secciones
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      // Si el scroll está dentro de esta sección
      if (window.pageYOffset >= sectionTop - 100) {
        current = section.getAttribute('id');
      }
    });

    // Actualizar links activos
    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current) && current) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', highlightActiveLink);
}

/* ================================================================
   MEJORAS NUEVAS - ENHANCEMENTS DEL MODAL
   ================================================================ */
function setupModalEnhancements() {
  const bioModal = document.getElementById('bioModal');
  if (!bioModal) return;

  const modal = new bootstrap.Modal(bioModal);

  // Cerrar modal con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bioModal.classList.contains('show')) {
      modal.hide();
    }
  });

  // Cerrar modal al hacer click fuera
  bioModal.addEventListener('click', (e) => {
    if (e.target === bioModal) {
      modal.hide();
    }
  });

  // Agregar scroll suave al contenido del modal
  const modalBody = bioModal.querySelector('.bio-modal-content-text');
  if (modalBody) {
    modalBody.style.scrollBehavior = 'smooth';
  }
}

/* ================================================================
   MEJORAR VISIBILIDAD DEL FORMULARIO
   ================================================================ */
function enhanceFormVisibility() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const formContainer = form.closest('.p-4, .p-md-5');
  if (formContainer) {
    formContainer.style.transition = 'all 0.3s ease';
    formContainer.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
  }

  // Animar inputs al focus
  const inputs = form.querySelectorAll('.form-control');
  inputs.forEach((input) => {
    input.addEventListener('focus', function() {
      this.style.transform = 'scale(1.01)';
    });
    
    input.addEventListener('blur', function() {
      this.style.transform = 'scale(1)';
    });
  });
}
