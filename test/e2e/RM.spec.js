import { test, expect } from '@playwright/test';

const LIST_URL = '/child-malnutritions';
const CREATE_URL = '/child-malnutritions/create';

test.describe('Child Malnutrition E2E', () => {

  let country;
  let year;
  let region;
  let rate;

  test.beforeEach(async ({ page }) => {
    country = 'Spain' + Math.floor(Math.random() * 1000);
    year = '2025';
    region = 'Europe';
    rate = '12';
  });

  //  0. DELETE ALL
  test('0. Borrar toda la colección', async ({ page }) => {
    await page.goto(LIST_URL);

    page.once('dialog', dialog => dialog.accept());

    await page.getByRole('button', { name: /Eliminar toda la colección/i }).click();

    await expect(page.locator('table')).not.toBeVisible();
  });

  //  1. LOAD INITIAL DATA
  test('1. Cargar datos iniciales', async ({ page }) => {
    await page.goto(LIST_URL);

    await page.getByRole('button', { name: /Cargar datos iniciales/i }).click();

    await expect(page.locator('table')).toBeVisible();
  });

  //  2. CREATE
  test('2. Crear recurso', async ({ page }) => {
    await page.goto(CREATE_URL);

    await page.fill('input[placeholder="País"]', country);
    await page.fill('input[placeholder="Año"]', year);
    await page.fill('input[placeholder="Región"]', region);
    await page.fill('input[placeholder="Tasa de retraso (%)"]', rate);

    await page.getByRole('button', { name: /guardar/i }).click();

    await expect(page).toHaveURL(LIST_URL);
    await expect(page.locator('table')).toContainText(country);
  });

  //  3. DELETE ONE
  test('3. Borrar un recurso', async ({ page }) => {
    await page.goto(LIST_URL);

    const filas = page.locator('table tbody tr');
    await expect(filas.first()).toBeVisible();

    const countBefore = await filas.count();

    page.once('dialog', dialog => dialog.accept());

    await page.getByRole('button', { name: /Eliminar/i }).first().click();

    await expect(filas).toHaveCount(countBefore - 1);
  });

  //  4. PAGINATION
  test('4. Paginación', async ({ page }) => {
    await page.goto(LIST_URL);

    await page.getByRole('button', { name: /Cargar datos iniciales/i }).click();

    await page.getByRole('button', { name: /Siguiente/i }).click();

    await expect(page.getByText(/Página:/)).toBeVisible();
  });

  // 5. EDIT
  test('5. Editar recurso', async ({ page }) => {
    await page.goto(LIST_URL);

    await page.locator('text=Detalles').first().click();

    const newRegion = 'UpdatedRegion';

    await page.locator('input').first().fill(newRegion);

    await page.getByRole('button', { name: /Actualizar/i }).click();

    await expect(page).toHaveURL(LIST_URL);
    await expect(page.locator('table')).toContainText(newRegion);
  });

  //  6. SEARCH country
  test('6. Buscar por país', async ({ page }) => {
    await page.goto(LIST_URL);

    await page.fill('input[placeholder="País"]', 'Spain');
    await page.getByRole('button', { name: /Buscar/i }).click();

    const filas = page.locator('table tbody tr');
    await expect(filas.first()).toBeVisible();

    const all = await filas.all();

    for (const fila of all) {
      await expect(fila).toContainText('Spain');
    }
  });

});