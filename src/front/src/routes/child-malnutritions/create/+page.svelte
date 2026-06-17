<script>
  import { goto } from '$app/navigation';

  let country = $state('');
  let year = $state('');
  let region = $state('');
  let stunting_rate = $state('');
  let wasting_rate = $state('');
  let overweight_rate = $state('');
  let underweight_rate = $state('');
  let message = $state('');
  let messageType = $state('success');

  const API = '/api/v2/child-malnutritions';

  async function save() {
    if (!country || !year || !region) {
      message = 'País, año y región son obligatorios';
      messageType = 'error';
      return;
    }
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        country,
        year: Number(year),
        region,
        stunting_rate: parseFloat(stunting_rate) || 0,
        wasting_rate: parseFloat(wasting_rate) || 0,
        overweight_rate: parseFloat(overweight_rate) || 0,
        underweight_rate: parseFloat(underweight_rate) || 0
      })
    });
    if (res.ok || res.status === 201) {
      message = 'Recurso creado correctamente';
      messageType = 'success';
      setTimeout(() => goto('/child-malnutritions'), 800);
    } else if (res.status === 409) {
      message = `Ya existe un registro para ${country} en el año ${year}`;
      messageType = 'error';
    } else if (res.status === 400) {
      message = 'Datos incorrectos, verifica los campos obligatorios';
      messageType = 'error';
    } else {
      message = 'Error al crear el recurso';
      messageType = 'error';
    }
  }
</script>

<main>
  <h2>Añadir nuevo registro</h2>

  {#if message}
    <div class="alert {messageType}">{message}</div>
  {/if}

  <div class="form">
    <label>País *
      <input placeholder="País" bind:value={country} />
    </label>
    <label>Año *
      <input type="number" placeholder="Año" bind:value={year} />
    </label>
    <label>Región *
      <input placeholder="Región" bind:value={region} />
    </label>
    <label>Retraso en crecimiento - Stunting (%)
      <input type="number" step="0.01" placeholder="Tasa Stunting %" bind:value={stunting_rate} />
    </label>
    <label>Emaciación - Wasting (%)
      <input type="number" step="0.01" placeholder="Tasa Wasting %" bind:value={wasting_rate} />
    </label>
    <label>Sobrepeso - Overweight (%)
      <input type="number" step="0.01" placeholder="Tasa Overweight %" bind:value={overweight_rate} />
    </label>
    <label>Bajo peso - Underweight (%)
      <input type="number" step="0.01" placeholder="Tasa Underweight %" bind:value={underweight_rate} />
    </label>

    <div class="buttons">
      <button onclick={save}>Guardar</button>
      <a href="/child-malnutritions"><button type="button">← Volver</button></a>
    </div>
  </div>
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
