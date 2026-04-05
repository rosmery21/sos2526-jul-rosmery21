<script>
  import { goto } from '$app/navigation';
  let API = '/api/v2/child-malnutritions';

  let country = $state(''), year = $state(''), region = $state('');
  let stunting_rate = $state(0);
  let feedback = $state({ msg:'', type:'' });

  function showMsg(msg, type) { feedback={msg,type}; setTimeout(()=>feedback={msg:'',type:''},4000); }

  async function handleSubmit() {
      if(!country || !year || stunting_rate < 0 || year < 0) {
          showMsg("Campos obligatorios o valores negativos no permitidos.", "error");
          return;
      }

      const newData = { country, year: parseInt(year), region, stunting_rate: parseFloat(stunting_rate) };
      try {
          const res = await fetch(API, {
              method: 'POST',
              headers: {'Content-Type':'application/json'},
              body: JSON.stringify(newData)
          });

          if(res.status === 201) {
              showMsg("Dato creado correctamente.", "success");
              setTimeout(()=>goto('/child-malnutritions'),1000);
          } else if(res.status===409) showMsg(`Ya existe un dato para ${country} (${year}).`, "error");
          else showMsg("Error al guardar el dato.", "error");
      } catch {
          showMsg("Error de conexión.", "error");
      }
  }
</script>

{#if feedback.msg}
  <div class="alert {feedback.type}">{feedback.msg}</div>
{/if}

<h2>Añadir nuevo dato</h2>
<form on:submit|preventDefault={handleSubmit}>
  <input placeholder="País" bind:value={country} required/>
  <input type="number" placeholder="Año" bind:value={year} min="0" required/>
  <input placeholder="Región" bind:value={region}/>
  <input type="number" placeholder="Tasa Stunting %" bind:value={stunting_rate} min="0" step="any"/>

  <button type="submit">Guardar</button>
  <button type="button" on:click={()=>goto('/child-malnutritions')}>Cancelar</button>
</form>