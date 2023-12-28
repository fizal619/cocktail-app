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


function inputOnChange(targetObj, key, value) {
  targetObj[key] = value;
  console.log(targetObj);
}

function editCard(drink) {
  const nameEL = document.getElementById(`${drink.shortname}_name`);
  const imageEL = document.getElementById(`${drink.shortname}_image`);
  const ingredientsEL = document.getElementById(`${drink.shortname}_ingredients`);
  const instructionsEL = document.getElementById(`${drink.shortname}_instructions`);
  const nameBackEL = document.getElementById(`${drink.shortname}_name_back`);
  const imageBackEL = document.getElementById(`${drink.shortname}_image_back`);

  const modal = new tingle.modal({
    footer: true,
    stickyFooter: false,
    closeMethods: ['overlay', 'button', 'escape'],
    closeLabel: "Close",
    cssClass: ['custom-class-1', 'custom-class-2'],
  });

  modal.setContent(`
    <br>
    Name: <input value="${drink.name}" id="${drink.shortname}_name_edit" />
    <br>
  `);

  modal.open();

  document
    .getElementById(`${drink.shortname}_name_edit`)
    .addEventListener("keyup", e => {
      inputOnChange(drink, "name", e.target.value );
    });

}