document.addEventListener('DOMContentLoaded', () => {
  setCurrentYear();
  setupNavbarScrollEffect();
  setupSmoothNavClose();
  setupAnimations();
  setupContactForm();
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

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert();

    if (isSubmitting) return;

    if (!form.checkValidity()) {
      event.stopPropagation();
      form.classList.add('was-validated');
      showAlert('warning', 'Revisa los campos obligatorios antes de enviar.');
      return;
    }

    form.classList.add('was-validated');

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
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
