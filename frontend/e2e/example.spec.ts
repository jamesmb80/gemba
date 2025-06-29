import { test, expect } from '@playwright/test';

test('homepage loads and shows app title', async ({ page }) => {
  await page.goto('/');
  // Adjust selector or text as needed for your app
  await expect(page).toHaveTitle(/Gemba Fix/i);
});
