<script>
  import { onMount } from "svelte";
  // @ts-ignore
  let pandemics = $state([]);
  let API = '/api/v1/pandemics';
  let responseStatusCode = $state(0);
  let statusMsg = $state("");
  let page = $state(0);

  async function loadPandemics() {
		try {
			const response = await fetch(`${API}?offset=${page*10}&limit=10`, {
				method: 'GET'
			});
			const data = await response.json();
      responseStatusCode = response.status;
			pandemics = Array.isArray(data) ? data : [data];
		} catch (error) {
			console.error('Error fetching pandemics:', error);
		}
	}

    // @ts-ignore
    async function deleteResource(entity, year) {
        if (!confirm(`¿Estás seguro de que deseas eliminar el recurso: ${entity} (${year})?`)) {
        return;
        }
        try {
        const response = await fetch(`${API}/${encodeURIComponent(entity)}/${year}`, {
            method: 'DELETE'
        });
        responseStatusCode = response.status;
        if (response.ok) {
            console.log(`Deleted resource: ${entity} (${year})`);
            loadPandemics();
        } else {
            console.error('Failed to delete resource:', response.status);
        }
        } catch (error) {
        console.error('Error deleting resource:', error);
        }
    }

    async function loadInitialData() {
        try {
        const response = await fetch(`${API}/loadInitialData`, {
            method: 'GET'
        });
        responseStatusCode = response.status;
        if (response.ok) {
            console.log('Initial data loaded successfully');
            loadPandemics();
        } else {
            console.error('Failed to load initial data:', response.status);
        }
        } catch (error) {
        console.error('Error loading initial data:', error);
        }
    }

      async function deleteData() {
    if (!confirm(`¿Estás seguro de que deseas eliminar toda la colección?`)) {
      return;
    }
    try {
      const response = await fetch(`${API}`, {
        method: 'DELETE'
      });
      responseStatusCode = response.status;
      if (response.ok) {
        console.log('Collection deleted successfully');
        pandemics = [];
        page = 0;
      } else {
        console.error('Failed to delete collection:', response.status);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  }

  $effect(() => {
    loadPandemics();
  });

  onMount(() => {
    loadPandemics();
  });

</script>

<div>
  <a href="/pandemics/create">
    <button>Añadir nuevo dato</button>
  </a>
</div>

<main>
  {#if pandemics.length === 0}
    <p>No hay datos disponibles.</p>
    {#if page === 0}
      <button onclick={() => loadInitialData()}>Cargar datos iniciales</button>
    {/if}
  {:else}
    <table>
      <thead>
        <tr>
          <th>País</th>
          <th>Código</th>
          <th>Año</th>
          <th>Frambesia</th>
          <th>Polio</th>
          <th>Gusano de Guinea</th>
          <th>Rabia</th>
          <th>Malaria</th>
          <th>VIH/SIDA</th>
          <th>Tuberculosis</th>
          <th>Viruela</th>
          <th>Cólera</th>
        </tr>
      </thead>
      <tbody>
        {#each pandemics as resource (resource.entity + resource.year)}
          <tr>
            <td>{resource.entity}</td>
            <td>{resource.code}</td>
            <td>{resource.year}</td>
            <td>{resource.yaws}</td>
            <td>{resource.polio}</td>
            <td>{resource.guinea_worm}</td>
            <td>{resource.rabies}</td>
            <td>{resource.malaria}</td>
            <td>{resource.hiv_aids}</td>
            <td>{resource.tuberculosis}</td>
            <td>{resource.smallpox}</td>
            <td>{resource.cholera}</td>
            <td><button onclick={() =>deleteResource(resource.entity, resource.year)}>Eliminar</button></td>
            <td><a href={`/pandemics/${encodeURIComponent(resource.entity)}/${resource.year}`}>Detalles</a></td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div>
      <button onclick={() => page = Math.max(0, page - 1)}>-</button>
      <p>Page: {page}</p>
      <button onclick={() => page = page + 1} disabled={pandemics.length < 10}>+</button>
    </div>
    <div>
      <button onclick={() => deleteData()}>Eliminar la colección</button>
    </div>
  {/if}
</main>