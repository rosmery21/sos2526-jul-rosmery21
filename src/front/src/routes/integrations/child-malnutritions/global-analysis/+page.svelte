<script>
	// @ts-nocheck
	import { onMount } from 'svelte';

	let loading = $state(true);
	let errorMsg = $state('');
	let rows = $state([]);
	let sortField = $state('stunting');
	let sortAsc = $state(false);

	onMount(async () => {
		try {
			await loadData();
		} catch (e) {
			errorMsg = `Error al cargar los datos: ${e}`;
		} finally {
			loading = false;
		}
	});

	async function loadData() {
		// Usa directamente la propia API, sin widget externo
		const res = await fetch('/api/v2/child-malnutritions');
		if (!res.ok) throw new Error('Error al obtener child-malnutritions');
		const mal = await res.json();

		// Último año por país con todos los campos
		const latestByCountry = {};
		mal.forEach(d => {
			if (!latestByCountry[d.country] || d.year > latestByCountry[d.country].year)
				latestByCountry[d.country] = d;
		});

		rows = Object.values(latestByCountry)
			.filter(d => d.stunting_rate && d.wasting_rate && d.overweight_rate && d.underweight_rate)
			.map(d => ({
				country: d.country,
				year: d.year,
				stunting: parseFloat(d.stunting_rate),
				wasting: parseFloat(d.wasting_rate),
				overweight: parseFloat(d.overweight_rate),
				underweight: parseFloat(d.underweight_rate),
				composite: (parseFloat(d.stunting_rate) + parseFloat(d.wasting_rate) + parseFloat(d.underweight_rate)) / 3
			}));

		sortRows();
	}

	function sortRows() {
		rows = [...rows].sort((a, b) =>
			sortAsc ? a[sortField] - b[sortField] : b[sortField] - a[sortField]
		);
	}

	function setSort(field) {
		if (sortField === field) sortAsc = !sortAsc;
		else { sortField = field; sortAsc = false; }
		sortRows();
	}

	function barWidth(val, max) {
		return Math.min(100, (val / max) * 100).toFixed(1);
	}

	const MAX_STUNTING = 65;
	const MAX_WASTING = 25;
	const MAX_OVERWEIGHT = 35;
	const MAX_UNDERWEIGHT = 50;

	function colorForVal(val, max) {
		const ratio = val / max;
		if (ratio < 0.3) return '#16a34a';
		if (ratio < 0.6) return '#f59e0b';
		return '#dc2626';
	}
</script>

<main>
	<div class="header">
		<button onclick={() => window.history.back()}>← Volver</button>
		<h2>Perfil Global de Malnutrición Infantil</h2>
		<p>
			Tabla de los datos más recientes de <b>stunting, wasting, overweight y underweight</b>
			por país, directamente desde la API <b>child-malnutritions</b>.
			Las barras de color permiten comparar visualmente los 4 indicadores.
			Haz clic en las cabeceras para ordenar.
		</p>
	</div>

	{#if loading}
		<div class="loading">Cargando datos...</div>
	{:else if errorMsg}
		<div class="error">{errorMsg}</div>
	{:else}
		<p class="count">{rows.length} países con datos completos · Año más reciente disponible</p>

		<div class="legend">
			<span class="dot green"></span> Nivel bajo
			<span class="dot yellow"></span> Nivel medio
			<span class="dot red"></span> Nivel alto
		</div>

		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th onclick={() => setSort('country')} class:active={sortField==='country'}>
							País {sortField==='country' ? (sortAsc ? '↑' : '↓') : ''}
						</th>
						<th>Año</th>
						<th onclick={() => setSort('stunting')} class:active={sortField==='stunting'}>
							Stunting % {sortField==='stunting' ? (sortAsc ? '↑' : '↓') : ''}
						</th>
						<th onclick={() => setSort('wasting')} class:active={sortField==='wasting'}>
							Wasting % {sortField==='wasting' ? (sortAsc ? '↑' : '↓') : ''}
						</th>
						<th onclick={() => setSort('overweight')} class:active={sortField==='overweight'}>
							Overweight % {sortField==='overweight' ? (sortAsc ? '↑' : '↓') : ''}
						</th>
						<th onclick={() => setSort('underweight')} class:active={sortField==='underweight'}>
							Underweight % {sortField==='underweight' ? (sortAsc ? '↑' : '↓') : ''}
						</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as row (row.country)}
						<tr>
							<td class="country">{row.country}</td>
							<td class="year">{row.year}</td>
							<td>
								<div class="bar-cell">
									<span class="val">{row.stunting.toFixed(1)}</span>
									<div class="bar-bg">
										<div
											class="bar"
											style="width:{barWidth(row.stunting, MAX_STUNTING)}%; background:{colorForVal(row.stunting, MAX_STUNTING)}"
										></div>
									</div>
								</div>
							</td>
							<td>
								<div class="bar-cell">
									<span class="val">{row.wasting.toFixed(1)}</span>
									<div class="bar-bg">
										<div
											class="bar"
											style="width:{barWidth(row.wasting, MAX_WASTING)}%; background:{colorForVal(row.wasting, MAX_WASTING)}"
										></div>
									</div>
								</div>
							</td>
							<td>
								<div class="bar-cell">
									<span class="val">{row.overweight.toFixed(1)}</span>
									<div class="bar-bg">
										<div
											class="bar"
											style="width:{barWidth(row.overweight, MAX_OVERWEIGHT)}%; background:{colorForVal(row.overweight, MAX_OVERWEIGHT)}"
										></div>
									</div>
								</div>
							</td>
							<td>
								<div class="bar-cell">
									<span class="val">{row.underweight.toFixed(1)}</span>
									<div class="bar-bg">
										<div
											class="bar"
											style="width:{barWidth(row.underweight, MAX_UNDERWEIGHT)}%; background:{colorForVal(row.underweight, MAX_UNDERWEIGHT)}"
										></div>
									</div>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</main>

<style>
main { padding: 24px; max-width: 1100px; margin: 0 auto; }
.header { margin-bottom: 20px; }
h2 { margin: 12px 0 8px; }
p { color: #555; }
.loading { padding: 40px; text-align: center; color: #888; }
.error { padding: 16px; background: #fee2e2; border-radius: 8px; color: #991b1b; margin-bottom: 16px; }
.count { font-size: 0.9rem; color: #777; margin-bottom: 8px; }
button { padding: 8px 16px; border: none; border-radius: 6px; background: #6b7280; color: white; cursor: pointer; }
button:hover { background: #4b5563; }

.legend { display: flex; align-items: center; gap: 12px; font-size: 0.85rem; margin-bottom: 12px; color: #555; }
.dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
.dot.green { background: #16a34a; }
.dot.yellow { background: #f59e0b; }
.dot.red { background: #dc2626; }

.table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid #e5e7eb; }

table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }

thead tr { background: #1e3a5f; color: white; }
thead th {
	padding: 12px 14px;
	text-align: left;
	cursor: pointer;
	user-select: none;
	white-space: nowrap;
}
thead th:hover { background: #2d4f80; }
thead th.active { background: #2563eb; }

tbody tr:nth-child(even) { background: #f8fafc; }
tbody tr:hover { background: #eff6ff; }
tbody td { padding: 8px 14px; border-bottom: 1px solid #e5e7eb; }

.country { font-weight: 600; min-width: 120px; }
.year { color: #888; font-size: 0.82rem; text-align: center; }

.bar-cell { display: flex; align-items: center; gap: 8px; min-width: 160px; }
.val { font-weight: 600; min-width: 35px; text-align: right; font-size: 0.85rem; }
.bar-bg { flex: 1; height: 14px; background: #e5e7eb; border-radius: 7px; overflow: hidden; }
.bar { height: 100%; border-radius: 7px; transition: width 0.3s ease; }
</style>
