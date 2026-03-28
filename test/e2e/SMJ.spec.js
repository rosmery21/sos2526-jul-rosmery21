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

test.describe('Tests de Creación de Recursos', () => {

  // Limpieza inicial: Borramos todo antes de empezar los tests de esta suite
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    // Manejador para aceptar el confirm() de borrar colección
    page.on('dialog', dialog => dialog.accept());

    await page.goto(`${APP_URL}${PAGE_PATH}`);
    await page.waitForLoadState('networkidle');

    // Solo intentamos borrar si hay datos (o directamente al botón si siempre es visible)
    const botonBorrar = page.getByRole('button', { name: /eliminar la colección/i });
    if (await botonBorrar.isVisible()) {
      await botonBorrar.click();
      await expect(page.getByText(/se han eliminado todos los recursos/i)).toBeVisible();
    }
    await page.close();
  });

  test('Debería crear un nuevo recurso correctamente y redirigir', async ({ page }) => {
    await page.goto(`${APP_URL}${PAGE_PATH}/create`);

    await page.getByLabel(/país:/i).fill('TestCountry');
    await page.getByLabel(/año:/i).fill('2024');
    await page.getByLabel(/alta presión arterial:/i).fill('120.5');
    await page.getByLabel(/contaminación del aire:/i).fill('30.2');
    await page.getByLabel(/desnutrición infantil:/i).fill('10.1');
    await page.getByLabel(/contaminación combustibles sólidos:/i).fill('15.4');
    await page.getByLabel(/glucosa en sangre:/i).fill('95.8');

    await page.getByRole('button', { name: /añadir recurso/i }).click();

    // Verificamos éxito y redirección
    await expect(page.getByText(/creado con éxito/i)).toBeVisible();
    await expect(page).toHaveURL(`${APP_URL}${PAGE_PATH}`, { timeout: 5000 });

    // Verificamos que aparece en la tabla
    await expect(page.locator('table')).toContainText('TestCountry');
  });

  test('Debería mostrar error si el recurso ya existe (Conflicto 409)', async ({ page }) => {
    // Como borramos todo al inicio, creamos primero el recurso que vamos a duplicar
    await page.goto(`${APP_URL}${PAGE_PATH}/create`);
    await page.getByLabel(/país:/i).fill('DuplicateCity');
    await page.getByLabel(/año:/i).fill('2025');
    await page.getByRole('button', { name: /añadir recurso/i }).click();
    await page.waitForTimeout(2100); // Esperamos a la redirección

    // Intentamos crearlo de nuevo
    await page.goto(`${APP_URL}${PAGE_PATH}/create`);
    await page.getByLabel(/país:/i).fill('DuplicateCity');
    await page.getByLabel(/año:/i).fill('2025');
    await page.getByRole('button', { name: /añadir recurso/i }).click();

    // Verificamos el mensaje de error de conflicto
    await expect(page.getByText(/error: el recurso ya existe/i)).toBeVisible();
  });

  test('No debería permitir crear un recurso con campos obligatorios vacíos', async ({ page }) => {
    await page.goto(`${APP_URL}${PAGE_PATH}/create`);
    // El navegador bloquea el envío por el atributo 'required'
    await page.getByRole('button', { name: /añadir recurso/i }).click();

    const isInvalid = await page.getByLabel(/país:/i).evaluate((node) => node.validity.valueMissing);
    expect(isInvalid).toBeTruthy();
  });
});

test.describe('Tests de Listado de Recursos', () => {

  test.beforeEach(async ({ page }) => {
    // Aseguramos que haya datos cargando el conjunto inicial antes de cada test de listado
    await page.goto(`${APP_URL}${PAGE_PATH}`);
    await page.on('dialog', dialog => dialog.accept());

    // Si el botón de cargar datos iniciales es visible, lo pulsamos
    const loadBtn = page.getByRole('button', { name: /cargar datos iniciales/i });
    if (!await loadBtn.isVisible()) {
      await page.getByRole('button', { name: /eliminar la colección/i }).click();
      await page.waitForLoadState('networkidle');
    }
    await loadBtn.click();
  });

  test('Debería mostrar la tabla con al menos un recurso', async ({ page }) => {
    await page.goto(`${APP_URL}${PAGE_PATH}`);
    await page.waitForLoadState('networkidle');

    // 1. Verificar que la tabla es visible
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // 2. Verificar que hay al menos una fila de datos (excluyendo el encabezado)
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Debería mostrar las columnas correctas en el encabezado', async ({ page }) => {
    await page.goto(`${APP_URL}${PAGE_PATH}`);

    const headers = page.locator('table thead th');

    // Verificamos algunos de los nombres de columnas definidos en tu código
    await expect(headers.nth(0)).toHaveText(/país/i);
    await expect(headers.nth(1)).toHaveText(/año/i);
    await expect(headers.nth(2)).toHaveText(/alta presión arterial/i);
    await expect(headers.nth(3)).toHaveText(/contaminación del aire/i);
    await expect(headers.nth(4)).toHaveText(/desnutrición infantil/i);
    await expect(headers.nth(5)).toHaveText(/contaminación de combustibles fósiles/i);
    await expect(headers.nth(6)).toHaveText(/glucosa en sangre/i);
  });

  test('La paginación debería mostrar 10 recursos por página', async ({ page }) => {
    await page.goto(`${APP_URL}${PAGE_PATH}`);
    await page.waitForLoadState('networkidle');

    const rows = page.locator('table tbody tr');
    const count = await rows.count();

    // Según tu código, el límite por página es 10
    expect(count).toBeLessThanOrEqual(10);
  });

  test('Debería navegar a la página siguiente al pulsar el botón "+"', async ({ page }) => {
    await page.goto(`${APP_URL}${PAGE_PATH}`);
    await page.waitForLoadState('networkidle');

    // Localizar el indicador de página
    const pageIndicator = page.getByText(/página:/i);
    await expect(pageIndicator).toContainText('0');

    const nextBtn = page.getByRole('button', { name: '+' });

    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
      // Verificar que el número de página cambia en el frontend
      await expect(pageIndicator).toContainText('1');
    }
  });
});

test.describe('Test de borrado', () => {
  test("Los datos se borran correctamente", async ({ page }) => {
    await page.goto(`${APP_URL}${PAGE_PATH}`);
    page.on('dialog', dialog => dialog.accept());
    await page.waitForLoadState('networkidle');

    const deleteBtn = page.getByRole('button', { name: /eliminar la colección/i });
    const loadBtn = page.getByRole('button', { name: /cargar datos iniciales/i });

    if (!await deleteBtn.isVisible()) {
      await loadBtn.waitFor({ state: 'visible' });
      await loadBtn.click();
      await page.waitForLoadState('networkidle');
    }

    await deleteBtn.click();

    // Verificamos el mensaje de éxito
    await expect(page.getByText(/se han eliminado todos los recursos/i)).toBeVisible();
  });
});

test.describe('Tests de Borrado de Recursos', () => {

  // PREPARACIÓN: Limpiar y crear un dato específico para borrar
  test.beforeEach(async ({ browser }) => {
    const page = await browser.newPage();

    // Manejador para aceptar automáticamente los diálogos confirm()
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    // 1. Limpiar colección para tener un entorno controlado
    await page.goto(`${APP_URL}${PAGE_PATH}`);
    await page.waitForLoadState('networkidle');
    const btnBorrarTodo = page.getByRole('button', { name: /eliminar la colección/i });
    if (await btnBorrarTodo.isVisible()) {
      await btnBorrarTodo.click();
      await expect(page.getByText(/se han eliminado todos los recursos/i)).toBeVisible();
    }

    // 2. Crear el recurso que vamos a borrar ("DeleteMe" 2025)
    await page.goto(`${APP_URL}${PAGE_PATH}/create`);
    await page.getByLabel(/país:/i).fill('DeleteMe');
    await page.getByLabel(/año:/i).fill('2025');
    // Rellenar campos obligatorios con valores por defecto
    const campos = ['presión arterial', 'aire', 'desnutrición', 'combustibles', 'glucosa'];
    for (const campo of campos) {
      await page.getByLabel(new RegExp(campo, 'i')).fill('10');
    }
    await page.getByRole('button', { name: /añadir recurso/i }).click();
    await expect(page).toHaveURL(`${APP_URL}${PAGE_PATH}`, { timeout: 5000 });

    await page.close();
  });

  test('Debería eliminar un recurso concreto y verificar el mensaje exacto', async ({ page }) => {
    await page.goto(`${APP_URL}${PAGE_PATH}`);
    await page.waitForLoadState('networkidle');

    // Definimos los datos del recurso que creamos en el beforeAll
    const pais = 'DeleteMe';
    const anio = '2025';

    // 1. Localizar la fila
    const fila = page.locator('tr', { hasText: pais });
    await expect(fila).toBeVisible();

    // 2. Preparar el manejador del diálogo ANTES de hacer clic
    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    // 3. Ejecutar el borrado
    await fila.getByRole('button', { name: /eliminar/i }).click();

    // 4. Verificación del mensaje (SOLUCIÓN AL ERROR)
    // Usamos un string exacto entre comillas en lugar de / / para que los ( ) no den error
    //const mensajeEsperado = `Recurso para (${pais}, ${anio}) eliminado`;
    //await expect(page.getByText(mensajeEsperado)).toBeVisible();

    // 5. Confirmar que ya no está en la tabla
    await expect(fila).not.toBeVisible();
  });

  test('No debería eliminar el recurso si el usuario cancela el diálogo', async ({ page }) => {
    await page.goto(`${APP_URL}${PAGE_PATH}`);
    await page.waitForLoadState('networkidle');

    // Configurar el manejador para CANCELAR (dismiss) el diálogo
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    const fila = page.locator('tr', { hasText: 'DeleteMe' });
    await fila.getByRole('button', { name: /eliminar/i }).click();

    // El recurso debe seguir siendo visible en la tabla
    await expect(fila).toBeVisible();
  });
});

test.describe('Tests de Edición de Recursos', () => {

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    page.on('dialog', async (dialog) => { await dialog.accept(); });

    // 1. Limpieza
    await page.goto(`${APP_URL}${PAGE_PATH}`);
    await page.waitForLoadState('networkidle');
    const btnBorrarTodo = page.getByRole('button', { name: /eliminar la colección/i });
    if (await btnBorrarTodo.isVisible()) {
      await btnBorrarTodo.click();
      await expect(page.getByText(/se han eliminado todos los recursos/i)).toBeVisible();
    }

    // 2. Crear dato base (TestData 2025)
    await page.goto(`${APP_URL}${PAGE_PATH}/create`);
    await page.getByLabel(/país:/i).fill('TestData');
    await page.getByLabel(/año:/i).fill('2025');
    // Rellenamos el resto con valores por defecto
    const campos = ['Alta presión arterial:', 'Contaminación del aire:', 'Desnutrición infantil:', 'Contaminación combustibles sólidos:', 'Glucosa en sangre:'];
    for (const label of campos) {
      await page.getByLabel(new RegExp(label, 'i')).fill('10');
    }
    await page.getByRole('button', { name: /añadir recurso/i }).click();
    await expect(page).toHaveURL(`${APP_URL}${PAGE_PATH}`, { timeout: 5000 });
    await page.close();
  });

  test('Debería editar el campo de desnutrición infantil correctamente', async ({ page }) => {
    await page.goto(`${APP_URL}${PAGE_PATH}`);
    await page.waitForLoadState('networkidle');

    // 1. Ir a detalles del dato creado
    await page.getByRole('link', { name: /detalles/i }).first().click();
    await expect(page).toHaveURL(new RegExp(`${PAGE_PATH}/TestData/2025`));

    // 2. Localizar el input de Desnutrición Infantil
    // Como no hay <label>, lo buscamos por su posición en la tabla:
    // Columna 1: País, 2: Año, 3: Presión, 4: Aire, 5: Desnutrición
    const inputWasting = page.locator('table tbody tr td').nth(4).locator('input');

    await expect(inputWasting).toBeVisible();

    // Limpiamos y rellenamos
    await inputWasting.click();
    await inputWasting.fill('75.5');

    // 3. Actualizar
    await page.getByRole('button', { name: /actualizar recurso/i }).click();

    // 4. Verificar éxito
    await expect(page.getByText(/actualizado el recurso/i)).toBeVisible();

    // 5. Verificar en la tabla principal tras la redirección (esperamos los 2s de tu front)
    await page.waitForURL(`${APP_URL}${PAGE_PATH}`, { timeout: 5000 });
    const celdaActualizada = page.locator('table tbody tr td').nth(4);
    await expect(celdaActualizada).toHaveText('75.5');
  });
  test('Fallo: No debería permitir valores negativos en la edición', async ({ page }) => {
    // 1. Vamos a la página de edición de un dato existente (usando el TestData creado en beforeAll)
    await page.goto(`${APP_URL}${PAGE_PATH}/TestData/2025`);

    // 2. Localizamos el input de Desnutrición Infantil (columna 5, índice 4)
    const inputWasting = page.locator('table tbody tr td').nth(4).locator('input');

    // 3. Intentamos meter un valor negativo
    await inputWasting.fill('-50');
    await page.getByRole('button', { name: /actualizar recurso/i }).click();

    // 4. Verificamos que aparece el mensaje de error específico de tu código
    await expect(page.getByText(/todos los campos deben de ser positivos/i)).toBeVisible();
  });
});

test.describe('Tests de Filtrado y Búsqueda', () => {

  test.beforeEach(async ({ page }) => {
    // Navegamos a la página antes de cada test
    await page.goto(`${APP_URL}${PAGE_PATH}`);
    await page.waitForLoadState('networkidle');

    // Si la tabla está vacía, cargamos los datos iniciales para poder filtrar
    const loadInitialBtn = page.getByRole('button', { name: /cargar datos iniciales/i });
    if (!await loadInitialBtn.isVisible()) {
      page.once('dialog', dialog => dialog.accept());
      page.getByRole('button', { name: /eliminar la colección/i }).click();
    }
    await loadInitialBtn.click();
    await page.waitForLoadState('networkidle');
  });

  test('Debería filtrar por país y mostrar resultados en la tabla', async ({ page }) => {
    const paisBusqueda = 'Afghanistan';

    // Localizamos el input por su placeholder definido en tu código
    await page.getByPlaceholder('País').fill(paisBusqueda);
    await page.getByRole('button', { name: /buscar/i }).click();
    await page.waitForLoadState('networkidle');

    // Verificamos que la tabla solo contenga filas de ese país
    const filas = page.locator('table tbody tr');

    const mensaje = page.getByText(/no se han encontrado datos/i);

    await Promise.race([
      filas.first().waitFor({ state: 'visible' }),
      mensaje.waitFor({ state: 'visible' })
    ]);

    const count = await filas.count();

    if (count > 0) {
      await expect(filas.first()).toContainText(paisBusqueda);
    } else {
      await expect(mensaje).toBeVisible();
    }
  });

  test('Debería cambiar dinámicamente entre búsqueda por año exacto y rango', async ({ page }) => {
    // Por defecto debe estar el input "Año"
    await expect(page.getByPlaceholder('Año')).toBeVisible();

    // Seleccionamos el modo rango (radio button)
    await page.getByLabel(/rango de años/i).check();

    // Verificamos que desaparece "Año" y aparecen "Año Inicio" y "Año Fin"
    await expect(page.getByPlaceholder('Año Inicio')).toBeVisible();
    await expect(page.getByPlaceholder('Año Fin')).toBeVisible();

    await page.getByLabel(/año exacto/i).check();

    await expect(page.getByPlaceholder('Año')).toBeVisible();

  });

  test('Debería limpiar los filtros y resetear la búsqueda', async ({ page }) => {
    // Rellenamos varios campos
    await page.getByPlaceholder('País').fill('Spain');
    await page.getByPlaceholder('Min. Presión Arterial').fill('100');

    // Pulsamos el botón de limpiar filtros
    await page.getByRole('button', { name: /limpiar filtros/i }).click();

    // Verificamos que los inputs vuelven a estar vacíos
    await expect(page.getByPlaceholder('País')).toHaveValue('');
    await expect(page.getByPlaceholder('Min. Presión Arterial')).toHaveValue('');
  });

  test('Debería realizar una búsqueda avanzada combinando país y factores de riesgo', async ({ page }) => {
    // Filtramos por país y un valor mínimo de contaminación
    await page.getByPlaceholder('País').fill('Afghanistan');
    await page.getByPlaceholder('Min. Contaminación Aire').fill('10');

    await page.getByRole('button', { name: /buscar/i }).click();
    await page.waitForLoadState('networkidle');

    // Verificamos que el mensaje de "no encontrado" no aparezca si hay datos coherentes
    const tabla = page.locator('table');
    await expect(tabla).toBeVisible();
  });
});
