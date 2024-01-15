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

function resetCard(shortname) {
  localStorage.removeItem(shortname);
  rehydrate(shortname, true);
}

function editCard(shortname) {

  const nameEL = document.getElementById(`${shortname}_name`);
  const ingredientsEL = document.getElementById(`${shortname}_ingredients`);
  const instructionsEL = document.getElementById(`${shortname}_instructions`);
  let ingredients = Array.from(ingredientsEL.children).map(li=>li.textContent);

  // Rehydrate localstorage or load defaults
  let drink = JSON.parse(localStorage.getItem(shortname) || "{}");
  if (!drink.name) {
    drink = {
      name: nameEL.textContent,
      ingredients,
      instruction: instructionsEL.textContent
    };
  }

  ingredients = ingredients.join("\n");

  const modal = new tingle.modal({
    footer: true,
    stickyFooter: false,
    closeMethods: ["button", "overlay"],
    closeLabel: "Cancel",
    footer: true
  });

  modal.setContent(`
    <br>
    <br>
    <p>Name:</p> <br>
    <input type="text" value="${nameEL.textContent}" id="${shortname}_name_edit" />
    <br>
    <br>
    <p>Ingredients:</p> <br>
    <textarea id="${shortname}_ingredients_edit" rows=4>${ingredients}</textarea>
    <br>
    <br>
    Instructions:
    <input type="text" value="${instructionsEL.textContent}" id="${shortname}_instructions_edit" />
  `);

  // add a button
  modal.addFooterBtn('Save and Close', 'tingle-btn', () => {
    // here goes some logic
    localStorage.setItem(shortname, JSON.stringify(drink));
    rehydrate(shortname);
    modal.close();
  });

  modal.open();

  document
    .getElementById(`${shortname}_name_edit`)
    .addEventListener("input", e => {
      drink.name = e.target.value;
      console.log(drink);
    });

}

//REHYDRATE LOGIC
function rehydrate(shortname, reset) {
  const nameEL = document.getElementById(`${shortname}_name`);
  const ingredientsEL = document.getElementById(`${shortname}_ingredients`);
  const instructionsEL = document.getElementById(`${shortname}_instructions`);
  const nameBackEL = document.getElementById(`${shortname}_name_back`);

  let drinkObj = JSON.parse(localStorage.getItem(shortname));

  if (reset) {
    drinkObj = drinks.find(d=>d.shortname == shortname);
  }

  console.log(drinkObj);

  if (drinkObj) {
    nameEL.textContent = drinkObj.name;
    nameBackEL.textContent = drinkObj.name;
    ingredientsEL.innerHTML = drinkObj.ingredients
      .map(li => `<li>${li}</li>`)
      .join("\n");
    instructionsEL.textContent = drinkObj.instruction;
  }
}

// REHYDRATE any edits on load
document.querySelectorAll(".card").forEach(el => {
  rehydrate(el.dataset.shortname);
});
