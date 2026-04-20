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

  async function ensureDataLoaded(page) {
    await page.goto(LIST_URL);
    await page.waitForLoadState('networkidle');
    const table = page.locator('table');
    const isEmpty = await page.locator('p', { hasText: 'No se han encontrado datos' }).isVisible();
    if (isEmpty || !(await table.isVisible())) {
      await page.getByRole('button', { name: /Cargar datos iniciales/i }).click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
    }
  }

  // 0. DELETE ALL
  test('0. Borrar toda la colección', async ({ page }) => {
    await ensureDataLoaded(page);
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /Eliminar toda la colección/i }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table')).not.toBeVisible({ timeout: 10000 });
  });

  // 1. LOAD INITIAL DATA
  test('1. Cargar datos iniciales', async ({ page }) => {
    await page.goto(LIST_URL);
    await page.waitForLoadState('networkidle');

    const table = page.locator('table');
    if (await table.isVisible()) {
      page.once('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: /Eliminar toda la colección/i }).click();
      await page.waitForLoadState('networkidle');
      await expect(table).not.toBeVisible({ timeout: 10000 });
    }

    await page.getByRole('button', { name: /Cargar datos iniciales/i }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
  });

  // 2. CREATE
  test('2. Crear recurso', async ({ page }) => {
    await page.goto(CREATE_URL);
    await page.waitForLoadState('networkidle');

    await page.waitForSelector('input[placeholder="País"]', { timeout: 10000 });
    await page.fill('input[placeholder="País"]', country);
    await page.fill('input[placeholder="Año"]', year);
    await page.fill('input[placeholder="Región"]', region);
    await page.fill('input[placeholder="Tasa Stunting %"]', stunting_rate);

    await page.getByRole('button', { name: /Guardar/i }).click();
    await page.waitForURL(`**${LIST_URL}`, { timeout: 15000 });
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
    await page.waitForLoadState('networkidle');
    await expect(filas).toHaveCount(countBefore - 1, { timeout: 10000 });
  });

  // 4. PAGINATION
  test('4. Paginación', async ({ page }) => {
    await ensureDataLoaded(page);
    const nextBtn = page.getByRole('button', { name: /Siguiente/i });
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/Página: 2/)).toBeVisible();
    } else {
      test.skip(true, 'No hay suficientes datos para paginación');
    }
  });

  // 5. EDIT
  test('5. Editar recurso', async ({ page }) => {
    await ensureDataLoaded(page);

    // El botón Editar está dentro de un <a href="...">, click directo
    await page.locator('table tbody tr').first().getByRole('button', { name: /^detalles$/i }).click();
    await page.waitForLoadState('networkidle');

    // El formulario de edición solo tiene Región y Tasa Stunting
    await page.waitForSelector('input[placeholder="Región"]', { timeout: 10000 });
    const newRegion = 'UpdatedRegion' + Math.floor(Math.random() * 10000);
    await page.fill('input[placeholder="Región"]', newRegion);

    await page.getByRole('button', { name: /Guardar cambios/i }).click();
    await page.waitForURL(`**${LIST_URL}`, { timeout: 15000 });
    await expect(page.locator('table')).toContainText(newRegion);
  });

  // 6. SEARCH por país
  test('6. Buscar por país', async ({ page }) => {
    await ensureDataLoaded(page);
    await page.fill('input[placeholder="País"]', 'Peru');
    await page.getByRole('button', { name: /^Buscar$/i }).click();
    await page.waitForLoadState('networkidle');
    const filas = page.locator('table tbody tr');
    await expect(filas.first()).toBeVisible({ timeout: 10000 });
    const count = await filas.count();
    for (let i = 0; i < count; i++) {
      await expect(filas.nth(i)).toContainText('Peru');
    }
  });

  // 7. SEARCH por región
  test('7. Buscar por región', async ({ page }) => {
    await ensureDataLoaded(page);
    await page.fill('input[placeholder="Región"]', 'South America');
    await page.getByRole('button', { name: /^Buscar$/i }).click();
    await page.waitForLoadState('networkidle');
    const filas = page.locator('table tbody tr');
    await expect(filas.first()).toBeVisible({ timeout: 10000 });
  });
});