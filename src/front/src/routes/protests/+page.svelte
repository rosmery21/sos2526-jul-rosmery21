<script>
	// @ts-nocheck
	import { onMount } from 'svelte';

	const APIFIELDS = [
		'id',
		'country',
		'year',
		'region',
		'protest',
		'protesterviolence',
		'protesterdemand',
		'stateresponse',
		'electoral_ecore',
		'liberal_score',
		'participatory_score',
		'deliberative_score',
		'egalitarian_score',
		'hdi_score',
		'violence_status',
		'predicted_prob'
	];
	const camposES = [
		'Identificador',
		'País',
		'Año',
		'Región',
		'Protesta',
		'Violencia',
		'Queja',
		'Respuesta del estado',
		'Pt. electoral',
		'Pt. liberal',
		'Pt. participación',
		'Pt. deliberativo',
		'Pt. igualitario',
		'Pt. HDI',
		'Estado violento',
		'Probabilidad éxito'
	];
	const camposDEC = [
		'Pt. electoral',
		'Pt. liberal',
		'Pt. participación',
		'Pt. deliberativo',
		'Pt. igualitario',
		'Pt. HDI',
		'Probabilidad éxito'
	];
    
	const camposNUM = ['Identificador', 'Año', 'Protesta', 'Violencia', 'Estado violento'];
	let vista = $state('tabla');
	let datos = $state([]);
	let error = $state(null);
	let API = '/api/v1/protests';
	let formData = $state({});
	let mensaje = $state(null);


	async function cargarDatos() {
		try {
			const res = await fetch(API);
			if (!res.ok) {
				error = `Error: ${res.status} ${res.statusText}`;
				return;
			}
			const respuesta = await res.json();
			datos = Array.isArray(respuesta) ? respuesta : [respuesta];
			error = null;
            mensaje = 'Datos cargados correctamente';
		} catch (err) {
			error = err;
		}
	}

	async function cargarDatosIniciales() {
		console.log(datos.length);
		if (datos.length > 0) {
			return;
		}
		try {
			const res = await fetch(API + '/loadInitialData');
			if (!res.ok) {
				error = `Error: ${res.status} ${res.statusText}`;
				return;
			}
			cargarDatos();
		} catch (err) {
			error = err;
		}
	}

	async function eliminarDatos() {
		if (
			!confirm(
				'¿Seguro que quieres eliminar TODOS los registros? Esta acción no se puede deshacer.'
			)
		)
			return;
		try {
			const res = await fetch(API, { method: 'DELETE' });
			if (!res.ok) {
				error = `Error: ${res.status} ${res.statusText}`;
				return;
			}
			datos = [];
            mensaje = 'Datos eliminados correctamente';

		} catch (err) {
			error = err;
		}
	}

	async function eliminarDato(id) {
		if (!confirm('¿Seguro que quieres eliminar este registro? Esta acción no se puede deshacer.'))
			return;
		try {
			const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
			if (!res.ok) {
				error = `Error: ${res.status} ${res.statusText}`;
				return;
			}
			datos = datos.filter((item) => item.id !== id);
			await cargarDatos();
            mensaje = 'Dato eliminado correctamente';

		} catch (err) {
			error = err;
		}
	}

	function cambiarVista(nuevaVista) {
		if (vista === 'editar') {
			if (!confirm('¿Seguro que quieres salir sin guardar los cambios?')) return;
			formData = {};
		}
		vista = nuevaVista;
	}

	function editarItem(item) {
		formData = { ...item };
		cambiarVista('editar');
	}

	function vistaCreacion() {
		formData = {};
		cambiarVista('crear');
	}

	async function crearRegistro(e) {
		const formData = new FormData(e.target);
		const nuevoRegistro = {};
		for (let [key, value] of formData.entries()) {
			nuevoRegistro[key] = camposNUM.includes(key) ? Number(value) : value;
		}

		try {
			const res = await fetch(API, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(nuevoRegistro)
			});
			if (!res.ok) {
				error = `Error: ${res.status} ${res.statusText}`;
				return;
			}
			await cargarDatos();
			vista = 'tabla';
			mensaje = 'Registro creado correctamente';

		} catch (err) {
			error = err;
		}
	}

	async function guardarEdicion() {
		try {
			const res = await fetch(`${API}/${formData.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});
			if (!res.ok) {
				error = `Error: ${res.status} ${res.statusText}`;
				return;
			}
			await cargarDatos();
			vista = 'tabla';
			mensaje = 'Registro actualizado correctamente';
		} catch (err) {
			error = err;
		}
	}

	onMount(() => cargarDatos());
</script>

<button onclick={() => cambiarVista('tabla')}>Ver tabla</button>
<button onclick={cargarDatosIniciales}>Cargar datos iniciales</button>
<button onclick={eliminarDatos}>Eliminar datos</button>
<button onclick={vistaCreacion}>Crear registro</button>

{#if mensaje}
	<p style="color:green">{mensaje}</p>
{/if}

{#if error}
	<p style="color:red">{error}</p>
{/if}

{#if datos.length === 0}
	<p>No hay datos</p>
{/if}

{#if vista === 'tabla'}
	<table border="1" cellpadding="5">
		<thead>
			<tr>
				{#each camposES as campo}
					<th>{campo}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each datos as item}
				<tr>
					{#each Object.values(item) as value}
						<td>{value}</td>
					{/each}
					<td><button onclick={() => editarItem(item)}>✏️</button></td>
					<td><button onclick={() => eliminarDato(item.id)}>🗑️</button></td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else if vista === 'editar' || vista === 'crear'}
	<form
		onsubmit={(e) => {
			e.preventDefault();
			vista === 'crear' ? crearRegistro(e) : guardarEdicion();
		}}
	>
		{#each camposES as campo, i}
			<label
				>{campo}
				{#if camposNUM.includes(campo)}
					<input type="number" name={APIFIELDS[i]} bind:value={formData[APIFIELDS[i]]} />
				{:else if camposDEC.includes(campo)}
					<input
						type="number"
						step="0.001"
						min="0"
						max="1"
						name={APIFIELDS[i]}
						bind:value={formData[APIFIELDS[i]]}
					/>
				{:else}
					<input type="text" name={APIFIELDS[i]} bind:value={formData[APIFIELDS[i]]} />
				{/if}
			</label>
			<br />
		{/each}

		<button type="submit">Guardar cambios</button>
	</form>
{/if}
