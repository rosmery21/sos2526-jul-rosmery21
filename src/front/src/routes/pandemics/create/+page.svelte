<script>
	import { goto } from '$app/navigation';

	let API = '/api/v2/pandemics';

	// Estados para los campos del formulario
	let entity = $state('');
	let code = $state('');
	let year = $state('');
	let yaws = $state(0);
	let polio = $state(0);
	let guinea_worm = $state(0);
	let rabies = $state(0);
	let malaria = $state(0);
	let hiv_aids = $state(0);
	let tuberculosis = $state(0);
	let smallpox = $state(0);
	let cholera = $state(0);

	let errorMessage = $state('');
	let successMessage = $state(''); // <-- 1. Añadimos estado para el éxito

	async function handleAddResource() {
		errorMessage = '';
		successMessage = '';

		const values = [
			yaws,
			polio,
			guinea_worm,
			rabies,
			malaria,
			hiv_aids,
			tuberculosis,
			smallpox,
			cholera
		];
		if (values.some((v) => parseFloat(v) < 0) || parseInt(year) < 0) {
			errorMessage = 'Error: No se permiten valores negativos.';
			return;
		}

		const newResource = {
			entity,
			code,
			year: parseInt(year),
			yaws: parseFloat(yaws),
			polio: parseFloat(polio),
			guinea_worm: parseFloat(guinea_worm),
			rabies: parseFloat(rabies),
			malaria: parseFloat(malaria),
			hiv_aids: parseFloat(hiv_aids),
			tuberculosis: parseFloat(tuberculosis),
			smallpox: parseFloat(smallpox),
			cholera: parseFloat(cholera)
		};

		try {
			const res = await fetch(API, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newResource)
			});
			if (res.status === 201) {
				// <-- 2. Cambiamos el goto directo por un mensaje y espera
				successMessage = `¡El registro de ${entity} (${year}) ha sido creado con éxito!`;
				setTimeout(() => goto('/pandemics'), 2000);
			} else if (res.status === 409) {
				errorMessage = `Error: Ya existe un dato guardado para ${entity} en el año ${year}.`;
			} else if (res.status === 400) {
				errorMessage = 'Error: Faltan campos o el formato es incorrecto.';
			} else {
				errorMessage = 'Error inesperado al intentar guardar el dato.';
			}
		} catch (error) {
			console.error('Error al añadir:', error);
			errorMessage = 'No se pudo conectar con el servidor.';
		}
	}
</script>

<main>
	<h2>Añadir Nuevo Dato</h2>

	{#if errorMessage}
		<p style="color: red; font-weight: bold;">{errorMessage}</p>
	{/if}

	{#if successMessage}
		<p style="color: green; font-weight: bold;">{successMessage}</p>
	{/if}

	{#if !successMessage}
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleAddResource();
			}}
		>
			<label>País: <input type="text" bind:value={entity} required /></label><br />
			<label>Código: <input type="text" bind:value={code} required /></label><br />
			<label>Año: <input type="number" min="0" bind:value={year} required /></label><br />
			<label>Frambesia: <input type="number" step="any" bind:value={yaws} min="0" /></label><br />
			<label>Polio: <input type="number" step="any" bind:value={polio} min="0" /></label><br />
			<label
				>Gusano de Guinea: <input
					type="number"
					step="any"
					bind:value={guinea_worm}
					min="0"
				/></label
			><br />
			<label>Rabia: <input type="number" step="any" bind:value={rabies} min="0" /></label><br />
			<label>Malaria: <input type="number" step="any" bind:value={malaria} min="0" /></label><br />
			<label>VIH/SIDA: <input type="number" step="any" bind:value={hiv_aids} min="0" /></label><br
			/>
			<label
				>Tuberculosis: <input type="number" step="any" bind:value={tuberculosis} min="0" /></label
			><br />
			<label>Viruela: <input type="number" step="any" bind:value={smallpox} min="0" /></label><br />
			<label>Cólera: <input type="number" step="any" bind:value={cholera} min="0" /></label><br />
			<button type="submit">Guardar Dato</button>
			<button type="button" onclick={() => goto('/pandemics')}>Cancelar</button>
		</form>
	{/if}
</main>
