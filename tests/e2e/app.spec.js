const { test, expect } = require('@playwright/test');

const DRINKS = [
  { name: 'Martini',       shortname: 'martini' },
  { name: 'Margarita',     shortname: 'margarita' },
  { name: 'Old Fashioned', shortname: 'old_fashioned' },
  { name: 'Mojito',        shortname: 'mojito' },
  { name: 'Negroni',       shortname: 'negroni' },
  { name: 'Whiskey Sour',  shortname: 'whiskey_sour' },
  { name: 'Blue Lagoon',   shortname: 'blue_lagoon' },
  { name: 'Rum and Coke',  shortname: 'rum_and_coke' },
  { name: 'Cape Codder',   shortname: 'cape_codder' },
  { name: 'Gin and Tonic', shortname: 'gin_and_tonic' },
];

// The first card in the carousel (Martini) is the one we interact with.
// Swiper loop mode duplicates slides in the DOM, so we always use .first()
// when targeting by ID.
const FIRST = DRINKS[0]; // Martini

test.describe('Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('DRINKLE');
  });

  test('shows the app header', async ({ page }) => {
    await expect(page.locator('.header')).toContainText('DRINKLE');
  });

  test('renders all 10 drinks in the DOM', async ({ page }) => {
    // Swiper loop clones slides — count unique shortnames instead of slides
    const shortnames = await page.locator('[data-shortname]').evaluateAll(
      els => [...new Set(els.map(el => el.dataset.shortname))]
    );
    expect(shortnames).toHaveLength(DRINKS.length);
  });
});

test.describe('Drink content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('every drink shows its correct name', async ({ page }) => {
    for (const { name, shortname } of DRINKS) {
      await expect(page.locator(`#${shortname}_name`).first()).toHaveText(name);
    }
  });

  test('every drink has at least one ingredient listed', async ({ page }) => {
    for (const { shortname } of DRINKS) {
      const count = await page.locator(`#${shortname}_ingredients li`).count();
      expect(count, `${shortname} should have ingredients`).toBeGreaterThan(0);
    }
  });

  test('every drink has a non-empty instruction', async ({ page }) => {
    for (const { shortname } of DRINKS) {
      const text = await page.locator(`#${shortname}_instructions`).first().textContent();
      expect(text?.trim().length, `${shortname} should have an instruction`).toBeGreaterThan(0);
    }
  });

  test('Martini lists gin/vodka as first ingredient', async ({ page }) => {
    await expect(page.locator('#martini_ingredients li').first()).toContainText(/gin|vodka/i);
  });

  test('Negroni contains Campari', async ({ page }) => {
    await expect(page.locator('#negroni_ingredients')).toContainText('Campari');
  });
});

test.describe('Card flip', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for Swiper to mark an active slide
    await expect(page.locator('.swiper-slide-active')).toBeVisible();
  });

  test('clicking a card toggles the is-flipped class', async ({ page }) => {
    const card = page.locator('.swiper-slide-active .card');
    await expect(card).not.toHaveClass(/is-flipped/);
    await card.click();
    await expect(card).toHaveClass(/is-flipped/);
  });

  test('clicking a flipped card unflips it', async ({ page }) => {
    const card = page.locator('.swiper-slide-active .card');
    await card.click();
    await expect(card).toHaveClass(/is-flipped/);
    await card.click();
    await expect(card).not.toHaveClass(/is-flipped/);
  });

  test('back face shows the drink name', async ({ page }) => {
    await expect(page.locator(`#${FIRST.shortname}_name_back`).first()).toHaveText(FIRST.name);
  });
});

test.describe('Edit modal', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before scripts run so rehydrate starts from defaults
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
    await expect(page.locator('.swiper-slide-active')).toBeVisible();
  });

  test('edit button opens modal with name and ingredients fields', async ({ page }) => {
    await page.locator('.swiper-slide-active .btn-edit').click();
    await expect(page.locator(`#${FIRST.shortname}_name_edit`)).toBeVisible();
    await expect(page.locator(`#${FIRST.shortname}_ingredients_edit`)).toBeVisible();
    await expect(page.locator(`#${FIRST.shortname}_instructions_edit`)).toBeVisible();
  });

  test('name field is pre-populated with the current drink name', async ({ page }) => {
    await page.locator('.swiper-slide-active .btn-edit').click();
    await expect(page.locator(`#${FIRST.shortname}_name_edit`)).toHaveValue(FIRST.name);
  });

  test('saving a new name updates the card', async ({ page }) => {
    await page.locator('.swiper-slide-active .btn-edit').click();
    await page.locator(`#${FIRST.shortname}_name_edit`).fill('My Martini');
    await page.getByRole('button', { name: 'Save and Close' }).click();

    await expect(page.locator(`#${FIRST.shortname}_name`).first()).toHaveText('My Martini');
    // Back face should also update
    await expect(page.locator(`#${FIRST.shortname}_name_back`).first()).toHaveText('My Martini');
  });

  test('saving persists the edit to localStorage', async ({ page }) => {
    await page.locator('.swiper-slide-active .btn-edit').click();
    await page.locator(`#${FIRST.shortname}_name_edit`).fill('Stored Martini');
    await page.getByRole('button', { name: 'Save and Close' }).click();

    const stored = await page.evaluate(key => localStorage.getItem(key), FIRST.shortname);
    expect(JSON.parse(stored).name).toBe('Stored Martini');
  });

  test('modal closes after saving', async ({ page }) => {
    await page.locator('.swiper-slide-active .btn-edit').click();
    await expect(page.locator(`#${FIRST.shortname}_name_edit`)).toBeVisible();
    await page.getByRole('button', { name: 'Save and Close' }).click();
    await expect(page.locator(`#${FIRST.shortname}_name_edit`)).not.toBeVisible();
  });
});

test.describe('Reset', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
    await expect(page.locator('.swiper-slide-active')).toBeVisible();
  });

  test('reset after edit reverts the card name', async ({ page }) => {
    // Edit first
    await page.locator('.swiper-slide-active .btn-edit').click();
    await page.locator(`#${FIRST.shortname}_name_edit`).fill('Temp Name');
    await page.getByRole('button', { name: 'Save and Close' }).click();
    await expect(page.locator(`#${FIRST.shortname}_name`).first()).toHaveText('Temp Name');

    // Then reset
    await page.locator('.swiper-slide-active .btn-reset').click();
    await expect(page.locator(`#${FIRST.shortname}_name`).first()).toHaveText(FIRST.name);
  });

  test('reset clears the localStorage entry', async ({ page }) => {
    await page.locator('.swiper-slide-active .btn-edit').click();
    await page.locator(`#${FIRST.shortname}_name_edit`).fill('Temp Name');
    await page.getByRole('button', { name: 'Save and Close' }).click();

    await page.locator('.swiper-slide-active .btn-reset').click();

    const stored = await page.evaluate(key => localStorage.getItem(key), FIRST.shortname);
    expect(stored).toBeNull();
  });
});

test.describe('Persistence', () => {
  test('edited name survives a page reload', async ({ page }) => {
    // Use evaluate (not addInitScript) so the clear only happens once,
    // not again when the page reloads after saving.
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator('.swiper-slide-active')).toBeVisible();

    await page.locator('.swiper-slide-active .btn-edit').click();
    await page.locator(`#${FIRST.shortname}_name_edit`).fill('Persisted Name');
    await page.getByRole('button', { name: 'Save and Close' }).click();

    await page.reload();
    await expect(page.locator(`#${FIRST.shortname}_name`).first()).toHaveText('Persisted Name');
  });

  test('reset name does not persist after reload', async ({ page }) => {
    // Use evaluate (not addInitScript) so the seed only happens once,
    // not again after reset clears it.
    await page.goto('/');
    await page.evaluate((key) => {
      localStorage.setItem(key, JSON.stringify({ name: 'Old Custom', ingredients: [], instruction: '' }));
    }, FIRST.shortname);
    await page.reload();
    await expect(page.locator('.swiper-slide-active')).toBeVisible();

    await page.locator('.swiper-slide-active .btn-reset').click();
    await page.reload();

    await expect(page.locator(`#${FIRST.shortname}_name`).first()).toHaveText(FIRST.name);
  });
});
