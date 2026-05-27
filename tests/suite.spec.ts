import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("ToDoMVC - TypeScript (Vanilla)");
});

test('has input', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();

  await expect(page.getByRole('heading', { name: 'todos' })).toContainText('todos');

  await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
});
