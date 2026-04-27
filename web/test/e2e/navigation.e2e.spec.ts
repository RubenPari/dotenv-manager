import { test, expect } from '@playwright/test';

test('unauthenticated dashboard redirects to login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
});

test('login page links to register', async ({ page }) => {
  await page.goto('/login');
  await page.locator('[data-testid="login-to-register"]').click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.locator('[data-testid="register-form"]')).toBeVisible();
});

test('register page links back to login', async ({ page }) => {
  await page.goto('/register');
  await page.locator('[data-testid="register-to-login"]').click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
});

