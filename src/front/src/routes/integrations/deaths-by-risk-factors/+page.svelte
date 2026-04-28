<script>
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
				por las estimaciones de la OMS
			</p>
			<button onclick={() => goto('/integrations/deaths-by-risk-factors/aqapi')}>
				Ver integración API calidad del aire OMS
			</button>
		</div>
    </div>
</main>