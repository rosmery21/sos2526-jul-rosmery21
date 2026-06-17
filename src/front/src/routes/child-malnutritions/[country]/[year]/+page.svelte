<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  const API = '/api/v2/child-malnutritions';
  let country = page.params.country;
  let year = page.params.year;
  let resource = $state(null);
  let region = $state('');
  let stunting_rate = $state('');
  let wasting_rate = $state('');
  let overweight_rate = $state('');
  let underweight_rate = $state('');
  let message = $state('');
  let messageType = $state('success');

  async function load() {
    const res = await fetch(`${API}/${encodeURIComponent(country)}/${year}`);
    if (res.ok) {
      resource = await res.json();
      region = resource.region;
      stunting_rate = resource.stunting_rate;
      wasting_rate = resource.wasting_rate;
      overweight_rate = resource.overweight_rate;
      underweight_rate = resource.underweight_rate;
    } else {
      message = 'No se encontró el recurso';
      messageType = 'error';
    }
  }

  async function update() {
    const res = await fetch(`${API}/${encodeURIComponent(country)}/${year}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        country,
        year: parseInt(year),
        region,
        stunting_rate: parseFloat(stunting_rate) || 0,
        wasting_rate: parseFloat(wasting_rate) || 0,
        overweight_rate: parseFloat(overweight_rate) || 0,
        underweight_rate: parseFloat(underweight_rate) || 0
      })
    });
    if (res.ok) {
      message = 'Recurso actualizado correctamente';
      messageType = 'success';
      setTimeout(() => goto('/child-malnutritions'), 800);
    } else if (res.status === 400) {
      message = 'Datos incorrectos, verifica los campos';
      messageType = 'error';
    } else if (res.status === 404) {
      message = 'No se encontró el recurso a actualizar';
      messageType = 'error';
    } else {
      message = 'Error al actualizar el recurso';
      messageType = 'error';
    }
  }

  onMount(load);
</script>

<main>
  <h2>Editar registro</h2>
  <p><b>País:</b> {country} — <b>Año:</b> {year}</p>

  {#if message}
    <div class="alert {messageType}">{message}</div>
  {/if}

  {#if resource}
    <div class="form">
      <label>Región
        <input placeholder="Región" bind:value={region} />
      </label>
      <label>Retraso en crecimiento - Stunting (%)
        <input type="number" step="0.01" placeholder="Stunting %" bind:value={stunting_rate} />
      </label>
      <label>Emaciación - Wasting (%)
        <input type="number" step="0.01" placeholder="Wasting %" bind:value={wasting_rate} />
      </label>
      <label>Sobrepeso - Overweight (%)
        <input type="number" step="0.01" placeholder="Overweight %" bind:value={overweight_rate} />
      </label>
      <label>Bajo peso - Underweight (%)
        <input type="number" step="0.01" placeholder="Underweight %" bind:value={underweight_rate} />
      </label>

      <div class="buttons">
        <button onclick={update}>Guardar cambios</button>
        <a href="/child-malnutritions"><button type="button">← Volver</button></a>
      </div>
    </div>
  {:else}
    <p>Cargando...</p>
  {/if}
</main>

<style>
  main { padding: 2rem; max-width: 500px; margin: 0 auto; }
  h2 { color: #1e3a5f; }
  .form { display: flex; flex-direction: column; gap: 1rem; }
  label { display: flex; flex-direction: column; gap: 0.3rem; font-weight: bold; color: #374151; }
  input { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem; }
  .buttons { display: flex; gap: 1rem; margin-top: 1rem; }
  button { padding: 0.5rem 1.2rem; border: none; border-radius: 6px; cursor: pointer; background: #2563eb; color: white; font-size: 1rem; }
  button:hover { background: #1d4ed8; }
  .alert { padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-weight: bold; }
  .alert.success { background: #d1fae5; color: #065f46; }
  .alert.error { background: #fee2e2; color: #991b1b; }
</style>
