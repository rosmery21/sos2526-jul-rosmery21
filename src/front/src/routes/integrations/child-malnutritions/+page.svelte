<script>
import { goto } from '$app/navigation';
</script>

<main>
  <h2>Integrations</h2>

  <div class="card">
    <h3>Malnutrition</h3>

    <button on:click={() => goto('/integrations/malnutrition/education-vs-malnutrition')}>
      Education vs Malnutrition
    </button>

    <button on:click={() => goto('/integrations/malnutrition/population-vs-malnutrition')}>
      Population Density vs Malnutrition
    </button>
  </div>

  <div class="card">
    <h3>Global Analysis</h3>

    <button on:click={() => goto('/integrations/global-analysis/combined-profile')}>
      Combined Profile
    </button>
  </div>
</main>