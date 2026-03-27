<script>
	// @ts-nocheck
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const ERROR_MESSAGES = {
		500: 'Error del servidor. Por favor, inténtalo de nuevo más tarde. (500)',
		404: 'No se han encontrado datos para los campos especificados. (404)',
		400: 'Solicitud incorrecta. Por favor, revisa los filtros establecidos. (400)'
	};

	
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

	let datos = $state([]);
	let error = $state(null);
	let API = '/api/v2/protests';
	let mensaje = $state(null);

	function cargarMsgError(codigo) {
		error = ERROR_MESSAGES[codigo] || `Error: ${codigo} ${response.statusText}`;
		setTimeout(() => {
			error = '';
		}, 3000);
	}

	function limpiarMensaje() {
		setTimeout(() => {
			mensaje = '';
		}, 4500);
	}

	async function cargarDatos() {
		try {
			const res = await fetch(API + '?limit=15');
			if (!res.ok) {
				cargarMsgError(res.status);
				return;
			}
			const respuesta = await res.json();
			datos = Array.isArray(respuesta) ? respuesta : [respuesta];
			error = null;
			mensaje = 'Datos cargados correctamente';
			limpiarMensaje();
		} catch (err) {
			cargarMsgError(500);
			console.log(err);
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
				cargarMsgError(res.status);
				return;
			}
			cargarDatos();
			console.log('Datos cargados');
		} catch (err) {
			cargarMsgError(500);
			console.log(err);
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
				cargarMsgError(res.status);
				return;
			}
			datos = [];
			mensaje = 'Datos eliminados correctamente';
			limpiarMensaje();
		} catch (err) {
			cargarMsgError(500);
			console.log(err);
		}
	}

	async function eliminarDato(id) {
		if (!confirm('¿Seguro que quieres eliminar este registro? Esta acción no se puede deshacer.'))
			return;
		try {
			const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
			if (!res.ok) {
				cargarMsgError(res.status);
				return;
			}
			datos = datos.filter((item) => item.id !== id);
			await cargarDatos();
			mensaje = 'Protesta #' + id + ' eliminada correctamente';
			limpiarMensaje();
		} catch (err) {
			cargarMsgError(500);
			console.log(err);
		}
	}

	function editarItem(item) {
		goto('/protests/' + item.id);
	}

	onMount(() => cargarDatos());

	function crearItem() {
		goto('/protests/create');
	}
</script>

<button onclick={cargarDatosIniciales}>Cargar datos iniciales</button>
<button onclick={eliminarDatos}>Eliminar datos</button>
<button onclick={crearItem}>Crear registro</button>

{#if mensaje}
	<h1 style="color:green">{mensaje}</h1>
{/if}

{#if error}
	<p style="color:red">{error}</p>
{/if}

{#if datos.length === 0}
	<p>No hay datos</p>
{/if}

<table border="1" cellpadding="5">
	<thead>
		<tr>
			{#each camposES as campo (campo)}
				<th>{campo}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each datos as item (item)}
			<tr>
				{#each Object.values(item) as value, i (i)}
					<td>{value}</td>
				{/each}
				<td><button onclick={() => editarItem(item)}>✏️</button></td>
				<td><button onclick={() => eliminarDato(item.id)}>🗑️</button></td>
			</tr>
		{/each}
	</tbody>
</table>
