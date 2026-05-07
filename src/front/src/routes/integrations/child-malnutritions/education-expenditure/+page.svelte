<script>
    // @ts-nocheck
    import { onMount } from 'svelte';

    let loading = $state(true);
    let errorMsg = $state('');
    let rows = $state([]);
    let sortField = $state('education_expenditure');
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

    // Función para normalizar nombres de países
    function cleanName(name) {
        if (!name) return "";
        return name.toLowerCase().trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
            .replace(/[^a-z0-9\s]/g, ""); 
    }

    async function loadData() {
       
        const [malRes, eduRes] = await Promise.all([
            fetch('/api/v2/child-malnutritions'),
            fetch('/api/v2/child-malnutritions/integrations/education-expenditure') 
        ]);

        if (!malRes.ok || !eduRes.ok) throw new Error('Error al conectar con las APIs');

        const mal = await malRes.json();
        const eduData = await eduRes.json();
        const eduEntries = eduData[1] || [];

      
        const eduMap = {};
        eduEntries.forEach(entry => {
            const normalizedName = cleanName(entry.country.value);
            if (entry.value !== null) {
                if (!eduMap[normalizedName] || entry.date > eduMap[normalizedName].year) {
                    eduMap[normalizedName] = {
                        val: parseFloat(entry.value),
                        year: entry.date
                    };
                }
            }
        });

       
        const latestMal = {};
        mal.forEach(d => {
            if (!latestMal[d.country] || d.year > latestMal[d.country].year)
                latestMal[d.country] = d;
        });

        
        rows = Object.values(latestMal).map(m => {
            const countryKey = cleanName(m.country);
            const educationData = eduMap[countryKey];

            if (educationData) {
                return {
                    country: m.country,
                    year: m.year,
                    stunting: parseFloat(m.stunting_rate),
                    wasting: parseFloat(m.wasting_rate),
                    education_expenditure: educationData.val
                };
            }
            return null;
        }).filter(r => r !== null);

        sortRows();
    }

    function sortRows() {
        rows = [...rows].sort((a, b) => {
            return sortAsc ? a[sortField] - b[sortField] : b[sortField] - a[sortField];
        });
    }

    function setSort(field) {
        if (sortField === field) sortAsc = !sortAsc;
        else { sortField = field; sortAsc = false; }
        sortRows();
    }

    function barWidth(val, max) {
        return Math.min(100, (val / max) * 100).toFixed(1);
    }

    const MAX_STUNTING = 50;
    const MAX_EDUCATION = 10;
    const MAX_WASTING = 20;

    function colorForVal(val, max, inverse = false) {
        const ratio = val / max;
        if (inverse) {
            if (ratio > 0.5) return '#16a34a';
            if (ratio > 0.25) return '#f59e0b';
            return '#dc2626';
        }
        if (ratio < 0.25) return '#16a34a';
        if (ratio < 0.5) return '#f59e0b';
        return '#dc2626';
    }
</script>

<main>
    <div class="header">
        <button onclick={() => window.history.back()}>← Volver</button>
        <h2>Inversión Educativa vs. Malnutrición</h2>
        <p>
            Esta integración utiliza datos de <b>Gasto Público en Educación (% del PIB)</b> de la <b>World Bank</b> 
            cruzados con los indicadores de malnutrición infantil. 
        </p>
    </div>

    {#if loading}
        <div class="loading">Sincronizando datos de APIs externas...</div>
    {:else if errorMsg}
        <div class="error">{errorMsg}</div>
    {:else}
        <p class="count">Se han encontrado {rows.length} países con datos en ambas fuentes</p>

        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th onclick={() => setSort('country')} class:active={sortField==='country'}>
                            País {sortField==='country' ? (sortAsc ? '↑' : '↓') : ''}
                        </th>
                        <th onclick={() => setSort('education_expenditure')} class:active={sortField==='education_expenditure'}>
                            Gasto Educación (% PIB) {sortField==='education_expenditure' ? (sortAsc ? '↑' : '↓') : ''}
                        </th>
                        <th onclick={() => setSort('stunting')} class:active={sortField==='stunting'}>
                            Stunting % {sortField==='stunting' ? (sortAsc ? '↑' : '↓') : ''}
                        </th>
                        <th onclick={() => setSort('wasting')} class:active={sortField==='wasting'}>
                            Wasting % {sortField==='wasting' ? (sortAsc ? '↑' : '↓') : ''}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {#each rows as row (row.country)}
                        <tr>
                            <td class="country">{row.country}</td>
                            <td>
                                <div class="bar-cell">
                                    <span class="val">{row.education_expenditure.toFixed(1)}%</span>
                                    <div class="bar-bg">
                                        <div class="bar" 
                                             style="width:{barWidth(row.education_expenditure, MAX_EDUCATION)}%; background:{colorForVal(row.education_expenditure, MAX_EDUCATION, true)}">
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="bar-cell">
                                    <span class="val">{row.stunting.toFixed(1)}%</span>
                                    <div class="bar-bg">
                                        <div class="bar" 
                                             style="width:{barWidth(row.stunting, MAX_STUNTING)}%; background:{colorForVal(row.stunting, MAX_STUNTING)}">
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="bar-cell">
                                    <span class="val">{row.wasting.toFixed(1)}%</span>
                                    <div class="bar-bg">
                                        <div class="bar" 
                                             style="width:{barWidth(row.wasting, MAX_WASTING)}%; background:{colorForVal(row.wasting, MAX_WASTING)}">
                                        </div>
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
    main { padding: 24px; max-width: 1100px; margin: 0 auto; font-family: sans-serif; }
    .header { margin-bottom: 20px; }
    h2 { margin: 12px 0 8px; color: #1e3a8a; }
    p { color: #4b5563; line-height: 1.5; }
    .loading { padding: 40px; text-align: center; color: #6b7280; font-style: italic; }
    .error { padding: 16px; background: #fee2e2; border-radius: 8px; color: #991b1b; }
    .count { font-size: 0.9rem; color: #6b7280; margin-bottom: 12px; font-weight: bold; }
    button { padding: 8px 16px; border: none; border-radius: 6px; background: #4b5563; color: white; cursor: pointer; }

    .table-wrap { overflow-x: auto; border: 1px solid #d1d5db; border-radius: 10px; }
    table { width: 100%; border-collapse: collapse; background: white; }
    thead tr { background: #1e3a8a; color: white; }
    thead th { padding: 14px; text-align: left; cursor: pointer; }
    tbody td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .country { font-weight: bold; }
    .bar-cell { display: flex; align-items: center; gap: 10px; }
    .bar-bg { flex-grow: 1; height: 10px; background: #f3f4f6; border-radius: 5px; overflow: hidden; }
    .bar { height: 100%; }
</style>