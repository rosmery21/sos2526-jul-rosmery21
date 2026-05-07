<script>
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { goto } from '$app/navigation';
</script>

<main>
	<h2>Integraciones de Child Malnutritions</h2>

	<button onclick={() => goto('/integrations')}>
		Volver
	</button>

	<section>
		<div class="card">
			<h3>Integración con los datos de la API "literacy-rates" (SOS2526-11)</h3>
			<p>
				Comparativa entre la tasa de alfabetización por país (API SOS2526-11, via proxy propio)
				y la tasa de stunting infantil. A menor educación, mayor malnutrición.
			</p>
			<button onclick={() => goto('/integrations/child-malnutritions/education')}>
				Ver integración con literacy-rates
			</button>
		</div>

		<div class="card">
			<h3>Integración con los datos de la API "population-densities" (SOS2526-15)</h3>
			<p>
				Análisis de la relación entre la densidad de población por país (API SOS2526-15, via proxy propio)
				y los niveles de stunting infantil. Mapa de calor por franjas de densidad y stunting.
			</p>
			<button onclick={() => goto('/integrations/child-malnutritions/population')}>
				Ver integración con population-densities
			</button>
		</div>

		<div class="card">
			<h3>Uso de la API de PIB per cápita (World Bank)</h3>
			<p>
				Gráfico Waterfall que muestra cómo varía la tasa media de stunting infantil
				al pasar de una franja de PIB per cápita a la siguiente. Datos de World Bank via proxy propio.
			</p>
			<button onclick={() => goto('/integrations/child-malnutritions/gdp')}>
				Ver representación con PIB per cápita
			</button>
		</div>

		<div class="card">
			<h3>Uso de la API de Esperanza de Vida (World Bank)</h3>
			<p>
				Gráfico de burbujas agrupadas (Packed Bubble) donde cada burbuja es un país,
				agrupado por franja de esperanza de vida. El tamaño indica la tasa de wasting infantil.
			</p>
			<button onclick={() => goto('/integrations/child-malnutritions/life-expectancy')}>
				Ver representación con Esperanza de Vida
			</button>
		</div>

		<div class="card">
			<h3>Uso de la API de Tasa de Pobreza (World Bank)</h3>
			<p>
				Treemap de los 40 países con mayor pobreza extrema. El tamaño del bloque indica
				la tasa de pobreza y el color la intensidad del stunting infantil.
			</p>
			<button onclick={() => goto('/integrations/child-malnutritions/poverty')}>
				Ver representación con Tasa de Pobreza
			</button>
		</div>

		<div class="card">
    <h3>Inversión Educativa vs. Malnutrición</h3>
    <p>
        Análisis de la relación entre el <b>Gasto Público en Educación (% del PIB)</b> 
        (datos de la World Bank) y la malnutrición infantil. 
        Esta integración demuestra cómo la inversión en educación impacta en la salud.
    </p>
    <button onclick={() => goto('/integrations/child-malnutritions/education-expenditure')}>
        Ver análisis de inversión educativa
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

h2 {
  margin-bottom: 20px;
}

h3 {
  margin-bottom: 10px;
}

section > div.card {
  margin-bottom: 20px;
}

.card {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fafafa;
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card p {
  margin-bottom: 15px;
}

button {
  padding: 3px 5px;
  border: solid 1px #000000;
  border-radius: 4px;
  cursor: pointer;
}
</style>