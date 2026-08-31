import { test, expect } from "@playwright/test";

test.describe("Authentication & Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Start at login page
    await page.goto("/login");
  });

  test("should display the login form with required fields", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Zaloguj się do systemu");
    await expect(page.locator("#login-email")).toBeVisible();
    await expect(page.locator("#login-password")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toContainText("Zaloguj się");
  });

  test("should display error message on invalid password", async ({ page }) => {
    await page.fill("#login-email", "admin@synapsis.org.pl");
    await page.fill("#login-password", "wrong_password_123");
    await page.click("button[type='submit']");

    const errorAlert = page.locator("div[role='alert']");
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText("Nieprawidłowe");
  });

  test("should log in successfully as admin and navigate to /search", async ({ page }) => {
    await page.fill("#login-email", "admin@synapsis.org.pl");
    await page.fill("#login-password", "synapsis2026");
    await page.click("button[type='submit']");

    // Expect redirect to /search
    await expect(page).toHaveURL(/\/search/);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("text=Michał Adamczyk").first()).toBeVisible();
  });

  test("should log out and redirect back to /login", async ({ page }) => {
    // Log in first
    await page.fill("#login-email", "admin@synapsis.org.pl");
    await page.fill("#login-password", "synapsis2026");
    await page.click("button[type='submit']");
    await expect(page).toHaveURL(/\/search/);

    // Click logout in header
    const logoutBtn = page.locator("button[title*='Wyloguj'], button:has-text('Wyloguj')").first();
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Expect redirect to /login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("#login-email")).toBeVisible();
  });
});
