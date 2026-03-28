// @ts-check
import { test, expect } from '@playwright/test';

let APP_URL = 'http://localhost:3000';
let PAGE_PATH = '/deaths-by-risk-factors';

test.describe('Test layout', () => {
  test('has title', async ({ page }) => {
    await page.goto(APP_URL);

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/SOS2526-10 API/);
  });

  test('La página principal de la API carga correctamente y muestra el título', async ({ page }) => {
    await page.goto(`${APP_URL}${PAGE_PATH}`);

    // Verifica que el estado de la red esté inactivo para asegurar la carga de datos
    await page.waitForLoadState('networkidle');

    // Verifica que existan elementos básicos en la interfaz
    const title = page.getByRole('heading', { name: /muertes por factores de riesgo/i });
    await expect(title).toBeVisible();
  });

  test('Verificar la existencia de los filtros', async ({ page }) => {
    await page.goto(`${APP_URL}${PAGE_PATH}`);

    // Espera a que la página cargue completamente
    await page.waitForLoadState('networkidle');

    // 1. Comprueba que el contenedor principal de filtros existe y es visible
    const sectionFiltros = page.getByTestId('filters');
    await expect(sectionFiltros).toBeVisible();

    // 2. Opcional: Comprueba que el título dentro de esa sección es correcto
    await expect(sectionFiltros.getByRole('heading', { name: 'Filtros' }))
      .toBeVisible();

    // 3. Opcional: Comprueba que existe el selector de modo o algún input dentro
    const gridFilters = sectionFiltros.locator('.grid-filters');
    await expect(gridFilters).toBeVisible();
  });

  test('El botón para añadir nuevos recursos es visible', async ({ page }) => {
    await page.goto(`${APP_URL}${PAGE_PATH}`);
    await page.waitForLoadState('networkidle');

    // Busca el botón de añadir siguiendo el patrón de tus otros tests
    const botonAdd = page.getByRole('link', { name: /añadir/i }).first();
    await expect(botonAdd).toBeVisible();
  });

  test('Navegación al formulario de creación', async ({ page }) => {
    await page.goto(`${APP_URL}${PAGE_PATH}`);

    // Simula el click en el botón de añadir recurso
    await page.getByRole('link', { name: /añadir/i }).first().click();

    // Verifica que la URL cambie a la de creación
    await expect(page).toHaveURL(new RegExp(`${PAGE_PATH}/create`));

    // Verifica que el formulario de "Añadir Nuevo Recurso" esté presente
    await expect(page.getByText('Añadir Nuevo Recurso')).toBeVisible();
  });
});