import { test, expect } from '@playwright/test';

test('El frontend carga la lista de pandemias correctamente', async ({ page }) => {
  await page.goto('http://localhost:3000/pandemics'); 

  await page.waitForLoadState('networkidle');

  const botonAdd = page.getByRole('button', { name: /añadir/i }).first();
  
  await expect(botonAdd).toBeVisible();
});