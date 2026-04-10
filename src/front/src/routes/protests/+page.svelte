<script>
	// @ts-nocheck
	import { goto } from '$app/navigation';

	const ERROR_MESSAGES = {
		500: 'Error del servidor. Por favor, inténtalo de nuevo más tarde.',
		404: 'No se han encontrado datos para los campos especificados.',
		400: 'Solicitud incorrecta. Por favor, revisa los filtros establecidos.'
	};

	const camposES = [
		'Identificador', 'País', 'Año', 'Región', 'Protesta', 'Violencia',
		'Queja', 'Respuesta del estado', 'Pt. electoral', 'Pt. liberal',
		'Pt. participación', 'Pt. deliberativo', 'Pt. igualitario',
		'Pt. HDI', 'Estado violento', 'Probabilidad éxito'
	];

	let datos = $state([]);
	let error = $state(null);
	let API = '/api/v2/protests';
	let mensaje = $state(null);
	let page = $state(0);
	let filterMode = $state('exact');

	let searchFilters = $state({
		country: '',
		year: '',
		from: '',
		to: '',
		region: '',
		protest: '',
		protesterviolence: '',
		electoral_ecore: '',
		liberal_score: '',
		participatory_score: '',
		deliberative_score: '',
		egalitarian_score: '',
		hdi_score: '',
		violence_status: '',
		predicted_prob: '',
	});

	function cargarMsgError(codigo) {
		error = ERROR_MESSAGES[codigo] || `Error inesperador al ejecutar la acción`;
		console.log(codigo);
		setTimeout(() => { error = ''; }, 3000);
	}

	function limpiarMensaje() {
		setTimeout(() => { mensaje = ''; }, 4500);
	}

	async function cargarDatos() {
		try {
			const params = new URLSearchParams({
				offset: (page * 10).toString(),
				limit: '10',
				...Object.fromEntries(
					Object.entries(searchFilters).filter(([_, v]) => v !== '' && v !== null)
				)
			});

			const res = await fetch(`${API}?${params.toString()}`);
			if (!res.ok) {
				cargarMsgError(res.status);
				datos = [];
				return;
			}
			const respuesta = await res.json();
			datos = Array.isArray(respuesta) ? respuesta : [respuesta];
			error = null;
		} catch (err) {
			cargarMsgError(500);
			console.log(err);
		}
	}

	function limpiarFiltros() {
		searchFilters = {
			country: '',
			year: '',
			from: '',
			to: '',
			region: '',
			protest: '',
			protesterviolence: '',
			electoral_ecore: '',
			liberal_score: '',
			participatory_score: '',
			deliberative_score: '',
			egalitarian_score: '',
			hdi_score: '',
			violence_status: '',
			predicted_prob: '',
		};
		page = 0;
		filterMode = 'exact';
		cargarDatos();
	}

	async function cargarDatosIniciales() {
		if (datos.length > 0) {
		mensaje = "Ya hay datos cargados, elimnalos antes de cargar los datos iniciales";
		limpiarMensaje();
		return;
		}
		try {
			const res = await fetch(API + '/loadInitialData');
			if (!res.ok) { cargarMsgError(res.status); return; }
			cargarDatos();
			mensaje = "Datos cargados correctamente";
			limpiarMensaje();
		} catch (err) {
			cargarMsgError(500);
		}
	}

	async function eliminarDatos() {
		if (!confirm('¿Seguro que quieres eliminar TODOS los registros? Esta acción no se puede deshacer.')) return;
		try {
			const res = await fetch(API, { method: 'DELETE' });
			if (!res.ok) { cargarMsgError(res.status); return; }
			datos = [];
			mensaje = 'Datos eliminados correctamente';
			limpiarMensaje();
		} catch (err) {
			cargarMsgError(500);
		}
	}

	async function eliminarDato(id) {
		if (!confirm('¿Seguro que quieres eliminar este registro? Esta acción no se puede deshacer.')) return;
		try {
			const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
			if (!res.ok) { cargarMsgError(res.status); return; }
			await cargarDatos();
			mensaje = 'Protesta #' + id + ' eliminada correctamente';
			limpiarMensaje();
		} catch (err) {
			cargarMsgError(500);
		}
	}

	function editarItem(item) { goto('/protests/' + item.id); }
	function crearItem() { goto('/protests/create'); }

	$effect(() => { cargarDatos(); });

</script>

<!-- SECCIÓN DE FILTROS -->
<section>
	<h3>Filtros</h3>

	<div>
		<label>
			<input type="radio" name="mode" value="exact" bind:group={filterMode}
				onclick={() => { searchFilters.from = ''; searchFilters.to = ''; }} />
			Año exacto
		</label>
		<label>
			<input type="radio" name="mode" value="range" bind:group={filterMode}
				onclick={() => { searchFilters.year = ''; }} />
			Rango de años
		</label>
	</div>

	<div>
		<!-- Texto -->
		<input type="text"   placeholder="País"                    bind:value={searchFilters.country} />
		<input type="text"   placeholder="Región"                  bind:value={searchFilters.region} />

		<!-- Año -->
		{#if filterMode === 'exact'}
			<input type="number" placeholder="Año"                 bind:value={searchFilters.year} />
		{:else}
			<input type="number" placeholder="Año inicio"          bind:value={searchFilters.from} />
			<input type="number" placeholder="Año fin"             bind:value={searchFilters.to} />
		{/if}

		<!-- Enteros -->
		<input type="number" placeholder="Min. Protesta"           bind:value={searchFilters.protest} />
		<input type="number" placeholder="Min. Violencia"          bind:value={searchFilters.protesterviolence} />
		<input type="number" placeholder="Min. Estado violento"    bind:value={searchFilters.violence_status} />

		<!-- Decimales -->
		<input type="number" step="0.01" placeholder="Min. Pt. electoral"      bind:value={searchFilters.electoral_ecore} />
		<input type="number" step="0.01" placeholder="Min. Pt. liberal"        bind:value={searchFilters.liberal_score} />
		<input type="number" step="0.01" placeholder="Min. Pt. participación"  bind:value={searchFilters.participatory_score} />
		<input type="number" step="0.01" placeholder="Min. Pt. deliberativo"   bind:value={searchFilters.deliberative_score} />
		<input type="number" step="0.01" placeholder="Min. Pt. igualitario"    bind:value={searchFilters.egalitarian_score} />
		<input type="number" step="0.01" placeholder="Min. HDI"                bind:value={searchFilters.hdi_score} />
		<input type="number" step="0.01" placeholder="Min. Prob. éxito"        bind:value={searchFilters.predicted_prob} />
	</div>

	<div>
		<button onclick={() => { page = 0; cargarDatos(); }}>Recargar datos</button>
		<button onclick={limpiarFiltros}>Limpiar filtros</button>
		<button onclick={goto('/protests/charts')}>Ir al gráfico</button>
	</div>
</section>

<!-- ACCIONES GLOBALES -->
<div>
	<button onclick={cargarDatosIniciales}>Cargar datos iniciales</button>
	<button onclick={crearItem}>Crear registro</button>
</div>

{#if mensaje}<h1 style="color:green">{mensaje}</h1>{/if}
{#if error}<h1 style="color:red">{error}</h1>{/if}

<!-- TABLA -->
{#if datos.length === 0}
	<p>No hay datos</p>
{:else}
	<table border="1" cellpadding="5">
		<thead>
			<tr>
				{#each camposES as campo (campo)}<th>{campo}</th>{/each}
				<th>Acciones</th>
			</tr>
		</thead>
		<tbody>
			{#each datos as item (item.id)}
				<tr>
					{#each Object.values(item) as value, i (i)}<td>{value}</td>{/each}
					<td>
						<button aria-label="editar-recurso" onclick={() => editarItem(item)}>✏️</button>
						<button aria-label="borrar-recurso" onclick={() => eliminarDato(item.id)}>🗑️</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<!-- PAGINACIÓN -->
	<div>
		<button onclick={() => (page = Math.max(0, page - 1))} disabled={page === 0}>Anterior</button>
		<span>Página {page + 1}</span>
		<button onclick={() => (page = page + 1)} disabled={datos.length < 10}>Siguiente</button>
	</div>

	<button onclick={eliminarDatos} style="background-color: red; color: white;">Eliminar la colección</button>
{/if}