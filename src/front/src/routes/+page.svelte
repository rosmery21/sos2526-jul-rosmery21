<script>
	const apis = [
		{
			nombre: 'Muertes por factores de riesgo',
			miembro: 'Santiago Muñoz Jiménez',
			recurso: 'deaths-by-risk-factors',
			frontend: '/deaths-by-risk-factors',
			api: '/api/v1/deaths-by-risk-factors',
			docs: 'https://documenter.getpostman.com/view/52276011/2sBXcLfcbP',
			github: 'https://github.com/123smj123',
			color: '#00d4ff'
		},
		{
			nombre: 'Protestas',
			miembro: 'Onésimo Morillo Vecino',
			recurso: 'protests',
			frontend: '/protests',
			api: '/api/v1/protests',
			docs: 'https://documenter.getpostman.com/view/52275979/2sBXiesEPb',
			github: 'https://github.com/onesimomorillo',
			color: '#ff6b35'
		},
		{
			nombre: 'Pandemias',
			miembro: 'Alexia Gutiérrez Casado',
			recurso: 'pandemics',
			frontend: '/pandemics',
			api: '/api/v1/pandemics',
			docs: 'https://documenter.getpostman.com/view/52276047/2sBXigLDEC',
			github: 'https://github.com/alexiagutierrezcasado',
			color: '#a855f7'
		},
		{
			nombre: 'Desnutrición infantil',
			miembro: 'Rosmery Marculli',
			recurso: 'child-malnutritions',
			frontend: '/child-malnutritions',
			api: '/api/v1/child-malnutritions',
			docs: '#',
			github: 'https://github.com/rosmery21',
			color: '#22c55e'
		}
	];
</script>

<svelte:head>
	<title>SOS2526-10</title>
	<link
		href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<main>
	<div class="bg"></div>
	<div class="noise"></div>

	<header>
		<div class="header-inner">
			<div class="tag">SOS-2526</div>
			<h1>Grupo <span class="num">10</span></h1>
			<p class="subtitle">Análisis de datos de salud global</p>
			<a class="github-btn" href="https://github.com/gti-sos/SOS2526-10" target="_blank">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
					><path
						d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
					/></svg
				>
				Ver repositorio
			</a>
		</div>
	</header>

	<section class="grid">
		{#each apis as item, i (item.recurso)}
			<article class="card" style="--accent: {item.color}; --delay: {i * 80}ms">
				<div class="card-top">
					<span class="index">{String(i + 1).padStart(2, '0')}</span>
					<h2>{item.nombre}</h2>
					<p class="miembro">
						<a href={item.github} target="_blank">{item.miembro}</a>
					</p>
					<code class="recurso">{item.recurso}</code>
				</div>
				<div class="card-links">
					<a href={item.frontend} class="link link-primary">
						<span class="link-icon">⬡</span> Interfaz
					</a>
					<a href={item.api} class="link link-secondary" target="_blank">
						<span class="link-icon">◈</span> API REST
					</a>
					<a href={item.docs} class="link link-secondary" target="_blank">
						<span class="link-icon">◎</span> Documentación
					</a>
				</div>
			</article>
		{/each}
	</section>
</main>

<style>
	:global(*, *::before, *::after) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}
	:global(body) {
		background: #060810;
		font-family: 'DM Mono', 'Courier New', monospace;
		color: #e2e8f0;
		min-height: 100vh;
		overflow-x: hidden;
	}

	.bg {
		position: fixed;
		inset: 0;
		z-index: 0;
		background:
			radial-gradient(ellipse 80% 50% at 20% 10%, rgba(0, 150, 255, 0.08) 0%, transparent 60%),
			radial-gradient(ellipse 60% 40% at 80% 80%, rgba(120, 40, 200, 0.07) 0%, transparent 55%);
		pointer-events: none;
	}
	.noise {
		position: fixed;
		inset: 0;
		z-index: 0;
		opacity: 0.035;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
		pointer-events: none;
	}

	main {
		position: relative;
		z-index: 1;
		max-width: 1100px;
		margin: 0 auto;
		padding: 3rem 1.5rem 5rem;
	}

	header {
		margin-bottom: 4rem;
	}
	.header-inner {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.tag {
		display: inline-block;
		font-size: 0.7rem;
		letter-spacing: 0.25em;
		text-transform: uppercase;
		color: #64748b;
		border: 1px solid #1e2a3a;
		padding: 0.25rem 0.6rem;
		width: fit-content;
		margin-bottom: 0.5rem;
	}
	h1 {
		font-family: 'Syne', serif;
		font-size: clamp(2.5rem, 7vw, 5rem);
		font-weight: 800;
		line-height: 1;
		color: #f1f5f9;
		letter-spacing: -0.02em;
	}
	h1 .num {
		color: transparent;
		-webkit-text-stroke: 2px #00d4ff;
		text-shadow: 0 0 40px rgba(0, 212, 255, 0.3);
	}
	.subtitle {
		color: #475569;
		font-size: 0.9rem;
		margin-top: 0.25rem;
	}
	.github-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		border: 1px solid #1e2a3a;
		color: #94a3b8;
		font-size: 0.8rem;
		text-decoration: none;
		width: fit-content;
		transition:
			border-color 0.2s,
			color 0.2s;
	}
	.github-btn:hover {
		border-color: #00d4ff;
		color: #e2e8f0;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 1px;
		border: 1px solid #0f1929;
		background: #0f1929;
	}

	.card {
		background: #080d18;
		padding: 1.75rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		animation: fadeUp 0.5s ease both;
		animation-delay: var(--delay);
		transition: background 0.2s;
		border-left: 2px solid transparent;
	}
	.card:hover {
		background: #0d1424;
		border-left-color: var(--accent);
	}
	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.card-top {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.index {
		font-size: 0.65rem;
		color: #334155;
		letter-spacing: 0.15em;
	}
	h2 {
		font-size: 1rem;
		font-weight: 600;
		color: #cbd5e1;
		line-height: 1.3;
	}
	.miembro a {
		font-size: 0.78rem;
		color: #475569;
		text-decoration: none;
		transition: color 0.2s;
	}
	.miembro a:hover {
		color: var(--accent);
	}
	.recurso {
		display: inline-block;
		margin-top: 0.25rem;
		font-size: 0.7rem;
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
		padding: 0.2rem 0.5rem;
		width: fit-content;
	}

	.card-links {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-top: auto;
	}
	.link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 0.7rem;
		font-size: 0.78rem;
		text-decoration: none;
		transition:
			background 0.15s,
			color 0.15s;
	}
	.link-icon {
		font-size: 0.7rem;
		opacity: 0.6;
	}
	.link-primary {
		background: color-mix(in srgb, var(--accent) 12%, transparent);
		color: var(--accent);
		border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
	}
	.link-primary:hover {
		background: color-mix(in srgb, var(--accent) 20%, transparent);
	}
	.link-secondary {
		color: #475569;
		border: 1px solid #111827;
	}
	.link-secondary:hover {
		color: #94a3b8;
		border-color: #1e2a3a;
		background: #0f1929;
	}
</style>
