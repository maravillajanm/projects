const initGalleryModal = () => {
  const triggers = document.querySelectorAll('.js-modal-trigger');

  if (!triggers.length) return;

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const modalId = trigger.dataset.modal;
      const imageSrc = trigger.dataset.image;
      const imageAlt = trigger.dataset.alt || '';

      const modal = document.getElementById(modalId);
      if (!modal) return;

      const content = modal.querySelector('.js-modal-content');

      content.innerHTML = `
        <img src="/projects/orchard/${imageSrc}" alt="${imageAlt}">
      `;

      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');

      lockScroll();
    });
  });

  setupModalClose();
};

const setupModalClose = () => {
  const closeButtons = document.querySelectorAll('.js-modal-close');

  closeButtons.forEach(close => {
    close.addEventListener('click', () => {
      closeModal(close.closest('.js-modal'));
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.js-modal.is-active');
      if (activeModal) closeModal(activeModal);
    }
  });
};

const closeModal = modal => {
  if (!modal) return;

  modal.classList.remove('is-active');
  modal.setAttribute('aria-hidden', 'true');

  const content = modal.querySelector('.js-modal-content');
  if (content) content.innerHTML = '';

  unlockScroll();
};

const lockScroll = () => {
  document.body.style.overflow = 'hidden';
};

const unlockScroll = () => {
  document.body.style.overflow = '';
};

initGalleryModal();