// tests/childMalnutrition.spec.js
import { test, expect } from '@playwright/test';

test.describe('Child Malnutrition Tests', () => {

  let country;
  let year;
  let region;
  let rate;

  test.beforeEach(async ({ page }) => {
    country = 'Spain' + Math.floor(Math.random() * 1000);
    year = '2025';
    region = 'Europe';
    rate = '12';
    await page.goto('/child-malnutritions');
  });

  // ---------------- CREATE ----------------
  test.describe('Create Resource', () => {
    test('should create a new child malnutrition record', async ({ page }) => {
      await page.goto('/child-malnutritions/create');

      await page.fill('input[placeholder="País"]', country);
      await page.fill('input[placeholder="Año"]', year);
      await page.fill('input[placeholder="Región"]', region);
      await page.fill('input[placeholder="Tasa de retraso (%)"]', rate);

      page.on('dialog', dialog => dialog.accept());

      await page.getByRole('button', { name: /guardar/i }).click();

      await expect(page).toHaveURL('/child-malnutritions');
      await expect(page.locator('table')).toContainText(country);
    });
  });

  // ---------------- READ ----------------
  test.describe('Read / Search Resource', () => {
    test('should find the created record', async ({ page }) => {
      await page.fill('input[placeholder="País"]', country);
      await page.getByRole('button', { name: /buscar/i }).click();

      await expect(page.locator('table')).toContainText(country);
    });
  });

  // ---------------- UPDATE ----------------
  test.describe('Update Resource', () => {
    test('should edit the existing record', async ({ page }) => {
      await page.locator('text=Detalles').first().click();

      const newRegion = 'UpdatedRegion';

      await page.locator('input[placeholder="Región"]').fill(newRegion);

      page.on('dialog', dialog => dialog.accept());

      await page.getByRole('button', { name: /actualizar/i }).click();

      await expect(page.locator('table')).toContainText(newRegion);
    });
  });

  // ---------------- DELETE ----------------
  test.describe('Delete Resource', () => {
    test('should delete the record', async ({ page }) => {
      page.on('dialog', dialog => dialog.accept());

      await page.getByRole('button', { name: /eliminar/i }).first().click();

      await expect(page.locator('table')).not.toContainText(country);
    });
  });

});