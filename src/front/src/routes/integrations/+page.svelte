<script>
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { goto } from '$app/navigation';
</script>

<main>
    <h2>Integraciones de API "deaths-by-risk-factors"</h2>
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

		<div class="card">
			<h3>Menú de Integraciones de Protestas</h3>
			<p>
				Acceso a las distintas integraciones realizadas.
			</p>
			<button onclick={() => goto('/integrations/protests')}>
				Ver integraciones de Protestas
			</button>
		</div>
	</section>

	<section>
        <h2>Integraciones de API "pandemics"</h2>

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