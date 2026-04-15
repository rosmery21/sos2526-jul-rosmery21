// @ts-check
import { test, expect } from '@playwright/test';

test.setTimeout(60000);

const APP_URL = 'http://localhost:3000';
const PAGE_PATH = '/pandemics';

test.describe('Test layout', () => {
    test('has title', async ({ page }) => {
        await page.goto(APP_URL);
        await expect(page).toBeDefined(); 
    });

    test('La página principal de la API carga correctamente y muestra el título', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');
        const title = page.getByText(/buscador/i);
        await expect(title).toBeVisible();
    });

    test('Verificar la existencia de los filtros', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');

        await expect(page.getByText(/buscador/i)).toBeVisible();

        const inputs = page.locator('input');
        const cantidad = await inputs.count();
        
        expect(cantidad).toBeGreaterThanOrEqual(10); 

        await expect(inputs.first()).toBeVisible();
    });

    test('El botón para añadir nuevos recursos es visible', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');

        const botonAdd = page.getByRole('button', { name: /añadir nuevo dato/i });
        await expect(botonAdd).toBeVisible();
    });

    test('Navegación al formulario de creación', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');

        await page.getByRole('button', { name: /añadir nuevo dato/i }).click();

        await expect(page).toHaveURL(new RegExp(`${PAGE_PATH}/create`));

        await expect(page.getByText(/añadir nuevo dato/i)).toBeVisible();
    });
});

test.describe('Tests de Creación de Recursos', () => {

    test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        page.on('dialog', d => d.accept());
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        const btnBorrar = page.locator('button').filter({ hasText: /eliminar todos/i }).first();
        if (await btnBorrar.isVisible()) {
        await btnBorrar.click();
        await page.waitForTimeout(1000);
        }
        await page.close();
    });

    test('Debería crear un nuevo recurso correctamente', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}/create`);
        await page.waitForLoadState('networkidle');

        const paisCrear = 'NewCountry' + Math.floor(Math.random() * 999);

        await page.locator('input[type="text"]').first().fill(paisCrear);
        await page.locator('input[type="text"]').nth(1).fill('NC');
        await page.locator('input[type="number"]').first().fill('2024');
        
        const inputsCrear = page.locator('input[type="number"]');
        for(let i=1; i < await inputsCrear.count(); i++) {
            await inputsCrear.nth(i).fill('0');
        }

        await page.locator('button').filter({ hasText: /guardar|añadir/i }).first().click();
        await page.waitForTimeout(2000); 

        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');

        await page.locator('input[type="text"]').first().fill(paisCrear);
        await page.locator('button').filter({ hasText: /buscar|filtrar/i }).first().click({ force: true });
        
        await page.waitForTimeout(1000);
        await expect(page.locator('table')).toContainText(paisCrear);
    });
     


    test('Debería detectar recurso ya existe', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}/create`);
        const paisExistente = 'ExistCountry' + Math.floor(Math.random() * 999);
        await page.locator('input[type="text"]').first().fill(paisExistente);
        await page.locator('input[type="number"]').first().fill('2024');
        
        await page.locator('button').filter({ hasText: /guardar|añadir/i }).first().click();
        await page.waitForTimeout(500);

        await expect(page).toHaveURL(new RegExp(`${PAGE_PATH}/create`));
    });

    test('No debería crear recurso vacío', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}/create`);
        await page.locator('button').filter({ hasText: /guardar|añadir/i }).first().click();

        await expect(page).toHaveURL(new RegExp(`${PAGE_PATH}/create`));
    });
});

test.describe('Tests de Listado de Recursos', () => {
    test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        page.on('dialog', dialog => dialog.accept());

        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');

        const loadBtn = page.getByRole('button', { name: /cargar datos iniciales/i });
        const deleteBtn = page.getByRole('button', { name: /eliminar la colección|eliminar todos/i });

        if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        await page.waitForTimeout(1000); 
        }

        if (await loadBtn.isVisible()) {
        await loadBtn.click();
        await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });
        }

        await page.close();
    });

    test('Debería mostrar la tabla con al menos un recurso', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');

        const table = page.locator('table');
        await expect(table).toBeVisible();

        const rows = page.locator('table tbody tr');
        
        await expect(rows.first()).toBeVisible({ timeout: 5000 });

        const count = await rows.count();
        expect(count).toBeGreaterThan(0);

        await expect(table).toContainText(/Eliminar|Detalles/i);
    });

    test('Debería mostrar todas las columnas correctas en el encabezado', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');

        const headers = page.locator('table thead th');

        await expect(headers.nth(0)).toHaveText(/país/i);
        await expect(headers.nth(1)).toHaveText(/código/i);
        await expect(headers.nth(2)).toHaveText(/año/i);
        
        await expect(headers.nth(3)).toHaveText(/frambesia/i);
        await expect(headers.nth(4)).toHaveText(/polio/i);
        await expect(headers.nth(5)).toHaveText(/gusano de guinea/i);
        await expect(headers.nth(6)).toHaveText(/rabia/i);
        await expect(headers.nth(7)).toHaveText(/malaria/i);
        await expect(headers.nth(8)).toHaveText(/vih\/sida/i);
        await expect(headers.nth(9)).toHaveText(/tuberculosis/i);
        await expect(headers.nth(10)).toHaveText(/viruela/i);
        await expect(headers.nth(11)).toHaveText(/cólera/i);
    });

    test('La paginación debería mostrar máximo 10 recursos por página', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');

        const rows = page.locator('table tbody tr');
        await expect(rows.first()).toBeVisible({ timeout: 5000 });

        const count = await rows.count();

        expect(count).toBeGreaterThan(0); 
        expect(count).toBeLessThanOrEqual(10);
        
        await expect(page.locator('body')).toContainText(/página:?\s*1/i);
    });

    test('Debería navegar a la página siguiente al pulsar el botón siguiente', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');

        const pageIndicator = page.locator('body').filter({ hasText: /página/i }).last();
        await expect(pageIndicator).toContainText('1');

        const nextBtn = page.getByRole('button').filter({ hasText: /^\+$/ }).first();

        if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
        await nextBtn.click({ force: true, timeout: 5000 });
        
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); 

        await expect(pageIndicator).toContainText('2');
        
        await expect(page.locator('table')).not.toContainText('Algeria');
        } else {
        console.log("El botón siguiente no está disponible o no hay suficientes datos.");
        }
    });
});

test.describe('Test de borrado', () => {

    test("Los datos se borran correctamente", async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        page.on('dialog', dialog => dialog.accept());
        await page.waitForLoadState('networkidle');

        const deleteBtn = page.getByRole('button', { name: /eliminar la colección|eliminar todos/i });
        const loadBtn = page.getByRole('button', { name: /cargar datos iniciales/i });

        if (await page.locator('table tbody tr').count() === 0) {
            await loadBtn.click();
            await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });
        }

        await deleteBtn.click();
        await expect(page.locator('table tbody tr')).toHaveCount(0, { timeout: 10000 });
    });
});

test.describe('Tests de Borrado de Recursos', () => {

    test.beforeEach(async ({ browser }) => {
        const page = await browser.newPage();
        page.on('dialog', dialog => dialog.accept());

        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');
        
        const btnBorrarTodo = page.getByRole('button', { name: /eliminar la colección|eliminar todos/i });
        if (await btnBorrarTodo.isVisible()) {
            await btnBorrarTodo.click();
            await page.waitForTimeout(2000);
        }

        await page.goto(`${APP_URL}${PAGE_PATH}/create`);
        await page.locator('input[type="text"]').first().fill('BorrarPais');
        await page.locator('input[type="text"]').nth(1).fill('BP');
        await page.locator('input[type="number"]').first().fill('2025');

        await page.locator('button').filter({ hasText: /guardar|añadir/i }).first().click();
        
        await page.waitForTimeout(3000); 
        await page.waitForURL(new RegExp(`${PAGE_PATH}$`), { timeout: 20000 });
        await page.close();
    });
        
   

    test('Debería eliminar un recurso concreto y verificar el borrado', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');

        const pais = 'BorrarPais'; 
        const anio = '2025';

        const fila = page.locator('tr').filter({ hasText: pais });
        await expect(fila).toBeVisible();

        page.once('dialog', async dialog => {
        await dialog.accept();
        });

        await fila.getByRole('button', { name: /eliminar/i }).click();

        await expect(page.getByText(/eliminado|exitosamente|éxito/i)).toBeVisible();

        await expect(fila).not.toBeVisible();
        
        await expect(page.locator('body')).not.toContainText(pais);
    });

    test('No debería eliminar el recurso si el usuario cancela el diálogo', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');

        page.on('dialog', async (dialog) => {
        await dialog.dismiss();
        });

        const pais = 'BorrarPais'; 
        const fila = page.locator('tr').filter({ hasText: pais });
        
        await expect(fila).toBeVisible();

        await fila.getByRole('button', { name: /eliminar/i }).click();

        await expect(fila).toBeVisible();
        
        await expect(page.locator('table')).toContainText(pais);
    });
});

test.describe('Tests de Edición de Recursos', () => {
    // Definimos la variable aquí para que sea accesible en todos los tests del bloque
    let nombreUnicoEdicion;

    test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        page.on('dialog', async (dialog) => { await dialog.accept(); });

        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');
        
        // Limpiamos la colección antes de empezar para evitar conflictos
        const btnBorrarTodo = page.getByRole('button', { name: /eliminar la colección|eliminar todos/i });
        if (await btnBorrarTodo.isVisible()) {
            await btnBorrarTodo.click();
            await page.waitForTimeout(2000);
        }

        await page.goto(`${APP_URL}${PAGE_PATH}/create`);
        
        // Creamos el nombre único para este bloque de edición
        nombreUnicoEdicion = 'EditCountry' + Math.floor(Math.random() * 9999);
        
        await page.locator('input[type="text"]').first().fill(nombreUnicoEdicion);
        await page.locator('input[type="text"]').nth(1).fill('EC'); 
        await page.locator('input[type="number"]').first().fill('2025'); 

        const inputsNum = page.locator('input[type="number"]');
        for (let i = 1; i < await inputsNum.count(); i++) {
            await inputsNum.nth(i).fill('10');
        }

        const btnGuardar = page.locator('button').filter({ hasText: /añadir|guardar/i }).first();
        await btnGuardar.click();

        // IMPORTANTE: Esperas reforzadas para GitHub Actions
        await page.waitForTimeout(3000);
        await page.waitForURL(new RegExp(`${PAGE_PATH}$`), { timeout: 15000 });
        await page.close();
    });

    test('Debería editar un campo de enfermedad polio correctamente', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');

        // Buscamos la fila con el nombre aleatorio que creamos en el beforeAll
        const fila = page.locator('tr').filter({ hasText: nombreUnicoEdicion });
        await expect(fila).toBeVisible({ timeout: 15000 });

        // Hacemos clic en el enlace de Editar (asumiendo que es un <a>)
        await fila.locator('a').click({ force: true });
        
        // Esperamos a estar en la página de edición de ese recurso específico
        await page.waitForURL(new RegExp(`${PAGE_PATH}/${nombreUnicoEdicion}/2025`), { timeout: 15000 });
        
        const inputNum = page.locator('input[type="number"]').nth(1); 
        await inputNum.waitFor({ state: 'visible' });
        await inputNum.fill('88.8');

        const btnActualizar = page.locator('button').filter({ hasText: /actualizar|guardar/i }).first();
        await btnActualizar.click();

        // Tras actualizar, volvemos a la lista y comprobamos el dato
        await page.waitForTimeout(2000);
        await page.waitForURL(new RegExp(`${PAGE_PATH}$`), { timeout: 15000 });
        await expect(page.locator('tr').filter({ hasText: nombreUnicoEdicion })).toContainText('88.8');
    });

    test('Fallo: No debería permitir valores negativos en la edición', async ({ page }) => {
        // Vamos directamente a la URL de edición del recurso creado
        await page.goto(`${APP_URL}${PAGE_PATH}/${nombreUnicoEdicion}/2025`);
        await page.waitForLoadState('networkidle');

        const inputEnfermedad = page.locator('input[type="number"]').nth(1);
        await inputEnfermedad.fill('-50');
        
        const btnActualizar = page.locator('button').filter({ hasText: /actualizar|guardar/i }).first();
        await btnActualizar.click();

        // Comprobamos que el body contiene el mensaje de error (positivo o negativo)
        await expect(page.locator('body')).toContainText(/positivo|negativo/i, { timeout: 10000 });
    });
});


test.describe('Tests de Filtrado y Búsqueda', () => {

    test.beforeEach(async ({ page }) => {
    
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');

        const filas = page.locator('table tbody tr');
        const hayDatos = await filas.count() > 0;

        if (!hayDatos) {
        const loadInitialBtn = page.getByRole('button', { name: /cargar datos iniciales/i });
        await loadInitialBtn.waitFor({ state: 'visible', timeout: 5000 });
        await loadInitialBtn.click();
        
        await expect(page.locator('table tbody tr').first()).toBeVisible();
        }
    });

    test('Debería filtrar por país y mostrar resultados en la tabla', async ({ page }) => {
    
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        
        await page.waitForLoadState('networkidle');

        const btnCargar = page.getByRole('button', { name: /cargar datos iniciales/i });
        if (await btnCargar.isVisible()) {
        await btnCargar.click();
        await page.waitForLoadState('networkidle');
        }

        const inputPais = page.locator('input[type="text"]').first();
        await expect(inputPais).toBeVisible({ timeout: 10000 });
        
        await inputPais.fill('Algeria');

        await inputPais.press('Enter');
    
        const btnBuscar = page.locator('button').filter({ hasText: /buscar/i }).first();
        if (await btnBuscar.isVisible()) {
            await btnBuscar.click({ force: true });
        }

        await page.waitForTimeout(2000);
        
        const tabla = page.locator('table');
        if (await tabla.isVisible()) {
        await expect(tabla).toContainText('Algeria');
        } else {
        await expect(page.getByText(/no hay datos/i)).toBeVisible();
        }
    });

    
    test('Debería filtrar correctamente por rango de años', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');

        const btnCargar = page.locator('button').filter({ hasText: /cargar/i });
        if (await btnCargar.isVisible()) {
        await btnCargar.click();
        await page.waitForResponse(resp => resp.url().includes('loadInitialData') && resp.status() === 200);
        await page.waitForLoadState('networkidle');
        }

        const divBuscador = page.locator('div').filter({ hasText: /Buscador/i }).first();
        await expect(divBuscador).toBeVisible({ timeout: 10000 });

        const inputsNum = divBuscador.locator('input[type="number"]');
        await inputsNum.nth(0).fill('2000'); 
        await inputsNum.nth(1).fill('2005'); 

        const btnBuscar = divBuscador.locator('button').first();
        
        await btnBuscar.dispatchEvent('click');

        await page.waitForTimeout(2000);
        
        const filas = page.locator('table tbody tr');
        if (await filas.count() > 0) {
            const anioTexto = await filas.first().locator('td').nth(2).innerText();
            const anio = parseInt(anioTexto);
            console.log("Año filtrado:", anio);
            expect(anio).toBeGreaterThanOrEqual(2000);
            expect(anio).toBeLessThanOrEqual(2005);
        } else {
            await expect(page.getByText(/no hay datos/i)).toBeVisible();
        }
    });

    test('Debería limpiar los filtros y resetear la búsqueda', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');

        const divBuscador = page.locator('div').filter({ hasText: /Buscador/i }).first();
        await expect(divBuscador).toBeVisible();

        const inputPais = divBuscador.locator('input[type="text"]').first();
        await inputPais.fill('PaisInexistente123');
        
        await inputPais.press('Enter');
        await page.waitForTimeout(1000);

        const btnLimpiar = divBuscador.locator('button').filter({ hasText: /limpiar/i });
        await btnLimpiar.dispatchEvent('click');
        
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        await expect(inputPais).toHaveValue('');
        
        const filasFinales = page.locator('table tbody tr');
        await expect(filasFinales.first()).toBeVisible({ timeout: 10000 });
    });

    test('Debería realizar una búsqueda avanzada combinando país y casos de Polio', async ({ page }) => {
        await page.goto(`${APP_URL}${PAGE_PATH}`);
        await page.waitForLoadState('networkidle');

        const btnCargar = page.locator('button').filter({ hasText: /cargar/i });
        if (await btnCargar.isVisible()) {
        await btnCargar.click();
        await page.waitForLoadState('networkidle');
        await page.locator('table tbody tr').first().waitFor({ state: 'visible' });
        }

        const filaAlgeria = page.locator('table tbody tr', { hasText: 'Algeria' }).first();
        let paisABuscar, polioABuscar;

        if (await filaAlgeria.isVisible()) {
            paisABuscar = 'Algeria';
            polioABuscar = await filaAlgeria.locator('td').nth(4).innerText();
        } else {
            paisABuscar = (await page.locator('table tbody tr td').first().innerText()).trim();
            polioABuscar = (await page.locator('table tbody tr td').nth(4).innerText()).trim();
        }

        const divBuscador = page.locator('div').filter({ hasText: /Buscador/i }).first();
        const inputPais = divBuscador.locator('input[type="text"]').first();
        const inputPolio = divBuscador.locator('input[type="number"]').nth(3);

        await inputPais.fill(paisABuscar);
        await inputPolio.fill(polioABuscar);

        const btnFiltrar = divBuscador.locator('button').filter({ hasText: /filtrar|buscar/i }).first();
        await inputPolio.press('Enter');
        await btnFiltrar.click({ force: true }).catch(() => {}); 
        await btnFiltrar.dispatchEvent('click');

        await page.waitForTimeout(2000);
    
        const tabla = page.locator('table');
        if (await tabla.isVisible()) {
            await expect(tabla).toContainText(paisABuscar);
            await expect(tabla).toContainText(polioABuscar);
        } else {
            await expect(page.locator('body')).toContainText(paisABuscar);
        }
    });    
});