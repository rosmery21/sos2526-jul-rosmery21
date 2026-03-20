<script>
  import { onMount } from "svelte";
  // @ts-ignore
  let deaths_by_risk_factors = $state([]);
  let API = '/api/v1/deaths-by-risk-factors';
  let responseStatusCode = $state(0);
  let page = $state(0);

  async function loadDeathsByRiskFactors() {
		try {
			const response = await fetch(`${API}?offset=${page*10}&limit=10`, {
				method: 'GET'
			});
			const data = await response.json();
      responseStatusCode = response.status;
			deaths_by_risk_factors = Array.isArray(data) ? data : [data];
		} catch (error) {
			console.error('Error fetching deaths by risk factors:', error);
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
        loadDeathsByRiskFactors();
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
        loadDeathsByRiskFactors();
      } else {
        console.error('Failed to load initial data:', response.status);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }

  $effect(() => {
    loadDeathsByRiskFactors();
  });

  onMount(() => {
    loadDeathsByRiskFactors();
  });

</script>

<div>
  <a href="/deaths-by-risk-factors/create">
    <button>Añadir nuevo dato</button>
  </a>
</div>

<main>
  {#if deaths_by_risk_factors.length === 0}
    <p>No hay datos disponibles.</p>
    {#if page === 0}
      <button onclick={() => loadInitialData()}>Cargar datos iniciales</button>
    {/if}
  {:else}
    <table>
      <thead>
        <tr>
          <th>País</th>
          <th>Año</th>
          <th>Alta presión arterial</th>
          <th>Contaminación del aire</th>
          <th>Desnutrición infantil</th>
          <th>Contaminación de combustibles fósiles</th>
          <th>Glucosa en sangre</th>
        </tr>
      </thead>
      <tbody>
        {#each deaths_by_risk_factors as resource (resource.entity + resource.year)}
          <tr>
            <td>{resource.entity}</td>
            <td>{resource.year}</td>
            <td>{resource.high_systolic_blood_pressure}</td>
            <td>{resource.air_pollution}</td>
            <td>{resource.child_wasting}</td>
            <td>{resource.household_air_pollution_from_solid_fuels}</td>
            <td>{resource.high_fasting_plasma_glucose}</td>
            <td><button onclick={() =>deleteResource(resource.entity, resource.year)}>Eliminar</button></td>
            <td><a href={`/deaths-by-risk-factors/${encodeURIComponent(resource.entity)}/${resource.year}`}>Detalles</a></td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div>
      <button onclick={() => page = Math.max(0, page - 1)}>-</button>
      <p>Page: {page}</p>
      <button onclick={() => page = page + 1} disabled={deaths_by_risk_factors.length < 10}>+</button>
    </div>
  {/if}
</main>