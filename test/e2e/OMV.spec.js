import { test, expect } from '@playwright/test';

// Ajusta esta URL a la ruta real de tu listado y de tu formulario de creación
const LIST_URL = 'http://localhost:3000/protests';
const CREATE_URL = 'http://localhost:3000/protests/create'; // O donde tengas el formulario

test.describe('Pruebas E2E para el recurso Protests', () => {

  test('0. Borrar todos los recursos', async ({ page }) => {

    // Le decimos que acepte el dialogo de confirmación
    page.once('dialog', dialog => dialog.accept());

    await page.goto(LIST_URL);

    // Pulsa el boton de borrar todo
    const deleteAllButton = page.getByRole('button', { name: /Eliminar la colección/i });
    await deleteAllButton.click();

    // Esperar a que aparezca el mensaje de confirmación
    const mensajeH1 = page.getByRole('heading', { name: 'Datos eliminados correctamente', level: 1 });
    await expect(mensajeH1).toBeVisible();
    await expect(mensajeH1).toHaveText('Datos eliminados correctamente');
  });


  test('1. Crear un nuevo recurso de protesta', async ({ page }) => {
    await page.goto(CREATE_URL);

    // Rellenar el formulario de creacion
    await page.getByLabel('ID:').fill('101');
    await page.getByLabel('País:').fill('Spain');
    await page.getByLabel('Año:').fill('2025');
    await page.getByLabel('Región:').fill('Europe');
    await page.getByLabel('Protesta:').fill('1');
    await page.getByLabel('Violencia manifestantes:').fill('0');
    await page.getByLabel('Demanda manifestantes:').fill('Labor rights');
    await page.getByLabel('Respuesta del estado:').fill('Negotiation');
    await page.getByLabel('Score electoral:').fill('0.850');
    await page.getByLabel('Score liberal:').fill('0.750');
    await page.getByLabel('Score participativo:').fill('0.650');
    await page.getByLabel('Score deliberativo:').fill('0.900');
    await page.getByLabel('Score igualitario:').fill('0.800');
    await page.getByLabel('Score HDI:').fill('0.880');
    await page.getByLabel('Estado de violencia:').fill('0');
    await page.getByLabel('Prob. predicha:').fill('0.12345');

    // Enviamos el formulario
    await page.getByRole('button', { name: 'Añadir Protesta' }).click();

    // Esperamos a volver a la tabla
    await expect(page).toHaveURL(LIST_URL);
    // Buscamos que el recurso especificado se ha creado
    await expect(page.locator('table')).toContainText('Spain');
  });


  test('2. Borrar un recurso concreto', async ({ page }) => {
    await page.goto(LIST_URL);

    // Espera que la haya alguna fila en la tabla
    const filas = page.locator('table tbody tr');
    await expect(filas.first()).toBeVisible();

    // Guardamos el numero de filas
    const filasAntes = await filas.count();

    // Le decimos que acepte el dialogo de confirmación
    page.once('dialog', dialog => dialog.accept());

    // Pulsamos el boton de borrar
    const botonBorrar = page.getByLabel('borrar-recurso').first();
    await botonBorrar.click();

    // Miramos que el numero de filas sea 1 menos
    await expect(filas).toHaveCount(filasAntes - 1);
  });


  test('3. Cargar datos, listar y probar paginación', async ({ page }) => {
    await page.goto(LIST_URL);

    // Pulsar el boton de cargar datos
    await page.getByRole('button', { name: 'Cargar datos iniciales' }).click();

    // Esperamos a que la tabla sea visible
    const tabla = page.locator('table');
    await expect(tabla).toBeVisible();

    // Esperamos a que carguen las filas y comprobamos que haya más de 0
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // 
    const botonSiguiente = page.getByRole('button', { name: 'Siguiente' });
    await botonSiguiente.click();
    await expect(page.getByText('Página 2')).toBeVisible();
  });


  test('5. Editar un recurso en vista separada', async ({ page }) => {
    await page.goto(LIST_URL);

    // Pulsamos el boton de editar el primer recurso que haya
    await page.getByLabel('editar-recurso').first().click();

    // Esperamos a la ruta, el regex sirve para esperar una ruta con un id numerico
    await expect(page).toHaveURL(/\/protests\/\d+/);


    // Rellenamos lso campos del formulario
    const nuevoPais = 'País Editado E2E';
    const nuevoAño = '2028';
    await page.getByLabel('País').fill(nuevoPais);
    await page.getByLabel('Año').fill(nuevoAño);
    await page.getByLabel('Región').fill('Región de Test');

    // Pulsamos el boton de actualizar
    await page.getByRole('button', { name: 'Actualizar recurso' }).click();

    // Esperamos al mensaje de exito
    const msgExito = page.getByRole('heading', { name: /Actualizado correctamente/i });
    await expect(msgExito).toBeVisible();

    // Esperamos a que se nos rediraja
    await page.waitForURL(LIST_URL, { timeout: 5000 });

    // Miramos que los datos que hemos cambiado se hayan actualizado
    const tabla = page.locator('table');
    await expect(tabla).toContainText(nuevoPais);
    await expect(tabla).toContainText(nuevoAño);
  });

  test('6. Filtrar por pais', async ({ page }) => {
    await page.goto(LIST_URL);

    // Rellenamos el filtro con Spain
    const paisBuscado = 'Spain';
    await page.getByPlaceholder('País').fill(paisBuscado);
    await page.getByRole('button', { name: 'Recargar datos' }).click();

    // Buscamos todos los tr
    const filas = page.locator('table tbody tr');
    await expect(filas.first()).toBeVisible();

    // Guardamos cada fila en una variable para poder recorrerla
    const todosLosRegistros = await filas.all();

    // Para cada fila, comprobamos que tiene el texto Spain
    for (const fila of todosLosRegistros) {
        await expect(fila).toContainText(paisBuscado);
    }
});

  test('7. Filtrar por rango de años', async ({ page }) => {
    await page.goto(LIST_URL);

    // Marcamos el filtro de rango de años
    await page.getByLabel('Rango de años').check();

    // Rellenamos los filtros de rango de años
    const añoInicio = 2010;
    const añoFin = 2020;
    await page.getByPlaceholder('Año inicio').fill(añoInicio.toString());
    await page.getByPlaceholder('Año fin').fill(añoFin.toString());


    // Buscamos todos los tr
    const filas = page.locator('table tbody tr');
    await expect(filas.first()).toBeVisible();

    // Guardamos cada fila en una variable para poder recorrerla
    const todosLosRegistros = await filas.all();

    // Para cada fila, comprobamos que el año está en el rango esperado
    for (const fila of todosLosRegistros) {
      // Guardamos en textoAño el valor de la segunda columna
        const textoAño = await fila.locator('td').nth(2).innerText();

        // Pasamos el valor a entero
        const añoFila = parseInt(textoAño);

        // Comprobamos que el año está entre los valores esperados
        expect(añoFila).toBeGreaterThanOrEqual(añoInicio);
        expect(añoFila).toBeLessThanOrEqual(añoFin);
    }
});

});