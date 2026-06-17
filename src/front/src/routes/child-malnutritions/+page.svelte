<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let data = $state([]);
  let API = '/api/v2/child-malnutritions';
  let page = $state(0);
  let isLoading = $state(false);
  let message = $state('');
  let messageType = $state('success');

  let searchFilters = $state({ country: '', region: '', from: '', to: '' });

  async function loadData() {
    isLoading = true;
    try {
      const params = new URLSearchParams({ offset: (page * 10).toString(), limit: '10' });
      if (searchFilters.country) params.append('country', searchFilters.country);
      if (searchFilters.region) params.append('region', searchFilters.region);
      if (searchFilters.from) params.append('from', searchFilters.from);
      if (searchFilters.to) params.append('to', searchFilters.to);

      const res = await fetch(`${API}?${params}`);
      if (res.ok) {
        data = await res.json();
        if (!Array.isArray(data)) data = [data];
      } else {
        data = [];
        showMessage('Error al cargar los datos', 'error');
      }
    } finally {
      isLoading = false;
    }
  }

  async function loadInitialData() {
    const res = await fetch(`${API}/loadInitialData`);
    if (res.ok) {
      showMessage('Datos iniciales cargados correctamente', 'success');
      page = 0;
      await loadData();
    } else if (res.status === 409) {
      showMessage('Los datos iniciales ya estaban cargados', 'error');
    } else {
      showMessage('Error al cargar los datos iniciales', 'error');
    }
  }

  async function deleteOne(country, year) {
    if (!confirm(`¿Eliminar el registro de ${country} (${year})?`)) return;
    const res = await fetch(`${API}/${encodeURIComponent(country)}/${year}`, { method: 'DELETE' });
    if (res.ok) {
      showMessage('Registro eliminado correctamente', 'success');
      await loadData();
    } else if (res.status === 404) {
      showMessage(`No se encontró el registro de ${country} (${year})`, 'error');
    } else {
      showMessage('Error al eliminar el registro', 'error');
    }
  }

  async function deleteAll() {
    if (!confirm('¿Eliminar TODOS los registros?')) return;
    const res = await fetch(API, { method: 'DELETE' });
    if (res.ok) {
      showMessage('Todos los registros eliminados correctamente', 'success');
      data = [];
    } else {
      showMessage('Error al eliminar todos los registros', 'error');
    }
  }

  function search() {
    page = 0;
    showMessage('Búsqueda realizada correctamente', 'success');
    loadData();
  }

  function clearSearch() {
    searchFilters = { country: '', region: '', from: '', to: '' };
    page = 0;
    showMessage('Filtros limpiados', 'success');
    loadData();
  }

  function showMessage(msg, type) {
    message = msg;
    messageType = type;
    setTimeout(() => message = '', 4000);
  }

  onMount(async () => {
    if (browser) await loadData();
  });
</script>

<main>
  <h1>Desnutrición Infantil</h1>

  <section class="filters">
    <h3>Filtros de búsqueda</h3>
    <div class="filter-row">
      <input placeholder="País" bind:value={searchFilters.country} />
      <input placeholder="Región" bind:value={searchFilters.region} />
      <input type="number" placeholder="Año desde" bind:value={searchFilters.from} />
      <input type="number" placeholder="Año hasta" bind:value={searchFilters.to} />
      <button onclick={search}>Buscar</button>
      <button onclick={clearSearch}>Limpiar filtros</button>
    </div>
  </section>

  {#if message}
    <div class="alert {messageType}">{message}</div>
  {/if}

  <div class="actions">
    <a href="/child-malnutritions/create"><button>➕ Añadir nuevo registro</button></a>
    <button onclick={loadInitialData}>📂 Cargar datos iniciales</button>
    <button class="danger" onclick={deleteAll}>Eliminar todo</button>
  </div>

  {#if isLoading}
    <p>Cargando...</p>
  {:else if data.length === 0}
    <p>No se han encontrado datos con los filtros seleccionados.</p>
  {:else}
    <table>
      <thead>
        <tr>
          <th>País</th>
          <th>Año</th>
          <th>Región</th>
          <th>Retraso en crecimiento (%)</th>
          <th>Emaciación (%)</th>
          <th>Sobrepeso (%)</th>
          <th>Bajo peso (%)</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {#each data as item}
          <tr>
            <td>{item.country}</td>
            <td>{item.year}</td>
            <td>{item.region}</td>
            <td>{item.stunting_rate}</td>
            <td>{item.wasting_rate}</td>
            <td>{item.overweight_rate}</td>
            <td>{item.underweight_rate}</td>
            <td>
              <a href={`/child-malnutritions/${encodeURIComponent(item.country)}/${item.year}`}>
                <button>✏️ Editar</button>
              </a>
              <button class="danger" onclick={() => deleteOne(item.country, item.year)}>🗑️ Eliminar</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <div class="pagination">
      <button onclick={() => { page = Math.max(0, page - 1); loadData(); }} disabled={page === 0}>
        ← Anterior
      </button>
      <span>Página {page + 1}</span>
      <button onclick={() => { page += 1; loadData(); }} disabled={data.length < 10}>
        Siguiente →
      </button>
    </div>
  {/if}
</main>

<style>
  main { padding: 1.5rem; max-width: 1200px; margin: 0 auto; }
  h1 { color: #1e3a5f; }
  .filters { background: #f0f4f8; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
  .filter-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
  input { padding: 0.4rem 0.8rem; border: 1px solid #ccc; border-radius: 6px; }
  button { padding: 0.4rem 0.9rem; border: none; border-radius: 6px; cursor: pointer; background: #2563eb; color: white; }
  button:hover { background: #1d4ed8; }
  button.danger { background: #dc2626; }
  button.danger:hover { background: #b91c1c; }
  button:disabled { background: #9ca3af; cursor: not-allowed; }
  .actions { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
  .alert { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-weight: bold; }
  .alert.success { background: #d1fae5; color: #065f46; }
  .alert.error { background: #fee2e2; color: #991b1b; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th { background: #1e3a5f; color: white; padding: 0.6rem; text-align: left; }
  td { padding: 0.5rem; border-bottom: 1px solid #e5e7eb; }
  tr:hover { background: #f9fafb; }
  .pagination { display: flex; align-items: center; gap: 1rem; margin-top: 1rem; }
  a { text-decoration: none; }
</style>
