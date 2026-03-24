import { test, expect } from '@playwright/test';

test('El frontend carga la lista de pandemias correctamente', async ({ page }) => {
  await page.goto('http://localhost:3000/pandemics'); 

  const botonAdd = page.locator('text=Añadir nuevo dato');
  await expect(botonAdd).toBeVisible();
});