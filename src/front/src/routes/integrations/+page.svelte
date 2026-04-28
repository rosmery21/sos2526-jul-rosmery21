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

	
	<section>
		<h2>Integraciones de API "protests"</h2>

		<div class="card" id="protests">
			<h3>Integración con los datos de la api "social-drinking-behaviors"</h3>
			<p>
				Representación de los datos recogidos en la api protests junto
				a los datos obtenidos por la api social-drinking-behaviors de otro compañero
			</p>

			<button onclick={() => goto('/integrations/protests/social-drinking-behaviors')}>
				Ver integración con social-drinking-behaviors
			</button>
		</div>
	</section>
</main>
