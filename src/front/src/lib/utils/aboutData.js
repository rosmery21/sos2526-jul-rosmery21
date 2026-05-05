import apis from '$lib/data/apis.js';

export function loadAboutInfo() {
    let parsedApis = `<section class="grid">` + apis.map(api => parseApi(api)).join('') + `</section>`;
    return parsedApis;
}

// @ts-ignore
function parseApi(api) {
    return `<article class="card">
        <h3>${api.nombre}</h3>
        <p>Miembro: ${api.miembro}</p>
        <p>Recurso: ${api.recurso}</p>
        <p>Frontend: <a href="${api.frontend}" target="_blank">${api.frontend}</a></p>
        <p>Video explicativo: <a href="${api.video}" target="_blank">${api.video}</a></p>
    </article>`;
}