<script>
// @ts-nocheck
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  const API = '/api/v2/child-malnutritions';

  let country = page.params.country;
  let year = page.params.year;

  let resource = $state(null);
  let region = $state('');
  let stunting_rate = $state('');

  async function load() {
    const res = await fetch(`${API}/${encodeURIComponent(country)}/${year}`);
    if (res.ok) {
      resource = await res.json();
      region = resource.region;
      stunting_rate = resource.stunting_rate;
    }
  }

  async function update() {
    await fetch(`${API}/${encodeURIComponent(country)}/${year}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        country,
        year: parseInt(year),
        region,
        stunting_rate: parseFloat(stunting_rate) || 0,
        wasting_rate: resource.wasting_rate || 0,
        overweight_rate: resource.overweight_rate || 0,
        underweight_rate: resource.underweight_rate || 0
      })
    });
    await goto('/child-malnutritions');
  }

  onMount(load);
</script>

{#if resource}
  <h2>Editar</h2>
  <input placeholder="Región" bind:value={region} />
  <input placeholder="Tasa Stunting %" bind:value={stunting_rate} />
  <button onclick={update}>Guardar cambios</button>
{:else}
  <p>Cargando...</p>
{/if}