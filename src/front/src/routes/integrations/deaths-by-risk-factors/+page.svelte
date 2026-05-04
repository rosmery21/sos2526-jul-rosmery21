<script>
	/* eslint-disable svelte/no-navigation-without-resolve */
    import { goto } from '$app/navigation';
</script>

<main>
	<h2>Integraciones de Muertes por factores de riesgo</h2>
	
	<button onclick={() => goto('/integrations')}>
		Volver
	</button>
    
	<div>
        <div class="card">
			<h3>Integración de los datos con la api de la calidad del aire de la OMS</h3>
			<p>
				Representación de los datos recogidos en la api Muertes por factores de riesgo junto a los datos obtenidos
				por las estimaciones de la OMS.
			</p>
			<button onclick={() => goto('/integrations/deaths-by-risk-factors/aqapi')}>
				Ver integración con la API de calidad del aire OMS
			</button>
		</div>
		<div class="card">
			<h3>Integración de los datos con la api de población de worldbank</h3>
			<p>
				Esta integración nos permite ver una comparación de los datos de la api de Muertes por 
				factores de riesgo, viendo el total de estas muertes por cada país, y los datos de la api de 
				worldbank que nos ofrece la población de cada país.
			</p>
			<button onclick={() => goto('/integrations/deaths-by-risk-factors/worldbank-population')}>
				Ver integración con la API de worldbank
			</button>
		</div>
		<div class="card">
			<h3>Integración de los datos con la api de coste de una dieta saludable</h3>
			<p>
				En esta integración de la api de muertes por factores de riesgo con la api de el coste
				de una dieta saludable podemos ver la relacción entre el coste de una dieta saludable y 
				las muertes causadas por una mala alimentación, para observar como dependen estos datos.
			</p>
			<button onclick={() => goto('/integrations/deaths-by-risk-factors/cost-of-healthy-diet')}>
				Ver integración con la API de coste de dieta saludable
			</button>
		</div>
		<div class="card">
			<h3>Integración de los datos con la api de indice de felicidad</h3>
			<p>
				Esta integración nos permite ver una comparación de los datos de la api de Muertes por 
				factores de riesgo, viendo el total de estas muertes por cada país, y los datos de la api 
				con los datos de los índices de felicidad por país, con esto podremos ver si existe alguna
				relacción entre estos dos datos.
			</p>
			<button onclick={() => goto('/integrations/deaths-by-risk-factors/happiness-indices')}>
				Ver integración con la API de indices de felicidad
			</button>
		</div>
		<div class="card">
			<h3>Integración de los datos con la api de PIB por país</h3>
			<p>
				En esta gráfica podemos ver la evolución del PIB de cada país desde el año 2000, se
				puede seleccionar el país del que queramos consultar los datos y ver en la gráfica como los
				años con mayor PIB estan representados con una columna más ancha. Los datos se obtienen de la 
				api worldbank, y se consulta por el PIB.
			</p>
			<button onclick={() => goto('/integrations/deaths-by-risk-factors/worldbank-gdp')}>
				Ver integración con la API de PIB por país
			</button>
		</div>
    </div>
</main>

