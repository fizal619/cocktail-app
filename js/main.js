const swiper = new Swiper('.swiper', {
  // Optional parameters
  direction: 'horizontal',
  loop: true,
});


document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", e => {
    card.classList.toggle("is-flipped");
  });
});