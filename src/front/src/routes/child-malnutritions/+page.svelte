<script>
    import { fade } from 'svelte/transition';
    // @ts-nocheck
    let data = $state([]);
    let API = '/api/v1/child-malnutritions';
    let responseStatusCode = $state(0);
    let feedback = $state({ msg: '', type: '' });
    let page = $state(0);
    let isLoading = $state(false);

    let searchFilters = $state({ country: '', year: '', region: '' });

    function showMsg(m, t) {
        feedback = { msg: m, type: t };
        setTimeout(() => feedback = { msg: '', type: '' }, 4000);
    }

    async function loadData() {
        try {
            isLoading = true;
            const params = new URLSearchParams({
                offset: (page * 10).toString(),
                limit: "10",
                ...Object.fromEntries(Object.entries(searchFilters).filter(([_, v]) => v !== ''))
            });
            
            const response = await fetch(`${API}?${params.toString()}`);
            responseStatusCode = response.status;
            if (response.ok) {
                const result = await response.json();
                data = Array.isArray(result) ? result : [result];
            } else {
                data = [];
            }
        } catch (error) {
            showMsg("Error de conexión con el servidor.", "error");
        } finally {
            isLoading = false;
        }
    }

    async function loadInitialData() {
        const res = await fetch(`${API}/loadInitialData`);
        if (res.ok) {
            showMsg("¡Datos iniciales cargados con éxito!", "success");
            page = 0;
            loadData();
        } else {
            showMsg("No se han podido cargar los datos iniciales.", "error");
        }
    }

    async function deleteOne(country, year) {
        if (!confirm(`¿Estás seguro de eliminar ${country} (${year})?`)) return;
        const res = await fetch(`${API}/${encodeURIComponent(country)}/${year}`, { method: 'DELETE' });
        if (res.ok) {
            showMsg(`Recurso de ${country} eliminado correctamente.`, "success");
            loadData();
        } else {
            showMsg("Error al intentar eliminar el recurso.", "error");
        }
    }

    async function deleteAll() {
        if (!confirm("¿Borrar TODA la colección?")) return;
        const res = await fetch(API, { method: 'DELETE' });
        if (res.ok) {
            showMsg("Colección vaciada con éxito.", "success");
            data = [];
            page = 0;
            loadData();
        } else {
            showMsg("Error al intentar vaciar la colección.", "error");
        }
    }

    function clearSearch() {
        searchFilters = { country: '', year: '', region: '' };
        page = 0;
        loadData();
    }

    $effect(() => { loadData(); });
</script>

{#if feedback.msg}
    <div class="alert {feedback.type}" transition:fade>
        {feedback.msg}
    </div>
{/if}

<section class="filter-section">
    <h3>Filtros de Búsqueda</h3>
    <div class="filters">
        <input type="text" placeholder="País" bind:value={searchFilters.country} />
        <input type="number" placeholder="Año" bind:value={searchFilters.year} />
        <input type="text" placeholder="Región" bind:value={searchFilters.region} />
        <button onclick={() => { page = 0; loadData(); }}>Buscar</button>
        <button class="secondary" onclick={clearSearch}>Limpiar filtros</button>
    </div>
</section>

<div class="actions">
    <a href="/child-malnutritions/create">
        <button class="btn-add">Añadir nuevo dato</button>
    </a>
    <button onclick={loadInitialData}>Cargar datos iniciales</button>
</div>

<main>
    {#if isLoading}
        <p>Cargando datos...</p>
    {:else if data.length === 0}
        <p>No se han encontrado datos para esta selección.</p>
    {:else}
        <table>
            <thead>
                <tr>
                    <th>País</th><th>Año</th><th>Región</th><th>Tasa Stunting</th><th>Acciones</th>
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
                            <a href={`/child-malnutritions/${encodeURIComponent(item.country)}/${item.year}`}><button>Detalles</button></a>
                            <button class="btn-delete" onclick={() => deleteOne(item.country, item.year)}>Eliminar</button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>

        <div class="pagination">
            <button onclick={() => page = Math.max(0, page - 1)} disabled={page === 0}>Anterior</button>
            <span>Página: <strong>{page + 1}</strong></span>
            <button onclick={() => page = page + 1} disabled={data.length < 10}>Siguiente</button>
        </div>

        <button class="btn-danger-all" onclick={deleteAll}>Eliminar toda la colección</button>
    {/if}
</main>

<style>
    .alert { padding: 15px; margin: 10px 0; color: white; border-radius: 5px; text-align: center; font-weight: bold; position: sticky; top: 10px; z-index: 100;}
    .success { background-color: #28a745; }
    .error { background-color: #dc3545; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
    .filter-section { background: #eee; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .filters { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn-add { background-color: #28a745; color: white; }
    .btn-delete { background-color: #dc3545; color: white; }
    .btn-danger-all { background-color: #6c757d; color: white; margin-top: 30px; }
    .pagination { margin-top: 20px; display: flex; gap: 15px; align-items: center; }
</style>