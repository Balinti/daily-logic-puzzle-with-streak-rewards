import { test, expect } from '@playwright/test';

test.describe('RuleGrid Smoke Tests', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('RuleGrid');
    await expect(page.getByRole('link', { name: 'Play Daily' })).toBeVisible();
  });

  test('should navigate to practice page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Practice' }).click();
    await expect(page).toHaveURL('/practice');
    await expect(page.locator('h1')).toContainText('Practice Mode');
  });

  test('should navigate to archive page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Archive' }).click();
    await expect(page).toHaveURL('/archive');
    await expect(page.locator('h1')).toContainText('Archive');
  });

  test('should navigate to stats page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Stats' }).click();
    await expect(page).toHaveURL('/stats');
    await expect(page.locator('h1')).toContainText('Stats');
  });

  test('should navigate to account page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Account' }).click();
    await expect(page).toHaveURL('/account');
    await expect(page.locator('h1')).toContainText('Account');
  });

  test('should display daily puzzle page', async ({ page }) => {
    await page.goto('/daily');
    await expect(page.locator('h1')).toContainText('Daily Puzzle');
    await expect(page.getByRole('button', { name: 'Check Solution' })).toBeVisible();
  });
});
