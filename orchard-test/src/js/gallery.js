const modal = document.getElementById('imageModal')
const modalImg = document.getElementById('modalImage')
const closeBtn = document.querySelector('.modal__close')
const overlay = document.querySelector('.modal__overlay')

document.querySelectorAll('.gallery__item').forEach(button => {
  button.addEventListener('click', () => {
    const largeSrc = button.dataset.large
    const img = button.querySelector('img')

    modalImg.src = largeSrc
    modalImg.alt = img.alt
    modal.setAttribute('aria-hidden', 'false')
  })
})

const closeModal = () => {
  modal.setAttribute('aria-hidden', 'true')
  modalImg.src = ''
}

closeBtn.addEventListener('click', closeModal)
overlay.addEventListener('click', closeModal)