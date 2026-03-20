import apis from './data/apis.js';

export function loadApisInfo() {
    let parsedApis = `<section>` + apis.map(api => parseApi(api)).join('') + `</section>`;
    return parsedApis;
}

function parseApi(api) {
    return `<article>
        <h3>${api.nombre}</h3>
        <p>Miembro: ${api.miembro}</p>
        <p>Recurso: ${api.recurso}</p>
        <p>Frontend: <a href="${api.frontend}" target="_blank">${api.frontend}</a></p>
        <p>API: <a href="${api.api}" target="_blank">${api.api}</a></p>
        <p>Docs: <a href="${api.docs}" target="_blank">${api.docs}</a></p>
        <p>GitHub: <a href="${api.github}" target="_blank">${api.github}</a></p>
    </article>`;
}