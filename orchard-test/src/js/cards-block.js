const initCards = () => {
  document.querySelectorAll('.js-card-link').forEach((link) =>
      link.addEventListener('click', (e) => {
        console.log(e.currentTarget);
      })
    );
};

initCards();