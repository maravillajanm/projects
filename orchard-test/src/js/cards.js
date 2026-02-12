document.querySelectorAll('.card__link').forEach(link => {
  link.addEventListener('click', (e) => {
    console.log(e.currentTarget)
  })
})