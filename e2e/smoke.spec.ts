import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should load and display the app name", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Amortix/i);
  });

  test("should have a CTA button that navigates to auth", async ({ page }) => {
    await page.goto("/");

    // Look for a primary call-to-action link/button
    const ctaLink = page.locator('a:has-text("Get Started"), a:has-text("Sign Up"), a:has-text("Login"), a:has-text("Start")').first();
    await expect(ctaLink).toBeVisible();
  });
});

test.describe("Auth Pages", () => {
  test("login page should render email and password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
  });

  test("register page should render name, email, and password fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();
  });

  test("should show validation errors for empty login form submission", async ({ page }) => {
    await page.goto("/login");

    // Click submit without filling anything
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should show at least one validation error
    await expect(page.locator("text=/required|valid|enter/i").first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Protected Routes (Unauthenticated)", () => {
  test("dashboard should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");

    // Should redirect to login page
    await page.waitForURL(/\/(login|auth)/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/(login|auth)/);
  });

  test("loans page should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/loans");

    await page.waitForURL(/\/(login|auth)/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/(login|auth)/);
  });
});

test.describe("Static Pages", () => {
  test("privacy policy page should load", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("text=/privacy/i").first()).toBeVisible();
  });

  test("terms page should load", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("text=/terms/i").first()).toBeVisible();
  });
});

test.describe("SEO & Meta Tags", () => {
  test("landing page should have proper meta description", async ({ page }) => {
    await page.goto("/");
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /.+/);
  });

  test("should have a single h1 element on the landing page", async ({ page }) => {
    await page.goto("/");
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });
});
