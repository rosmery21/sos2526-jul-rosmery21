<script>
  import { goto } from '$app/navigation';


  const API = "/api/v1/child-malnutritions";

  let data = [];

 
  async function loadData() {
    if(!country || !year) return;
    try {
        const res = await fetch(`${API}/${country}/${year}`);
        if(res.ok) data = await res.json();
        else error = `No se encontró el recurso (${res.status})`;
    } catch(e) {
        error = "Error de conexión al servidor";
        console.error(e);
    }
}

  async function loadInitialData() {
    await fetch(`${API}/loadInitialData`);
    await loadData();
  }

  async function deleteAll() {
    if(confirm("¿Eliminar todos los datos?")) {
      await fetch(API, { method: "DELETE" });
      data = [];
    }
  }

  async function deleteOne(country, year) {
    if(confirm(`¿Eliminar ${country} (${year})?`)) {
      await fetch(`${API}/${country}/${year}`, { method: "DELETE" });
      await loadData();
    }
  }

  loadData();
</script>

<h1>Malnutrición Infantil</h1>

<button on:click={loadInitialData}>Cargar datos iniciales</button>
<button on:click={deleteAll}>Eliminar todos los datos</button>
<a href="/child-malnutritions/create"><button>Añadir nuevo dato</button></a>

{#if data.length === 0}
  <p>No hay datos disponibles.</p>
{:else}
  <table>
    <thead>
      <tr>
        <th>País</th>
        <th>Año</th>
        <th>Región</th>
        <th>Stunting Rate</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {#each data as item}
        <tr>
          <td>{item.country}</td>
          <td>{item.year}</td>
          <td>{item.region}</td>
          <td>{item.stunting_rate}</td>
          <td>
            <button on:click={() => deleteOne(item.country, item.year)}>Eliminar</button>
            <a href={`/child-malnutritions/${item.country}/${item.year}`}><button>Detalles</button></a>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}