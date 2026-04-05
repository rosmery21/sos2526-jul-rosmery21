<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  const API = '/api/v2/child-malnutritions';
  const country = page.params.country;
  const year = page.params.year;

  let resource = $state(null);
  let region = $state('');
  let stunting_rate = $state(0);
  let feedback = $state({ msg:'', type:'' });

  function showMsg(msg, type){ feedback={msg,type}; setTimeout(()=>feedback={msg:'',type:''},4000); }

  async function getResource() {
      try {
          const res = await fetch(`${API}/${encodeURIComponent(country)}/${year}`);
          if(res.ok){
              resource = await res.json();
              region = resource.region;
              stunting_rate = resource.stunting_rate;
          } else if(res.status===404) showMsg(`No existe dato para ${country} (${year})`, "error");
      } catch { showMsg("Error de conexión.", "error"); }
  }

  async function updateResource() {
      if(stunting_rate<0){ showMsg("Valor negativo no permitido.", "error"); return; }

      const updated = { country, year: parseInt(year), region, stunting_rate: parseFloat(stunting_rate) };
      try{
          const res = await fetch(`${API}/${encodeURIComponent(country)}/${year}`, {
              method:'PUT',
              headers:{'Content-Type':'application/json'},
              body: JSON.stringify(updated)
          });
          if(res.ok){
              showMsg("¡Actualizado con éxito!", "success");
              setTimeout(()=>goto('/child-malnutritions'),1000);
          } else showMsg("Error al actualizar el dato.", "error");
      } catch { showMsg("Error de conexión.", "error"); }
  }

  onMount(getResource);
</script>

{#if feedback.msg}
  <div class="alert {feedback.type}">{feedback.msg}</div>
{/if}

{#if resource}
<h2>Editar dato: {country} ({year})</h2>
<form on:submit|preventDefault={updateResource}>
  <input placeholder="Región" bind:value={region}/>
  <input type="number" placeholder="Tasa Stunting %" bind:value={stunting_rate} min="0" step="any"/>

  <button type="submit">Guardar cambios</button>
  <button type="button" on:click={()=>goto('/child-malnutritions')}>Cancelar</button>
</form>
{:else}
<p>Cargando datos...</p>
{/if}