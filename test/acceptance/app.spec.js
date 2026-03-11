const { test, expect } = require("@playwright/test");

test.describe("Drinkle App", () => {
  test("homepage loads with drink cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".swiper")).toBeVisible();

    const cards = page.locator(".card");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
  });

  test("drink cards display name, ingredients, and instructions", async ({
    page,
  }) => {
    await page.goto("/");
    const firstCard = page.locator(".card").first();
    await expect(firstCard).toBeVisible();

    await expect(firstCard.locator("h3").first()).not.toBeEmpty();
    await expect(firstCard.locator("ul li").first()).toBeVisible();
    await expect(firstCard.locator(".instructions p")).not.toBeEmpty();
  });

  test("card flips on click", async ({ page }) => {
    await page.goto("/");
    // Wait for intro animations to clear
    await page.waitForTimeout(3500);

    const firstCard = page.locator(".card").first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).not.toHaveClass(/is-flipped/);

    await firstCard.click();
    await expect(firstCard).toHaveClass(/is-flipped/);

    await firstCard.click();
    await expect(firstCard).not.toHaveClass(/is-flipped/);
  });

  test("swiper allows navigation between cards", async ({ page }) => {
    await page.goto("/");
    const swiper = page.locator(".swiper");
    await expect(swiper).toBeVisible();

    // Get the initially active slide's drink name
    const firstSlide = page.locator(".swiper-slide-active");
    const firstName = await firstSlide.locator("h3").first().textContent();

    // Swipe left to go to next card
    const box = await swiper.boundingBox();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, {
      steps: 10,
    });
    await page.mouse.up();
    await page.waitForTimeout(500);

    const nextSlide = page.locator(".swiper-slide-active");
    const nextName = await nextSlide.locator("h3").first().textContent();
    expect(nextName).not.toBe(firstName);
  });

  test("edit button opens modal", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3500);

    const editBtn = page.locator(".btn-edit").first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    const modal = page.locator(".tingle-modal");
    await expect(modal).toBeVisible();
    await expect(modal.locator("input").first()).toBeVisible();
    await expect(modal.locator("textarea")).toBeVisible();
  });

  test("reset button restores default card data", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3500);

    const resetBtn = page.locator(".btn-reset").first();
    await expect(resetBtn).toBeVisible();

    // Get original name
    const nameEl = page.locator(".card").first().locator("h3").first();
    const originalName = await nameEl.textContent();

    await resetBtn.click();

    // Name should still be the original after reset
    await expect(nameEl).toHaveText(originalName);
  });

  test("all drink images load or show placeholder", async ({ page }) => {
    await page.goto("/");
    const images = page.locator(".card__face--front img");
    const count = await images.count();
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute("src");
      expect(src).toBeTruthy();
    }
  });
});
