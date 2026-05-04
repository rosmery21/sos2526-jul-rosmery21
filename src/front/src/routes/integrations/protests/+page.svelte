<script>
	/* eslint-disable svelte/no-navigation-without-resolve */
    import { goto } from '$app/navigation';
</script>

<main>
	<h2>Integraciones de protestas</h2>
	
	<button onclick={() => goto('/integrations')}>
		Volver
	</button>
    
	<section>
		<div class="card">
			<h3>Integración con los datos de la api "social-drinking-behaviors"</h3>
			<p>
				Representación de los datos recogidos en la api protests junto
				a los datos obtenidos por la api social-drinking-behaviors de otro compañero de SOS
			</p>

			<button onclick={() => goto('/integrations/protests/social-drinking-behaviors')}>
				Ver integración con social-drinking-behaviors
			</button>
		</div>


		<div class="card">
			<h3>Integración con los datos de la api "meteorite-landings"</h3>
			<p>
				Representación de los datos recogidos en la api protests junto
				a los datos obtenidos por la api "meteorite-landings" de otro compañero de SOS
			</p>

			<button onclick={() => goto('/integrations/protests/meteorite-landings')}>
				Ver integración con meteorite-landings
			</button>
		</div>

		<div class="card">
			<h3>Integración con los datos de la api "openmeteo"</h3>
			<p>
				Representación de los datos recogidos en la api protests junto
				a los datos obtenidos por la api "openmeteo" externa
			</p>

			<button onclick={() => goto('/integrations/protests/openmeteo')}>
				Ver integración con openmeteo
			</button>
		</div>

		<div class="card">
			<h3>Integración con los datos de la api "wikidata"</h3>
			<p>
				Representación de los datos recogidos en la api protests junto
				a los datos obtenidos por la api "wikidata" de otro compañero de SOS
			</p>

			<button onclick={() => goto('/integrations/protests/wikidata')}>
				Ver integración con wikidata
			</button>
		</div>

		<div class="card">
			<h3>Integración con los datos de la api "restcountries"</h3>
			<p>
				Representación de los datos recogidos en la api protests junto
				a los datos obtenidos por la api "restcountries" de otro compañero de SOS
			</p>

			<button onclick={() => goto('/integrations/protests/restcountries')}>
				Ver integración con restcountries
			</button>
		</div>
	</section>
</main>

<style>
main {
  padding: 20px;
  max-width: 1100px;
  margin: 0 auto;
}

/* Separación clara entre secciones */
section {
  margin-bottom: 50px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

/* Títulos */
h2 {
  margin-bottom: 20px;
}

h3 {
  margin-bottom: 10px;
}

/* Contenedor de cards */
section > div.card {
  margin-bottom: 20px;
}

/* Card individual */
.card {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fafafa;
  transition: box-shadow 0.2s ease;
}

/* Hover ligero */
.card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Texto */
.card p {
  margin-bottom: 15px;
}
</style>