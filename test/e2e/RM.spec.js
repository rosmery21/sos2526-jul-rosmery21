import { test, expect } from '@playwright/test';

const LIST_URL = '/child-malnutritions';
const CREATE_URL = '/child-malnutritions/create';

test.describe('Child Malnutrition E2E', () => {

  let country, year, region, stunting_rate;

  test.beforeEach(async ({ page }) => {
    country = 'Spain' + Math.floor(Math.random() * 100000);
    year = '2025';
    region = 'Europe';
    stunting_rate = '12';
  });

  // Helper: asegura que hay datos en la tabla
  async function ensureDataLoaded(page) {
    await page.goto(LIST_URL);
    await page.waitForTimeout(1500);
    const tableVisible = await page.locator('table').isVisible();
    if (!tableVisible) {
      await page.getByRole('button', { name: /Cargar datos iniciales/i }).click();
      await page.waitForTimeout(2000);
    }
  }

  // 0. DELETE ALL
  test('0. Borrar toda la colección', async ({ page }) => {
    await ensureDataLoaded(page);
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /Eliminar toda la colección/i }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('table')).not.toBeVisible();
  });

  // 1. LOAD INITIAL DATA
  test('1. Cargar datos iniciales', async ({ page }) => {
    await page.goto(LIST_URL);
    await page.waitForTimeout(1500);

    if (await page.locator('table').isVisible()) {
      page.once('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: /Eliminar toda la colección/i }).click();
      await page.waitForTimeout(1500);
    }

    await page.getByRole('button', { name: /Cargar datos iniciales/i }).click();
    await page.waitForTimeout(2000);
    await expect(page.locator('table')).toBeVisible();
  });

  // 2. CREATE — placeholders exactos del form Svelte existente
  test('2. Crear recurso', async ({ page }) => {
    await page.goto(CREATE_URL);
    await page.waitForTimeout(500);

    await page.fill('input[placeholder="País"]', country);
    await page.fill('input[placeholder="Año"]', year);
    await page.fill('input[placeholder="Región"]', region);
    await page.fill('input[placeholder="Tasa Stunting %"]', stunting_rate);

    await page.getByRole('button', { name: /^Guardar$/i }).click();

    await page.waitForURL('**' + LIST_URL, { timeout: 10000 });
    await page.waitForTimeout(1000);
    await expect(page.locator('table')).toContainText(country);
  });

  // 3. DELETE ONE
  test('3. Borrar un recurso concreto', async ({ page }) => {
    await ensureDataLoaded(page);

    const filas = page.locator('table tbody tr');
    await expect(filas.first()).toBeVisible();
    const countBefore = await filas.count();

    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /^Eliminar$/i }).first().click();
    await page.waitForTimeout(1500);

    await expect(filas).toHaveCount(countBefore - 1);
  });

  // 4. PAGINATION
  test('4. Paginación', async ({ page }) => {
    await ensureDataLoaded(page);

    await page.getByRole('button', { name: /Siguiente/i }).click();
    await page.waitForTimeout(1000);

    await expect(page.getByText(/Página: 2/)).toBeVisible();
  });

  // 5. EDIT — botón "Editar", no "Detalles"
  test('5. Editar recurso', async ({ page }) => {
    await ensureDataLoaded(page);

    await page.getByRole('button', { name: /^Editar$/i }).first().click();
    await page.waitForTimeout(1500);

    const newRegion = 'UpdatedRegion' + Math.floor(Math.random() * 10000);
    await page.fill('input[placeholder="Región"]', newRegion);

    await page.getByRole('button', { name: /Guardar cambios/i }).click();
    await page.waitForURL('**' + LIST_URL, { timeout: 10000 });
    await page.waitForTimeout(1000);

    await expect(page.locator('table')).toContainText(newRegion);
  });

  // 6. SEARCH por país
  test('6. Buscar por país', async ({ page }) => {
    await ensureDataLoaded(page);

    await page.fill('input[placeholder="País"]', 'Peru');
    await page.getByRole('button', { name: /Buscar/i }).click();
    await page.waitForTimeout(1500);

    const filas = page.locator('table tbody tr');
    await expect(filas.first()).toBeVisible();
    for (const fila of await filas.all()) {
      await expect(fila).toContainText('Peru');
    }
  });

  // 7. SEARCH por región
  test('7. Buscar por región', async ({ page }) => {
    await ensureDataLoaded(page);

    await page.fill('input[placeholder="Región"]', 'South America');
    await page.getByRole('button', { name: /Buscar/i }).click();
    await page.waitForTimeout(1500);

    const filas = page.locator('table tbody tr');
    await expect(filas.first()).toBeVisible();
  });

});