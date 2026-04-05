<script>
  import { goto } from '$app/navigation';
  let data = $state([]);
  let API = '/api/v2/child-malnutritions';
  let responseStatusCode = $state(0);
  let feedback = $state({ msg: '', type: '' });
  let page = $state(0);
  let isLoading = $state(false);

  let searchFilters = $state({ country: '', year: '', region: '' });

  function showMsg(msg, type) {
      feedback = { msg, type };
      setTimeout(() => feedback = { msg: '', type: '' }, 4000);
  }

  async function loadData() {
      try {
          isLoading = true;
          const params = new URLSearchParams({
              offset: (page * 10).toString(),
              limit: "10",
              ...Object.fromEntries(Object.entries(searchFilters).filter(([_, v]) => v !== ''))
          });
          
          const res = await fetch(`${API}?${params.toString()}`);
          responseStatusCode = res.status;
          if (res.ok) {
              const result = await res.json();
              data = Array.isArray(result) ? result : [result];
          } else {
              data = [];
              showMsg("Error al cargar datos.", "error");
          }
      } catch {
          showMsg("Error de conexión con el servidor.", "error");
      } finally {
          isLoading = false;
      }
  }

  async function loadInitialData() {
      const res = await fetch(`${API}/loadInitialData`);
      if (res.ok) {
          showMsg("¡Datos iniciales cargados con éxito!", "success");
          page = 0;
          loadData();
      } else {
          showMsg("No se han podido cargar los datos iniciales.", "error");
      }
  }

  async function deleteOne(country, year) {
      if (!confirm(`¿Eliminar ${country} (${year})?`)) return;
      const res = await fetch(`${API}/${encodeURIComponent(country)}/${year}`, { method: 'DELETE' });
      if (res.ok) {
          showMsg(`Recurso de ${country} eliminado correctamente.`, "success");
          loadData();
      } else showMsg("Error al eliminar recurso.", "error");
  }

  async function deleteAll() {
      if (!confirm("¿Borrar toda la colección?")) return;
      const res = await fetch(API, { method: 'DELETE' });
      if (res.ok) {
          showMsg("Colección vaciada con éxito.", "success");
          data = [];
          page = 0;
      } else showMsg("Error al vaciar la colección.", "error");
  }

  function clearSearch() {
      searchFilters = { country: '', year: '', region: '' };
      page = 0;
      loadData();
  }

  $effect(() => { loadData(); });
</script>

{#if feedback.msg}
  <div class="alert {feedback.type}">{feedback.msg}</div>
{/if}

<section>
  <h3>Filtros de búsqueda</h3>
  <input placeholder="País" bind:value={searchFilters.country} />
  <input placeholder="Año" type="number" bind:value={searchFilters.year} />
  <input placeholder="Región" bind:value={searchFilters.region} />
  <button on:click={() => { page=0; loadData(); }}>Buscar</button>
  <button on:click={clearSearch}>Limpiar filtros</button>
</section>

<div>
  <a href="/child-malnutritions/create"><button>Añadir nuevo dato</button></a>
  <button on:click={loadInitialData}>Cargar datos iniciales</button>
</div>

<main>
  {#if isLoading}
    <p>Cargando datos...</p>
  {:else if data.length === 0}
    <p>No se han encontrado datos.</p>
  {:else}
    <table>
      <thead>
        <tr>
          <th>País</th><th>Año</th><th>Región</th><th>Tasa Stunting</th><th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {#each data as item}
        <tr>
          <td>{item.country}</td>
          <td>{item.year}</td>
          <td>{item.region}</td>
          <td>{item.stunting_rate}%</td>
          <td>
            <a href={`/child-malnutritions/${encodeURIComponent(item.country)}/${item.year}`}><button>Editar</button></a>
            <button on:click={() => deleteOne(item.country, item.year)}>Eliminar</button>
          </td>
        </tr>
        {/each}
      </tbody>
    </table>

    <button on:click={() => page=Math.max(0,page-1)} disabled={page===0}>Anterior</button>
    <span>Página: {page+1}</span>
    <button on:click={() => page=page+1} disabled={data.length<10}>Siguiente</button>

    <button on:click={deleteAll}>Eliminar toda la colección</button>
  {/if}
</main>