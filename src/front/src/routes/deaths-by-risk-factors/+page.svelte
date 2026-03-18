<script>
  import { onMount } from 'svelte'

  // ── Estado principal ──────────────────────────────────────────────
  let registros = $state([])
  let cargando = $state(false)
  let mensaje = $state(null)   // { tipo: 'ok'|'error', texto: string }
  let vista = $state('lista')  // 'lista' | 'crear' | 'editar'
  let registroEditando = $state(null)
  let form = $state(camposVacios())

  function camposVacios() {
    return {
      entity: '', year: '',
      high_systolic_blood_pressure: '',
      air_pollution: '',
      child_wasting: '',
      household_air_pollution_from_solid_fuels: '',
      high_fasting_plasma_glucose: ''
    }
  }

  const etiquetas = {
    entity: 'País / Entidad',
    year: 'Año',
    high_systolic_blood_pressure: 'Presión arterial sistólica alta',
    air_pollution: 'Contaminación del aire',
    child_wasting: 'Desnutrición infantil aguda',
    household_air_pollution_from_solid_fuels: 'Contaminación doméstica (combustibles sólidos)',
    high_fasting_plasma_glucose: 'Glucosa plasmática en ayunas elevada'
  }

  const camposNumericos = [
    'high_systolic_blood_pressure',
    'air_pollution',
    'child_wasting',
    'household_air_pollution_from_solid_fuels',
    'high_fasting_plasma_glucose'
  ]

  // ── Helpers ───────────────────────────────────────────────────────
  function mostrarMensaje(tipo, texto) {
    mensaje = { tipo, texto }
    setTimeout(() => { mensaje = null }, 4500)
  }

  function parsearErrorHTTP(codigo) {
    const errores = {
      400: 'Los datos enviados no son válidos. Revisa todos los campos.',
      404: 'No se encontró el registro solicitado.',
      405: 'Esta operación no está permitida.',
      409: 'Ya existe un registro para ese país y año.',
      415: 'El formato enviado no es válido. Solo se acepta JSON.',
      500: 'Error interno del servidor. Inténtalo más tarde.'
    }
    return errores[codigo] || `Error inesperado (código ${codigo}).`
  }

  // ── API calls ─────────────────────────────────────────────────────
  const BASE = '/api/v1/deaths-by-risk-factors'

  async function cargarDatos() {
    cargando = true
    try {
      const res = await fetch(`${BASE}?limit=100`)
      if (!res.ok) { mostrarMensaje('error', parsearErrorHTTP(res.status)); return }
      const data = await res.json()
      registros = Array.isArray(data) ? data : [data]
    } catch {
      mostrarMensaje('error', 'No se pudo conectar con el servidor.')
    } finally { cargando = false }
  }

  async function cargarDatosIniciales() {
    cargando = true
    try {
      const res = await fetch(`${BASE}/loadInitialData`)
      if (res.status === 409) { mostrarMensaje('error', 'Los datos ya estaban cargados.'); return }
      if (!res.ok) { mostrarMensaje('error', parsearErrorHTTP(res.status)); return }
      mostrarMensaje('ok', 'Datos iniciales cargados correctamente.')
      await cargarDatos()
    } catch {
      mostrarMensaje('error', 'No se pudo conectar con el servidor.')
    } finally { cargando = false }
  }

  async function borrarTodos() {
    if (!confirm('¿Seguro que quieres eliminar TODOS los registros? Esta acción no se puede deshacer.')) return
    cargando = true
    try {
      const res = await fetch(BASE, { method: 'DELETE' })
      if (!res.ok) { mostrarMensaje('error', parsearErrorHTTP(res.status)); return }
      registros = []
      mostrarMensaje('ok', 'Todos los registros han sido eliminados.')
    } catch {
      mostrarMensaje('error', 'No se pudo conectar con el servidor.')
    } finally { cargando = false }
  }

  async function borrarUno(entity, year) {
    if (!confirm(`¿Eliminar el registro de "${entity}" (${year})?`)) return
    cargando = true
    try {
      const res = await fetch(`${BASE}/${encodeURIComponent(entity)}/${year}`, { method: 'DELETE' })
      if (res.status === 404) {
        mostrarMensaje('error', `No existe un registro de "${entity}" para el año ${year}.`)
        return
      }
      if (!res.ok) { mostrarMensaje('error', parsearErrorHTTP(res.status)); return }
      registros = registros.filter(r => !(r.entity === entity && r.year === year))
      mostrarMensaje('ok', `Registro de "${entity}" (${year}) eliminado correctamente.`)
    } catch {
      mostrarMensaje('error', 'No se pudo conectar con el servidor.')
    } finally { cargando = false }
  }

  async function crearRegistro() {
    cargando = true
    const payload = {
      entity: form.entity.trim(),
      year: parseInt(form.year),
      high_systolic_blood_pressure: parseFloat(form.high_systolic_blood_pressure),
      air_pollution: parseFloat(form.air_pollution),
      child_wasting: parseFloat(form.child_wasting),
      household_air_pollution_from_solid_fuels: parseFloat(form.household_air_pollution_from_solid_fuels),
      high_fasting_plasma_glucose: parseFloat(form.high_fasting_plasma_glucose)
    }
    try {
      const res = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.status === 409) {
        mostrarMensaje('error', `Ya existe un registro de "${payload.entity}" para el año ${payload.year}.`)
        return
      }
      if (!res.ok) { mostrarMensaje('error', parsearErrorHTTP(res.status)); return }
      const nuevo = await res.json()
      registros = [...registros, nuevo]
      form = camposVacios()
      vista = 'lista'
      mostrarMensaje('ok', `Registro de "${nuevo.entity}" (${nuevo.year}) creado correctamente.`)
    } catch {
      mostrarMensaje('error', 'No se pudo conectar con el servidor.')
    } finally { cargando = false }
  }

  function abrirEdicion(reg) {
    registroEditando = { ...reg }
    form = {
      entity: reg.entity,
      year: String(reg.year),
      high_systolic_blood_pressure: String(reg.high_systolic_blood_pressure),
      air_pollution: String(reg.air_pollution),
      child_wasting: String(reg.child_wasting),
      household_air_pollution_from_solid_fuels: String(reg.household_air_pollution_from_solid_fuels),
      high_fasting_plasma_glucose: String(reg.high_fasting_plasma_glucose)
    }
    vista = 'editar'
  }

  async function guardarEdicion() {
    cargando = true
    const payload = {
      entity: form.entity.trim(),
      year: parseInt(form.year),
      high_systolic_blood_pressure: parseFloat(form.high_systolic_blood_pressure),
      air_pollution: parseFloat(form.air_pollution),
      child_wasting: parseFloat(form.child_wasting),
      household_air_pollution_from_solid_fuels: parseFloat(form.household_air_pollution_from_solid_fuels),
      high_fasting_plasma_glucose: parseFloat(form.high_fasting_plasma_glucose)
    }
    try {
      const res = await fetch(
        `${BASE}/${encodeURIComponent(registroEditando.entity)}/${registroEditando.year}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      )
      if (res.status === 404) {
        mostrarMensaje('error', `No existe el registro de "${registroEditando.entity}" para el año ${registroEditando.year}.`)
        return
      }
      if (!res.ok) { mostrarMensaje('error', parsearErrorHTTP(res.status)); return }
      const actualizado = await res.json()
      registros = registros.map(r =>
        r.entity === registroEditando.entity && r.year === registroEditando.year ? actualizado : r
      )
      vista = 'lista'
      registroEditando = null
      mostrarMensaje('ok', `Registro de "${actualizado.entity}" (${actualizado.year}) actualizado correctamente.`)
    } catch {
      mostrarMensaje('error', 'No se pudo conectar con el servidor.')
    } finally { cargando = false }
  }

  function cancelar() {
    form = camposVacios()
    registroEditando = null
    vista = 'lista'
  }

  onMount(() => cargarDatos())
</script>

<svelte:head>
  <title>Muertes por factores de riesgo – SOS2526-10</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
</svelte:head>

<div class="shell">
  <div class="bg"></div>

  <!-- Sidebar -->
  <aside class="sidebar">
    <a href="/" class="logo">
      <span class="logo-sq"></span>
      <span>SOS<em>2526</em></span>
    </a>
    <nav>
      <button
        class="nav-item"
        class:active={vista === 'lista'}
        onclick={() => { cancelar(); cargarDatos() }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="3" y1="15" x2="21" y2="15"/>
          <line x1="9" y1="9" x2="9" y2="21"/>
        </svg>
        Listado
      </button>
      <button
        class="nav-item"
        class:active={vista === 'crear'}
        onclick={() => { form = camposVacios(); vista = 'crear' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nuevo registro
      </button>
    </nav>
    <div class="sidebar-foot">
      <button class="btn-secondary small" onclick={cargarDatosIniciales} disabled={cargando}>
        Cargar datos iniciales
      </button>
      <button class="btn-danger small" onclick={borrarTodos} disabled={cargando}>
        Eliminar todos
      </button>
    </div>
  </aside>

  <!-- Main -->
  <main class="main">

    <!-- Toast -->
    {#if mensaje}
      <div class="toast {mensaje.tipo}" role="alert">
        {#if mensaje.tipo === 'ok'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        {:else}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        {/if}
        {mensaje.texto}
      </div>
    {/if}

    <!-- ── LISTA ─────────────────────────────────────────────────── -->
    {#if vista === 'lista'}
      <header class="page-header">
        <div>
          <h1>Muertes por factores de riesgo</h1>
          <p class="desc">Base de datos global · {registros.length} registros cargados</p>
        </div>
        <button class="btn-primary" onclick={() => { form = camposVacios(); vista = 'crear' }}>
          + Nuevo registro
        </button>
      </header>

      {#if cargando}
        <div class="empty">Cargando datos…</div>
      {:else if registros.length === 0}
        <div class="empty">
          <p>No hay registros disponibles.</p>
          <button class="btn-secondary" onclick={cargarDatosIniciales}>
            Cargar datos de ejemplo
          </button>
        </div>
      {:else}
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>País / Entidad</th>
                <th>Año</th>
                <th>Presión arterial</th>
                <th>Contam. aire</th>
                <th>Desnutrición</th>
                <th>Contam. doméstica</th>
                <th>Glucosa ayunas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {#each registros as reg (reg.entity + reg.year)}
                <tr>
                  <td class="entity">{reg.entity}</td>
                  <td class="year">{reg.year}</td>
                  <td>{reg.high_systolic_blood_pressure?.toLocaleString('es-ES') ?? '—'}</td>
                  <td>{reg.air_pollution?.toLocaleString('es-ES') ?? '—'}</td>
                  <td>{reg.child_wasting?.toLocaleString('es-ES') ?? '—'}</td>
                  <td>{reg.household_air_pollution_from_solid_fuels?.toLocaleString('es-ES') ?? '—'}</td>
                  <td>{reg.high_fasting_plasma_glucose?.toLocaleString('es-ES') ?? '—'}</td>
                  <td class="actions">
                    <button class="act-btn edit" onclick={() => abrirEdicion(reg)} title="Editar">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="act-btn del" onclick={() => borrarUno(reg.entity, reg.year)} title="Eliminar">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {/if}

    <!-- ── FORMULARIO CREAR / EDITAR ─────────────────────────────── -->
    {#if vista === 'crear' || vista === 'editar'}
      <header class="page-header">
        <div>
          <h1>{vista === 'crear' ? 'Nuevo registro' : `Editando: ${registroEditando?.entity} (${registroEditando?.year})`}</h1>
          <p class="desc">
            {vista === 'crear'
              ? 'Rellena todos los campos para añadir un nuevo registro.'
              : 'Modifica los campos que desees y guarda los cambios.'}
          </p>
        </div>
      </header>

      <form class="form-card" onsubmit={(e) => { e.preventDefault(); vista === 'crear' ? crearRegistro() : guardarEdicion() }}>
        <div class="form-row">
          <label>
            <span>{etiquetas.entity}</span>
            <input
              type="text"
              bind:value={form.entity}
              placeholder="ej. Spain"
              required
              disabled={vista === 'editar'}
            />
          </label>
          <label>
            <span>{etiquetas.year}</span>
            <input
              type="number"
              bind:value={form.year}
              placeholder="ej. 2020"
              required
              min="1900"
              max="2100"
              disabled={vista === 'editar'}
            />
          </label>
        </div>

        {#each camposNumericos as campo}
          <label>
            <span>{etiquetas[campo]}</span>
            <input
              type="number"
              step="any"
              bind:value={form[campo]}
              placeholder="0.0"
              required
              min="0"
            />
          </label>
        {/each}

        <div class="form-actions">
          <button type="button" class="btn-secondary" onclick={cancelar}>Cancelar</button>
          <button type="submit" class="btn-primary" disabled={cargando}>
            {vista === 'crear' ? 'Crear registro' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    {/if}

  </main>
</div>

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; margin: 0; padding: 0; }
  :global(body) {
    background: #060810;
    font-family: 'DM Mono', 'Cascadia Code', 'Fira Code', monospace;
    color: #c9d4e3;
    min-height: 100vh;
  }

  .bg {
    position: fixed; inset: 0; z-index: 0;
    background: radial-gradient(ellipse 70% 45% at 15% 5%, rgba(0,180,255,0.06) 0%, transparent 55%);
    pointer-events: none;
  }

  .shell { display: flex; min-height: 100vh; position: relative; z-index: 1; }

  /* ── Sidebar ── */
  .sidebar {
    width: 200px; flex-shrink: 0;
    background: #080d18; border-right: 1px solid #0f1929;
    display: flex; flex-direction: column; gap: 2rem;
    padding: 1.5rem 1rem;
    position: sticky; top: 0; height: 100vh;
  }
  .logo {
    display: flex; align-items: center; gap: 0.6rem;
    font-size: 0.85rem; text-decoration: none; color: #64748b;
    font-weight: 600; letter-spacing: 0.05em;
  }
  .logo em { color: #00d4ff; font-style: normal; }
  .logo-sq { width: 10px; height: 10px; background: #00d4ff; flex-shrink: 0; }

  nav { display: flex; flex-direction: column; gap: 0.25rem; }
  .nav-item {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.5rem 0.75rem; font-size: 0.78rem;
    background: none; border: none; cursor: pointer;
    color: #475569; text-align: left; width: 100%;
    font-family: inherit;
    transition: color 0.15s, background 0.15s;
  }
  .nav-item:hover { color: #94a3b8; background: #0f1929; }
  .nav-item.active { color: #00d4ff; background: rgba(0,212,255,0.07); }

  .sidebar-foot { margin-top: auto; display: flex; flex-direction: column; gap: 0.5rem; }

  /* ── Main ── */
  .main { flex: 1; padding: 2rem 2.5rem; max-width: 100%; overflow-x: auto; }

  .page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;
  }
  h1 { font-size: 1.4rem; font-weight: 600; color: #e2e8f0; }
  .desc { font-size: 0.78rem; color: #475569; margin-top: 0.25rem; }

  /* ── Toast ── */
  .toast {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.7rem 1rem; margin-bottom: 1.5rem;
    font-size: 0.82rem; border-left: 3px solid;
    animation: slideIn 0.25s ease;
  }
  .toast.ok  { background: rgba(34,197,94,0.07);  border-color: #22c55e; color: #86efac; }
  .toast.error { background: rgba(239,68,68,0.07); border-color: #ef4444; color: #fca5a5; }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: none; }
  }

  /* ── Table ── */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
  thead tr { border-bottom: 1px solid #0f1929; }
  th {
    text-align: left; padding: 0.6rem 0.75rem;
    font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase;
    color: #334155; font-weight: 500;
  }
  td { padding: 0.65rem 0.75rem; color: #94a3b8; border-bottom: 1px solid #0a0f1c; }
  tr:hover td { background: #0d1424; }
  td.entity { color: #cbd5e1; font-weight: 500; }
  td.year   { color: #00d4ff; }
  td.actions { display: flex; gap: 0.4rem; align-items: center; }

  .act-btn {
    display: flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; border: 1px solid #0f1929;
    background: none; cursor: pointer; color: #475569;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
  }
  .act-btn.edit:hover { color: #00d4ff; border-color: #00d4ff; background: rgba(0,212,255,0.07); }
  .act-btn.del:hover  { color: #ef4444; border-color: #ef4444; background: rgba(239,68,68,0.07); }

  /* ── Empty ── */
  .empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 1rem; padding: 4rem 2rem; color: #334155; font-size: 0.85rem; text-align: center;
  }

  /* ── Form ── */
  .form-card {
    max-width: 640px; display: flex; flex-direction: column; gap: 1rem;
    background: #080d18; border: 1px solid #0f1929; padding: 2rem;
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  label { display: flex; flex-direction: column; gap: 0.4rem; }
  label span {
    font-size: 0.7rem; color: #475569;
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  input {
    background: #060810; border: 1px solid #0f1929;
    color: #c9d4e3; padding: 0.55rem 0.75rem; font-size: 0.82rem;
    font-family: inherit; outline: none;
    transition: border-color 0.15s;
  }
  input:focus   { border-color: #00d4ff; }
  input:disabled { opacity: 0.4; cursor: not-allowed; }

  .form-actions {
    display: flex; gap: 0.75rem;
    justify-content: flex-end; margin-top: 0.5rem;
  }

  /* ── Buttons ── */
  .btn-primary {
    padding: 0.55rem 1.25rem; background: #00d4ff; color: #060810;
    border: none; cursor: pointer; font-size: 0.8rem; font-weight: 600;
    font-family: inherit; transition: opacity 0.15s;
  }
  .btn-primary:hover:not(:disabled) { opacity: 0.85; }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-secondary {
    padding: 0.55rem 1.25rem; background: none; color: #64748b;
    border: 1px solid #1e2a3a; cursor: pointer; font-size: 0.8rem;
    font-family: inherit; transition: color 0.15s, border-color 0.15s;
  }
  .btn-secondary:hover:not(:disabled) { color: #94a3b8; border-color: #334155; }
  .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-danger {
    padding: 0.55rem 1.25rem; background: none; color: #7f1d1d;
    border: 1px solid #3f0f0f; cursor: pointer; font-size: 0.8rem;
    font-family: inherit; transition: color 0.15s, border-color 0.15s, background 0.15s;
  }
  .btn-danger:hover:not(:disabled) {
    color: #ef4444; border-color: #ef4444;
    background: rgba(239,68,68,0.05);
  }
  .btn-danger:disabled { opacity: 0.4; cursor: not-allowed; }
  .small { padding: 0.4rem 0.7rem; font-size: 0.72rem; }

  @media (max-width: 640px) {
    .sidebar { display: none; }
    .main { padding: 1.25rem; }
    .form-row { grid-template-columns: 1fr; }
  }
</style>