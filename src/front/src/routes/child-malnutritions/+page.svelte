<script>
    // @ts-nocheck
    let data = $state([]);
    let API = '/api/v1/child-malnutritions';
    let responseStatusCode = $state(0);
    let page = $state(0);
    let isLoading = $state(false);

    // Filtros de búsqueda
    let searchFilters = $state({
        country: '',
        year: '',
        region: ''
    });

    async function loadData() {
        try {
            isLoading = true;
            const params = new URLSearchParams({
                offset: (page * 10).toString(),
                limit: (10).toString(),
                // Filtra solo los campos que no están vacíos
                ...Object.fromEntries(Object.entries(searchFilters).filter(([_, v]) => v !== ''))
            });
            
            const response = await fetch(`${API}?${params.toString()}`);
            if (response.ok) {
                const result = await response.json();
                data = Array.isArray(result) ? result : [result];
                responseStatusCode = response.status;
            } else {
                data = [];
                responseStatusCode = response.status;
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            isLoading = false;
        }
    }

    async function loadInitialData() {
        const res = await fetch(`${API}/loadInitialData`);
        if (res.ok) {
            page = 0;
            loadData();
        }
    }

    async function deleteOne(country, year) {
        if (!confirm(`¿Estás seguro de que deseas eliminar el recurso: ${country} (${year})?`)) {
            return;
        }
        const res = await fetch(`${API}/${encodeURIComponent(country)}/${year}`, { 
            method: 'DELETE' 
        });
        if (res.ok) {
            loadData();
        }
    }

    async function deleteAll() {
        if (!confirm("¿Estás seguro de que deseas eliminar TODA la colección?")) return;
        const res = await fetch(API, { method: 'DELETE' });
        if (res.ok) {
            data = [];
            page = 0;
            loadData();
        }
    }

    function clearSearch() {
        searchFilters = { country: '', year: '', region: '' };
        page = 0;
        loadData();
    }

    // Recarga los datos cuando cambia la página o al iniciar
    $effect(() => {
        loadData();
    });
</script>

<section>
    <h3>Filtros de Búsqueda</h3>
    <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
        <input type="text" placeholder="País" bind:value={searchFilters.country} />
        <input type="number" placeholder="Año" bind:value={searchFilters.year} />
        <input type="text" placeholder="Región" bind:value={searchFilters.region} />
        <button onclick={() => { page = 0; loadData(); }}>Buscar</button>
        <button class="secondary" onclick={clearSearch}>Limpiar filtros</button>
    </div>
</section>

<div style="margin-bottom: 20px; display: flex; gap: 10px;">
    <a href="/child-malnutritions/create">
        <button style="background-color: #28a745; color: white;">Añadir nuevo dato</button>
    </a>
    <button onclick={loadInitialData}>Cargar datos iniciales</button>
</div>

<main>
    {#if isLoading}
        <p>Cargando datos...</p>
    {:else if data.length === 0}
        <p>No hay datos disponibles para esta selección.</p>
        {#if page > 0}
            <button onclick={() => page = 0}>Volver a la primera página</button>
        {/if}
    {:else}
        <table border="1" style="width: 100%; text-align: left; border-collapse: collapse;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th>País</th>
                    <th>Año</th>
                    <th>Región</th>
                    <th>Tasa de retraso (Stunting)</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each data as item}
                    <tr>
                        <td>{item.country}</td>
                        <td>{item.year}</td>
                        <td>{item.region}</td>
                        <td>{item.stunting_rate}%</td>
                        <td>
                            <a href={`/child-malnutritions/${encodeURIComponent(item.country)}/${item.year}`}>
                                <button>Detalles</button>
                            </a>
                            <button style="background-color: #dc3545; color: white;" onclick={() => deleteOne(item.country, item.year)}>Eliminar</button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>

        <div style="margin-top: 20px; display: flex; align-items: center; gap: 15px;">
            <button onclick={() => page = Math.max(0, page - 1)} disabled={page === 0}>Anterior</button>
            <span>Página: <strong>{page + 1}</strong></span>
            <button onclick={() => page = page + 1} disabled={data.length < 10}>Siguiente</button>
        </div>

        <div style="margin-top: 30px;">
            <button style="background-color: #6c757d; color: white;" onclick={deleteAll}>Eliminar toda la colección</button>
        </div>
    {/if}
</main>

<style>
    table th, table td {
        padding: 10px;
        border: 1px solid #ddd;
    }
    button {
        cursor: pointer;
        padding: 5px 10px;
    }
    .secondary {
        background-color: #f8f9fa;
        border: 1px solid #ccc;
    }
</style>