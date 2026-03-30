import { test, expect } from '@playwright/test';

test.describe.serial('Child Malnutrition CRUD', () => {

  test.beforeAll(async ({ request }) => {
    await request.get('/api/v1/child-malnutritions/loadInitialData');
  });

  test('listar recursos', async ({ page }) => {
    await page.goto('/child-malnutritions');
    await page.waitForSelector('table');
    await expect(page.locator('table')).toBeVisible();
  });

  test('crear recurso', async ({ page }) => {
    await page.goto('/child-malnutritions/create');

    await page.fill('input[placeholder="País (ej. Spain)"]', 'Spain');
    await page.fill('input[placeholder="Año (ej. 2024)"]', '2025');
    await page.fill('input[placeholder="Región"]', 'Europe');
    await page.fill('input[placeholder="Tasa de retraso (%)"]', '12');

    page.on('dialog', dialog => dialog.accept());

    await page.click('text=Guardar Recurso');

    await page.waitForURL('/child-malnutritions');
    await page.waitForSelector('table');
  });

  test('editar recurso', async ({ page }) => {
    await page.goto('/child-malnutritions');

    await page.locator('text=Detalles').first().click();
    await page.waitForSelector('input');

    await page.locator('input').first().fill('Updated Region');

    page.on('dialog', dialog => dialog.accept());

    await page.click('text=Actualizar recurso');

    await page.waitForURL('/child-malnutritions');
  });

  test('buscar recurso', async ({ page }) => {
    await page.goto('/child-malnutritions');

    await page.fill('input[placeholder="País"]', 'Spain');
    await page.click('text=Buscar');

    await page.waitForSelector('table');
  });

  test('borrar todos', async ({ page }) => {
    await page.goto('/child-malnutritions');

    page.on('dialog', dialog => dialog.accept());

    await page.click('text=Eliminar toda la colección');
  });

});