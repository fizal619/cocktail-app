const swiper = new Swiper('.swiper', {
  // Optional parameters
  direction: 'horizontal',
  loop: true,
});

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildSlideHTML(drink, isCustom) {
  const imgSrc = isCustom
    ? `/assets/${escapeHTML(drink.image_shortname)}.png`
    : `/assets/${escapeHTML(drink.shortname)}.png`;
  const ingredientsHTML = (drink.ingredients || [])
    .map(i => `<li>${escapeHTML(i)}</li>`)
    .join('\n');
  const actionBtn = isCustom
    ? `<button class="btn btn-delete" onclick="deleteCustomCard('${escapeHTML(drink.shortname)}')">Delete</button>`
    : `<button class="btn btn-reset animate-in-2" onclick="resetCard('${escapeHTML(drink.shortname)}')">Reset</button>`;

  return `
    <div class="swiper-slide">
      <div class="scene">
        <div data-shortname="${escapeHTML(drink.shortname)}" class="card">
          <div class="card__face card__face--front">
            <h3 id="${escapeHTML(drink.shortname)}_name">${escapeHTML(drink.name)}</h3>
            <hr>
            <img
              id="${escapeHTML(drink.shortname)}_image"
              src="${imgSrc}"
              onerror="this.src='https://placehold.co/400x400?text=placeholder'"
              alt="drink"
            />
            <hr>
            <div class="ingredients">
              <ul id="${escapeHTML(drink.shortname)}_ingredients">
                ${ingredientsHTML}
              </ul>
            </div>
            <div class="instructions">
              <p id="${escapeHTML(drink.shortname)}_instructions">${escapeHTML(drink.instruction || '')}</p>
            </div>
          </div>
          <div class="card__face card__face--back">
            <div class="v-center">
              <img
                id="${escapeHTML(drink.shortname)}_image_back"
                src="${imgSrc}"
                onerror="this.src='https://placehold.co/400x400?text=placeholder'"
                alt="Picture of ${escapeHTML(drink.name)}"
              />
              <h3 id="${escapeHTML(drink.shortname)}_name_back">${escapeHTML(drink.name)}</h3>
            </div>
          </div>
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-edit" onclick="editCard('${escapeHTML(drink.shortname)}')">Edit</button>
        ${actionBtn}
      </div>
    </div>
  `;
}

function addCardSlide(drink, isCustom) {
  swiper.appendSlide(buildSlideHTML(drink, isCustom));
  // Rebuild loop duplicates so the new slide is reachable via swipe navigation
  swiper.loopDestroy();
  swiper.loopCreate();
  swiper.update();
  rehydrate(drink.shortname);
}

function loadCustomCards() {
  const customCards = JSON.parse(localStorage.getItem('custom_cards') || '[]');
  customCards.forEach(drink => addCardSlide(drink, true));
}

function deleteCustomCard(shortname) {
  const customCards = JSON.parse(localStorage.getItem('custom_cards') || '[]');
  localStorage.setItem('custom_cards', JSON.stringify(customCards.filter(d => d.shortname !== shortname)));

  const realSlides = Array.from(document.querySelectorAll('.swiper-wrapper > .swiper-slide:not(.swiper-slide-duplicate)'));
  const slide = realSlides.find(s => s.querySelector(`[data-shortname="${shortname}"]`));
  if (slide) {
    const index = realSlides.indexOf(slide);
    swiper.removeSlide(index);
    swiper.loopDestroy();
    swiper.loopCreate();
    swiper.update();
  }
}

function createCard() {
  const imagePicker = drinks.map((d, i) => `
    <label class="image-picker-item">
      <input type="radio" name="card_image" value="${escapeHTML(d.shortname)}" ${i === 0 ? 'checked' : ''}>
      <img src="/assets/${escapeHTML(d.shortname)}.png" onerror="this.src='https://placehold.co/80x80?text=?'" alt="${escapeHTML(d.shortname)}">
      <span>${escapeHTML(d.name)}</span>
    </label>
  `).join('');

  const modal = new tingle.modal({
    footer: true,
    stickyFooter: false,
    closeMethods: ['button', 'overlay'],
    closeLabel: 'Cancel',
  });

  modal.setContent(`
    <br>
    <h2 style="font-size:28px;font-weight:bold;margin-bottom:8px;">New Recipe Card</h2>
    <br>
    <p>Name:</p><br>
    <input type="text" id="new_card_name" placeholder="e.g. Aperol Spritz" />
    <br><br>
    <p>Ingredients (one per line):</p><br>
    <textarea id="new_card_ingredients" rows="4" placeholder="3 oz Aperol&#10;3 oz Prosecco&#10;Splash of soda"></textarea>
    <br><br>
    <p>Instructions:</p><br>
    <input type="text" id="new_card_instructions" placeholder="e.g. Stir and garnish with orange" />
    <br><br>
    <p>Pick an image:</p>
    <div class="image-picker">
      ${imagePicker}
    </div>
    <br>
  `);

  modal.addFooterBtn('Create Card', 'tingle-btn', () => {
    const name = document.getElementById('new_card_name').value.trim();
    const ingredientsRaw = document.getElementById('new_card_ingredients').value.trim();
    const instruction = document.getElementById('new_card_instructions').value.trim();
    const selectedImage = document.querySelector('input[name="card_image"]:checked');
    const image_shortname = selectedImage ? selectedImage.value : drinks[0].shortname;

    if (!name) {
      alert('Please enter a cocktail name.');
      return;
    }

    const ingredients = ingredientsRaw
      ? ingredientsRaw.split('\n').map(s => s.trim()).filter(s => s)
      : [];
    const shortname = 'custom_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') + '_' + Date.now();
    const newDrink = { shortname, name, ingredients, instruction, image_shortname };

    const customCards = JSON.parse(localStorage.getItem('custom_cards') || '[]');
    customCards.push(newDrink);
    localStorage.setItem('custom_cards', JSON.stringify(customCards));

    addCardSlide(newDrink, true);
    // Navigate to the newly created card
    const realSlides = document.querySelectorAll('.swiper-wrapper > .swiper-slide:not(.swiper-slide-duplicate)');
    swiper.slideToLoop(realSlides.length - 1, 400);
    modal.close();
  });

  modal.open();
}


// Use event delegation so loop-duplicate slides and dynamically added cards all flip correctly
document.querySelector('.swiper-wrapper').addEventListener('click', e => {
  const card = e.target.closest('.card');
  if (card) card.classList.toggle('is-flipped');
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

  // console.log(drinkObj);

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

//clean up intro animations
setTimeout(()=> {
  const elements = document.querySelectorAll(".animate-in-1, .animate-in-2");
  // console.log('elements :>> ', elements);
  elements.forEach(el => {
    el.classList.remove("animate-in-1");
    el.classList.remove("animate-in-2");
  });
}, 3000);

// Load any custom cards created by the user
loadCustomCards();

// for PWA use
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register("/js/serviceworker.js");
}
