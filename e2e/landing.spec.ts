import { test, expect } from "@playwright/test";

test("landing page loads and links to signup", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Write Better Emails/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Start Writing Free/i }).first()).toHaveAttribute(
    "href",
    "/signup",
  );
});

test("protected routes redirect anonymous users to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("signup page renders the signup form", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: /Create your account/i })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});
