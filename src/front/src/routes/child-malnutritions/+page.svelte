<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

let data = $state([]);
let API = '/api/v2/child-malnutritions';
let page = $state(0);
let isLoading = $state(false);
let searchFilters = $state({ country: '', year: '', region: '' });

  async function loadData() {
    isLoading = true;
    try {
      const params = new URLSearchParams({
        offset: (page * 10).toString(),
        limit: '10',
        ...Object.fromEntries(Object.entries(searchFilters).filter(([_, v]) => v !== ''))
      });
      const res = await fetch(`${API}?${params}`);
      if (res.ok) {
        data = await res.json();
        if (!Array.isArray(data)) data = [data];
      } else {
        data = [];
      }
    } finally {
      isLoading = false;
    }
  }

  async function loadInitialData() {
    await fetch(`${API}/loadInitialData`);
    page = 0;
    await loadData();
  }

  async function deleteOne(country, year) {
    if (!confirm('Eliminar?')) return;
    await fetch(`${API}/${encodeURIComponent(country)}/${year}`, { method: 'DELETE' });
    await loadData();
  }

  async function deleteAll() {
    if (!confirm('Eliminar todo?')) return;
    await fetch(API, { method: 'DELETE' });
    data = [];
  }

  function clearSearch() {
    searchFilters = { country: '', year: '', region: '' };
    page = 0;
    loadData();
  }

  onMount(async () => {
    if (browser) await loadData();
  });
</script>

<section>
  <h3>Filtros</h3>
  <input placeholder="País" bind:value={searchFilters.country} />
  <input placeholder="Año" bind:value={searchFilters.year} />
  <input placeholder="Región" bind:value={searchFilters.region} />
  <button on:click={() => { page = 0; loadData(); }}>Buscar</button>
  <button on:click={clearSearch}>Limpiar</button>
</section>

<div>
  <a href="/child-malnutritions/create">
    <button>Añadir nuevo dato</button>
  </a>
  <button on:click={loadInitialData}>Cargar datos iniciales</button>
</div>

<main>
  {#if isLoading}
    <p>Cargando...</p>
  {:else if data.length === 0}
    <p>No se han encontrado datos</p>
  {:else}
    <table>
      <thead>
        <tr>
          <th>País</th>
          <th>Año</th>
          <th>Región</th>
          <th>Tasa</th>
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
            <td>
              <a href={`/child-malnutritions/${encodeURIComponent(item.country)}/${item.year}`}>
                Editar
              </a>
              <button on:click={() => deleteOne(item.country, item.year)}>Eliminar</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <button on:click={() => { page = Math.max(0, page - 1); loadData(); }}>Anterior</button>
    <span>Página: {page + 1}</span>
    <button on:click={() => { page += 1; loadData(); }}>Siguiente</button>
    <button on:click={deleteAll}>Eliminar todo</button>
  {/if}
</main>