import { h as head, ae as attr_class, c as attr, d as escape_html, ab as ensure_array_like } from './index-D30uW_Nw.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let registros = [];
    let cargando = false;
    let vista = "lista";
    head("11wedfp", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Muertes por factores de riesgo – SOS2526-10</title>`);
      });
      $$renderer3.push(`<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>`);
    });
    $$renderer2.push(`<div class="shell svelte-11wedfp"><div class="bg svelte-11wedfp"></div> <aside class="sidebar svelte-11wedfp"><a href="/" class="logo svelte-11wedfp"><span class="logo-sq svelte-11wedfp"></span> <span>SOS<em class="svelte-11wedfp">2526</em></span></a> <nav class="svelte-11wedfp"><button${attr_class("nav-item svelte-11wedfp", void 0, { "active": vista === "lista" })}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="9" x2="9" y2="21"></line></svg> Listado</button> <button${attr_class("nav-item svelte-11wedfp", void 0, { "active": vista === "crear" })}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Nuevo registro</button></nav> <div class="sidebar-foot svelte-11wedfp"><button class="btn-secondary small svelte-11wedfp"${attr("disabled", cargando, true)}>Cargar datos iniciales</button> <button class="btn-danger small svelte-11wedfp"${attr("disabled", cargando, true)}>Eliminar todos</button></div></aside> <main class="main svelte-11wedfp">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<header class="page-header svelte-11wedfp"><div><h1 class="svelte-11wedfp">Muertes por factores de riesgo</h1> <p class="desc svelte-11wedfp">Base de datos global · ${escape_html(registros.length)} registros cargados</p></div> <button class="btn-primary svelte-11wedfp">+ Nuevo registro</button></header> `);
      if (registros.length === 0) {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<div class="empty svelte-11wedfp"><p>No hay registros disponibles.</p> <button class="btn-secondary svelte-11wedfp">Cargar datos de ejemplo</button></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="table-wrap svelte-11wedfp"><table class="svelte-11wedfp"><thead class="svelte-11wedfp"><tr class="svelte-11wedfp"><th class="svelte-11wedfp">País / Entidad</th><th class="svelte-11wedfp">Año</th><th class="svelte-11wedfp">Presión arterial</th><th class="svelte-11wedfp">Contam. aire</th><th class="svelte-11wedfp">Desnutrición</th><th class="svelte-11wedfp">Contam. doméstica</th><th class="svelte-11wedfp">Glucosa ayunas</th><th class="svelte-11wedfp">Acciones</th></tr></thead><tbody><!--[-->`);
        const each_array = ensure_array_like(registros);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let reg = each_array[$$index];
          $$renderer2.push(`<tr class="svelte-11wedfp"><td class="entity svelte-11wedfp">${escape_html(reg.entity)}</td><td class="year svelte-11wedfp">${escape_html(reg.year)}</td><td class="svelte-11wedfp">${escape_html(reg.high_systolic_blood_pressure?.toLocaleString("es-ES") ?? "—")}</td><td class="svelte-11wedfp">${escape_html(reg.air_pollution?.toLocaleString("es-ES") ?? "—")}</td><td class="svelte-11wedfp">${escape_html(reg.child_wasting?.toLocaleString("es-ES") ?? "—")}</td><td class="svelte-11wedfp">${escape_html(reg.household_air_pollution_from_solid_fuels?.toLocaleString("es-ES") ?? "—")}</td><td class="svelte-11wedfp">${escape_html(reg.high_fasting_plasma_glucose?.toLocaleString("es-ES") ?? "—")}</td><td class="actions svelte-11wedfp"><button class="act-btn edit svelte-11wedfp" title="Editar"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button> <button class="act-btn del svelte-11wedfp" title="Eliminar"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4h6v2"></path></svg></button></td></tr>`);
        }
        $$renderer2.push(`<!--]--></tbody></table></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></main></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BDmTu6sP.js.map
