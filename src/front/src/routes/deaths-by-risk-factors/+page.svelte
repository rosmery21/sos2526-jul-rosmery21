<script>
	import { goto } from "$app/navigation";

	// @ts-nocheck

	/* eslint-disable svelte/no-navigation-without-resolve */
	// @ts-ignore
	let deaths_by_risk_factors = $state([]);
	let API = '/api/v2/deaths-by-risk-factors';
	let responseStatusCode = $state(0);
	let page = $state(0);
	let isLoading = $state(false);
	let msg = $state('');
	let filterMode = $state('exact');

	let searchFilters = $state({
		country: '',
		year: '',
		from: '',
		to: '',
		high_systolic_blood_pressure: '',
		air_pollution: '',
		child_wasting: '',
		household_air_pollution_from_solid_fuels: '',
		high_fasting_plasma_glucose: ''
	});

	async function loadDeathsByRiskFactors() {
		try {
			const params = new URLSearchParams({
				offset: (page * 10).toString(),
				limit: (10).toString(),
				...Object.fromEntries(
					// eslint-disable-next-line no-unused-vars
					Object.entries(searchFilters).filter(([_, v]) => v !== '' && v !== null)
				)
			});
			const response = await fetch(`${API}?${params.toString()}`, {
				method: 'GET'
			});
			if (response.ok) {
				const data = await response.json();
				deaths_by_risk_factors = Array.isArray(data) ? data : [data];
			} else if (response.status === 404) {
				deaths_by_risk_factors = [];
				responseStatusCode = response.status;
				msg = 'No se han encontrado datos';
			}
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
			msg = `Recurso para (${entity}, ${year}) eliminado`;
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
			isLoading = true;
			const response = await fetch(`${API}/loadInitialData`, {
				method: 'GET'
			});
			responseStatusCode = response.status;
			msg = 'Conjunto de datos iniciales cargado';
			if (response.ok) {
				console.log('Initial data loaded successfully');
				loadDeathsByRiskFactors();
			} else {
				console.error('Failed to load initial data:', response.status);
			}
		} catch (error) {
			console.error('Error loading initial data:', error);
		} finally {
			isLoading = false;
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
			msg = 'Se han eliminado todos los recursos';
			if (response.ok) {
				console.log('Collection deleted successfully');
				deaths_by_risk_factors = [];
				page = 0;
			} else {
				console.error('Failed to delete collection:', response.status);
			}
		} catch (error) {
			console.error('Error deleting collection:', error);
		}
	}

	function clearSearch() {
		searchFilters = {
			country: '',
			year: '',
			from: '',
			to: '',
			high_systolic_blood_pressure: '',
			air_pollution: '',
			child_wasting: '',
			household_air_pollution_from_solid_fuels: '',
			high_fasting_plasma_glucose: ''
		};
		page = 0;
		filterMode = 'exact';
		loadDeathsByRiskFactors();
	}

	$effect(() => {
		loadDeathsByRiskFactors();
	});

	$effect(() => {
		if (responseStatusCode !== 0) {
			const timer = setTimeout(() => {
				responseStatusCode = 0;
				msg = '';
			}, 3000);
			return () => clearTimeout(timer);
		}
	});
</script>

{#if responseStatusCode !== 0}
	<div>
		{msg}
		<button onclick={() => (responseStatusCode = 0)}>x</button>
	</div>
{/if}

<section>
	<h2>Muertes por Factores de Riesgo</h2>
</section>

<section data-testid="filters">
	<h3>Filtros</h3>
	<div class="grid-filters">
		<div class="mode-selector">
			<label>
				<input
					type="radio"
					name="mode"
					value="exact"
					bind:group={filterMode}
					onclick={() => {
						searchFilters.from = '';
						searchFilters.to = '';
					}}
				/>
				Año exacto
			</label>
			<label>
				<input
					type="radio"
					name="mode"
					value="range"
					bind:group={filterMode}
					onclick={() => {
						searchFilters.year = '';
					}}
				/>
				Rango de años
			</label>
		</div>
    
    <input type="text" placeholder="País" bind:value={searchFilters.country} />
		
    {#if filterMode === 'exact'}
			<input type="number" placeholder="Año" bind:value={searchFilters.year} />
		{:else}
			<input type="number" placeholder="Año Inicio" bind:value={searchFilters.from} />

			<input type="number" placeholder="Año Fin" bind:value={searchFilters.to} />
		{/if}

		<input type="number" placeholder="Min. Presión Arterial" bind:value={searchFilters.high_systolic_blood_pressure} />
		<input type="number" placeholder="Min. Contaminación Aire" bind:value={searchFilters.air_pollution} />
		<input type="number" placeholder="Min. Desnutrición" bind:value={searchFilters.child_wasting} />
		<input type="number" placeholder="Min. Combustibles" bind:value={searchFilters.household_air_pollution_from_solid_fuels} />
		<input type="number" placeholder="Min. Glucosa" bind:value={searchFilters.high_fasting_plasma_glucose} />
	</div>

	<div class="actions">
		<button
			onclick={() => {
				page = 0;
				loadDeathsByRiskFactors();
			}}>Buscar</button
		>
		<button class="secondary" onclick={clearSearch}>Limpiar filtros</button>
	</div>
</section>

<div>
	<a href="/deaths-by-risk-factors/create">
		<button>Añadir nuevo dato</button>
	</a>
</div>

<main>
	{#if deaths_by_risk_factors.length === 0}
		{#if isLoading}
			<p>Cargando...</p>
		{:else}
			<p>No hay datos disponibles.</p>
			{#if page === 0}
				<button onclick={() => loadInitialData()}>Cargar datos iniciales</button>
			{/if}
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
						<td
							><button onclick={() => deleteResource(resource.entity, resource.year)}
								>Eliminar</button
							></td
						>
						<td
							><a
								href={`/deaths-by-risk-factors/${encodeURIComponent(resource.entity)}/${resource.year}`}
								>Detalles</a
							></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
		<div>
			<button onclick={() => (page = Math.max(0, page - 1))}>-</button>
			<span>Página: {page}</span>
			<button onclick={() => (page = page + 1)} disabled={deaths_by_risk_factors.length < 10}>+</button>
		</div>
		<div>
			<button onclick={() => deleteData()}>Eliminar la colección</button>
		</div>
		<div>
			<button onclick={() => goto('/analytics/deaths-by-risk-factors')}>Gráficos</button>
		</div>
	{/if}
</main>
