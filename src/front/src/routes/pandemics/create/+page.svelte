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

  async function handleAddResource() {
    // Construimos el objeto respetando los nombres de tu API
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
        // ÉXITO: Redirigimos al listado principal
        goto('/pandemics');
      } else if (res.status === 409) {
        errorMessage = "Error: El dato ya existe.";
      } else if (res.status === 400) {
        errorMessage = "Error: Faltan campos o el formato es incorrecto.";
      } else {
        errorMessage = "Error inesperado: " + res.status;
      }
    } catch (error) {
      console.error('Error al añadir:', error);
      errorMessage = "No se pudo conectar con el servidor.";
    }
  }
</script>

<main>
  <h2>Añadir Nuevo Dato</h2>

  {#if errorMessage}
    <p style="color: red;">{errorMessage}</p>
  {/if}

  <form onsubmit={(e) => { e.preventDefault(); handleAddResource(); }}>
    <label>País: <input type="text" bind:value={entity} required /></label><br />
    <label>Código: <input type="text" bind:value={code} required /></label><br />
    <label>Año: <input type="number" bind:value={year} required /></label><br />
    <label>Frambesia: <input type="number" step="any" bind:value={yaws} /></label><br />
    <label>Polio: <input type="number" step="any" bind:value={polio} /></label><br />
    <label>Gusano de Guinea: <input type="number" step="any" bind:value={guinea_worm} /></label><br />
    <label>Rabia: <input type="number" step="any" bind:value={rabies} /></label><br />
    <label>Malaria: <input type="number" step="any" bind:value={malaria} /></label><br />
    <label>VIH/SIDA: <input type="number" step="any" bind:value={hiv_aids} /></label><br />
    <label>Tuberculosis: <input type="number" step="any" bind:value={tuberculosis} /></label><br />
    <label>Viruela: <input type="number" step="any" bind:value={smallpox} /></label><br />
    <label>Cólera: <input type="number" step="any" bind:value={cholera} /></label><br />

    <button type="submit">Guardar Dato</button>
    <button type="button" onclick={() => goto('/pandemics')}>Cancelar</button>
  </form>
</main>