<script>
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { goto } from '$app/navigation';

  let API = '/api/v2/protests';

  let id = $state('');
  let country = $state('');
  let year = $state('');
  let region = $state('');
  let protest = $state(0);
  let protesterviolence = $state(0);
  let protesterdemand = $state(0);
  let stateresponse = $state(0);
  let electoral_ecore = $state(0);
  let liberal_score = $state(0);
  let participatory_score = $state(0);
  let deliberative_score = $state(0);
  let egalitarian_score = $state(0);
  let hdi_score = $state(0);
  let violence_status = $state(0);
  let predicted_prob = $state(0);

  let errorMessage = $state('');
  let infoMessage = $state('');

  async function handleAddResource() {
    const newResource = {
      id,
      country,
      year: parseInt(year),
      region,
      protest,
      protesterviolence,
      protesterdemand,
      stateresponse,
      electoral_ecore,
      liberal_score,
      participatory_score,
      deliberative_score,
      egalitarian_score,
      hdi_score,
      violence_status,
      predicted_prob
    };

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResource)
      });

      if (res.status === 201) {
        infoMessage = `Protesta #${id} creada con éxito.`;
        await new Promise(resolve => setTimeout(resolve, 2000));
        goto('/protests');
      } else if (res.status === 409) {
        errorMessage = 'Error: Un recurso con ese ID ya existe.';
      } else if (res.status === 400) {
        errorMessage = 'Error: Faltan campos o el formato es incorrecto.';
      } else {
        errorMessage = 'Error inesperado: ' + res.status;
      }
    } catch (error) {
      console.error('Error al añadir:', error);
      errorMessage = 'No se pudo conectar con el servidor.';
    }
  }
</script>

<main>
  {#if infoMessage}
    <h1 style="color: green;">{infoMessage}</h1>
  {:else if errorMessage}
    <p style="color: red;">{errorMessage}</p>
  {/if}

  <h2>Añadir Nueva Protesta</h2>

  <form onsubmit={(e) => { e.preventDefault(); handleAddResource(); }}>
    <label>ID: <input type="number" bind:value={id} required /></label><br />
    <label>País: <input type="text" bind:value={country} required /></label><br />
    <label>Año: <input type="number" bind:value={year} required /></label><br />
    <label>Región: <input type="text" bind:value={region} /></label><br />
    <label>Protesta: <input type="number" max="1" min="0" bind:value={protest} /></label><br />
    <label>Violencia manifestantes: <input type="number" max="1" min="0" bind:value={protesterviolence} /></label><br />
    <label>Demanda manifestantes: <input type="text" bind:value={protesterdemand} /></label><br />
    <label>Respuesta del estado: <input type="text" bind:value={stateresponse} /></label><br />
    <label>Score electoral: <input type="number" max="1" min="0" step="0.001" bind:value={electoral_ecore} /></label><br />
    <label>Score liberal: <input type="number" max="1" min="0" step="0.001" bind:value={liberal_score} /></label><br />
    <label>Score participativo: <input type="number" max="1" min="0" step="0.001" bind:value={participatory_score} /></label><br />
    <label>Score deliberativo: <input type="number" max="1" min="0" step="0.001" bind:value={deliberative_score} /></label><br />
    <label>Score igualitario: <input type="number" max="1" min="0" step="0.001" bind:value={egalitarian_score} /></label><br />
    <label>Score HDI: <input type="number" max="1" min="0" step="0.001" bind:value={hdi_score} /></label><br />
    <label>Estado de violencia: <input type="number" max="1" min="0" bind:value={violence_status} /></label><br />
    <label>Prob. predicha: <input type="number" max="1" min="0" step="0.000000000000001" bind:value={predicted_prob} /></label><br />

    <button type="submit">Añadir Protesta</button>
    <button type="button" onclick={() => goto('/protests')}>Cancelar</button>
  </form>
</main>