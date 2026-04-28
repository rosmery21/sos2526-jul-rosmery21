<script>
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { goto } from '$app/navigation';
</script>

<main>
    <h2>Integraciones</h2>
	<section>
		<div class="card" id="deaths-by-risk-factors">
			<h3>Integración de los datos de la api Muertes por factores de riesgo</h3>
			<p>
                Diferentes integraciones realizadas a partir de los datos de apis externas
            </p>
			<button onclick={() => goto('/integrations/deaths-by-risk-factors')}>
				Ver integraciones de la API
			</button>
		</div>
	</section>
</main>
