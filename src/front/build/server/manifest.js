const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.BERMrUsn.js",app:"_app/immutable/entry/app.BwSAVizR.js",imports:["_app/immutable/entry/start.BERMrUsn.js","_app/immutable/chunks/TRKGixEs.js","_app/immutable/chunks/jEOqV4A8.js","_app/immutable/chunks/D3RB6j4O.js","_app/immutable/entry/app.BwSAVizR.js","_app/immutable/chunks/jEOqV4A8.js","_app/immutable/chunks/DUq-ztmJ.js","_app/immutable/chunks/D3mhUQfM.js","_app/immutable/chunks/D3RB6j4O.js","_app/immutable/chunks/B0s9diEI.js","_app/immutable/chunks/D2iM5wbs.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-CUpH_jd6.js')),
			__memo(() => import('./chunks/1-BhJtv_N-.js')),
			__memo(() => import('./chunks/2-DzwTzTW4.js')),
			__memo(() => import('./chunks/3-De-T7HQX.js')),
			__memo(() => import('./chunks/4-DcpsSiOE.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/deaths-by-risk-factors",
				pattern: /^\/deaths-by-risk-factors\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/protests",
				pattern: /^\/protests\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
