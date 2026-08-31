import { test, expect } from "@playwright/test";

test.describe("Records & Admin Permissions Flow", () => {
  test("admin user can access /records and open the export modal", async ({ page }) => {
    // Log in as Admin
    await page.goto("/login");
    await page.fill("#login-email", "admin@synapsis.org.pl");
    await page.fill("#login-password", "synapsis2026");
    await page.click("button[type='submit']");
    await expect(page).toHaveURL(/\/search/);

    // Navigate to /records
    await page.goto("/records");
    await expect(page).toHaveURL(/\/records/);

    // Export button should be visible for admin
    const exportBtn = page.locator("button:has-text('Eksportuj rejestr')").first();
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    // Export modal should open
    await expect(page.locator("text=Eksport danych i raportów")).toBeVisible();
    await expect(page.locator("button:has-text('Pobierz plik')")).toBeVisible();

    // Close modal
    await page.locator("button:has-text('Anuluj')").click();
    await expect(page.locator("text=Eksport danych i raportów")).not.toBeVisible();
  });

  test("admin user can access /admin and switch between tabs", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#login-email", "admin@synapsis.org.pl");
    await page.fill("#login-password", "synapsis2026");
    await page.click("button[type='submit']");
    await expect(page).toHaveURL(/\/search/);

    // Go to /admin
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin/);

    // Verify tabs
    await expect(page.locator("text=Panel Administratora").first()).toBeVisible();

    // Switch to Specialists tab
    const specTab = page.locator("button:has-text('Specjaliści i role'), a:has-text('Specjaliści')").first();
    if (await specTab.isVisible()) {
      await specTab.click();
      await expect(page.locator("text=Lista specjalistów").first()).toBeVisible();
    }
  });

  test("regular specialist is blocked from /admin and redirected", async ({ page }) => {
    // Log in as regular consultant Joanna Mrożek
    await page.goto("/login");
    await page.fill("#login-email", "j.mrozek@synapsis.org.pl");
    await page.fill("#login-password", "synapsis2026");
    await page.click("button[type='submit']");
    await expect(page).toHaveURL(/\/search/);

    // Try navigating to /admin
    await page.goto("/admin");

    // Should redirect to /unauthorized or /search
    await expect(page).not.toHaveURL(/\/admin$/);
    await expect(page).toHaveURL(/(\/unauthorized|\/search)/);
  });
});
