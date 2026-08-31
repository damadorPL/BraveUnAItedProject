import { test, expect } from "@playwright/test";

test.describe("Search & Caller Profile User Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Log in as admin
    await page.goto("/login");
    await page.fill("#login-email", "admin@synapsis.org.pl");
    await page.fill("#login-password", "synapsis2026");
    await page.click("button[type='submit']");
    await expect(page).toHaveURL(/\/search/);
  });

  test("should search for a caller by name with fuzzy matching", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='Wpisz imię, nazwisko']");
    await expect(searchInput).toBeVisible();

    // Search for 'Kowalska' without diacritics
    await searchInput.fill("Kowalska");
    await page.waitForTimeout(300); // Allow debounce / deferred value

    // Results or disambiguation should display Kowalska
    const callerCard = page.locator("text=Kowalska").first();
    await expect(callerCard).toBeVisible();
  });

  test("should navigate to caller profile on card click and show history timeline", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='Wpisz imię, nazwisko']");
    await searchInput.fill("Kowalska");
    await page.waitForTimeout(300);

    // In disambiguation or results list, click on caller match
    const callerCard = page.locator("text=Kowalska").first();
    await expect(callerCard).toBeVisible();
    await callerCard.click();

    // Should navigate to /callers/:id
    await expect(page).toHaveURL(/\/callers\/caller-/);

    // Profile heading and details
    await expect(page.locator("text=Kowalska").first()).toBeVisible();
    await expect(page.locator("text=Historia kontaktu").first()).toBeVisible();
  });
});
