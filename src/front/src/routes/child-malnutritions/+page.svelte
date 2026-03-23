<script>
    // @ts-nocheck
    let data = $state([]);
    let API = '/api/v1/child-malnutritions';
    let responseStatusCode = $state(0);
    let page = $state(0);

    // Filtri adattati ai tuoi dati
    let searchFilters = $state({
        country: '',
        year: '',
        region: ''
    });

    async function loadData() {
        try {
            const params = new URLSearchParams({
                offset: (page * 10).toString(),
                limit: (10).toString(),
                ...Object.fromEntries(Object.entries(searchFilters).filter(([_, v]) => v !== ''))
            });
            const response = await fetch(`${API}?${params.toString()}`);
            if (response.ok) {
                data = await response.json();
            } else {
                data = [];
                responseStatusCode = response.status;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function loadInitialData() {
        const res = await fetch(`${API}/loadInitialData`);
        if (res.ok) loadData();
    }

    async function deleteOne(country, year) {
        if (!confirm(`¿Eliminar ${country} (${year})?`)) return;
        const res = await fetch(`${API}/${encodeURIComponent(country)}/${year}`, { method: 'DELETE' });
        if (res.ok) loadData();
    }

    function clearSearch() {
        searchFilters = { country: '', year: '', region: '' };
        page = 0;
        loadData();
    }

    $effect(() => { loadData(); });
</script>

<section>
    <h3>Filtros</h3>
    <input type="text" placeholder="País" bind:value={searchFilters.country} />
    <input type="number" placeholder="Año" bind:value={searchFilters.year} />
    <input type="text" placeholder="Región" bind:value={searchFilters.region} />
    <button onclick={loadData}>Buscar</button>
    <button onclick={clearSearch}>Limpiar</button>
</section>

<main>
    <button onclick={loadInitialData}>Cargar datos iniciales</button>
    <a href="/child-malnutritions/create"><button>Añadir nuevo dato</button></a>

    {#if data.length === 0}
        <p>No c'è nulla qui.</p>
    {:else}
        <table>
            <thead>
                <tr>
                    <th>País</th><th>Año</th><th>Región</th><th>Stunting Rate</th><th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each data as item}
                    <tr>
                        <td>{item.country}</td>
                        <td>{item.year}</td>
                        <td>{item.region}</td>
                        <td>{item.stunting_rate}</td>
                        <td>
                            <button onclick={() => deleteOne(item.country, item.year)}>Eliminar</button>
                            <a href={`/child-malnutritions/${encodeURIComponent(item.country)}/${item.year}`}>Detalles</a>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <div>
            <button onclick={() => page = Math.max(0, page - 1)}>-</button>
            <span>Página: {page}</span>
            <button onclick={() => page = page + 1} disabled={data.length < 10}>+</button>
        </div>
    {/if}
</main>