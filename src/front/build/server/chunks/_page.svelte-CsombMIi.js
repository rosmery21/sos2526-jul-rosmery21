import { h as head, ab as ensure_array_like, ac as attr_style, ad as stringify, d as escape_html, c as attr } from './index-D30uW_Nw.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const apis = [
      {
        nombre: "Muertes por factores de riesgo",
        miembro: "Santiago Muñoz Jiménez",
        recurso: "deaths-by-risk-factors",
        frontend: "/deaths-by-risk-factors",
        api: "/api/v1/deaths-by-risk-factors",
        docs: "https://documenter.getpostman.com/view/52276011/2sBXcLfcbP",
        github: "https://github.com/123smj123",
        color: "#00d4ff"
      },
      {
        nombre: "Protestas",
        miembro: "Onésimo Morillo Vecino",
        recurso: "protests",
        frontend: "/protests",
        api: "/api/v1/protests",
        docs: "https://documenter.getpostman.com/view/52275979/2sBXiesEPb",
        github: "https://github.com/onesimomorillo",
        color: "#ff6b35"
      },
      {
        nombre: "Pandemias",
        miembro: "Alexia Gutiérrez Casado",
        recurso: "pandemics",
        frontend: "/pandemics",
        api: "/api/v1/pandemics",
        docs: "https://documenter.getpostman.com/view/52276047/2sBXigLDEC",
        github: "https://github.com/alexiagutierrezcasado",
        color: "#a855f7"
      },
      {
        nombre: "Desnutrición infantil",
        miembro: "Rosmery Marculli",
        recurso: "child-malnutritions",
        frontend: "/child-malnutritions",
        api: "/api/v1/child-malnutritions",
        docs: "#",
        github: "https://github.com/rosmery21",
        color: "#22c55e"
      }
    ];
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>SOS2526-10</title>`);
      });
      $$renderer3.push(`<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&amp;family=DM+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>`);
    });
    $$renderer2.push(`<main class="svelte-1uha8ag"><div class="bg svelte-1uha8ag"></div> <div class="noise svelte-1uha8ag"></div> <header class="svelte-1uha8ag"><div class="header-inner svelte-1uha8ag"><div class="tag svelte-1uha8ag">SOS-2526</div> <h1 class="svelte-1uha8ag">Grupo <span class="num svelte-1uha8ag">10</span></h1> <p class="subtitle svelte-1uha8ag">Análisis de datos de salud global</p> <a class="github-btn svelte-1uha8ag" href="https://github.com/gti-sos/SOS2526-10" target="_blank"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"></path></svg> Ver repositorio</a></div></header> <section class="grid svelte-1uha8ag"><!--[-->`);
    const each_array = ensure_array_like(apis);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let item = each_array[i];
      $$renderer2.push(`<article class="card svelte-1uha8ag"${attr_style(`--accent: ${stringify(item.color)}; --delay: ${stringify(i * 80)}ms`)}><div class="card-top svelte-1uha8ag"><span class="index svelte-1uha8ag">${escape_html(String(i + 1).padStart(2, "0"))}</span> <h2 class="svelte-1uha8ag">${escape_html(item.nombre)}</h2> <p class="miembro svelte-1uha8ag"><a${attr("href", item.github)} target="_blank" class="svelte-1uha8ag">${escape_html(item.miembro)}</a></p> <code class="recurso svelte-1uha8ag">${escape_html(item.recurso)}</code></div> <div class="card-links svelte-1uha8ag"><a${attr("href", item.frontend)} class="link link-primary svelte-1uha8ag"><span class="link-icon svelte-1uha8ag">⬡</span> Interfaz</a> <a${attr("href", item.api)} class="link link-secondary svelte-1uha8ag" target="_blank"><span class="link-icon svelte-1uha8ag">◈</span> API REST</a> <a${attr("href", item.docs)} class="link link-secondary svelte-1uha8ag" target="_blank"><span class="link-icon svelte-1uha8ag">◎</span> Documentación</a></div></article>`);
    }
    $$renderer2.push(`<!--]--></section></main>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CsombMIi.js.map
