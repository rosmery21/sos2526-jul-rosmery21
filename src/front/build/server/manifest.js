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
		client: {start:"_app/immutable/entry/start.DOWcz7L1.js",app:"_app/immutable/entry/app.49qv770e.js",imports:["_app/immutable/entry/start.DOWcz7L1.js","_app/immutable/chunks/DgzpzkxG.js","_app/immutable/chunks/BdzuRlGk.js","_app/immutable/chunks/B4lb6oQz.js","_app/immutable/entry/app.49qv770e.js","_app/immutable/chunks/BdzuRlGk.js","_app/immutable/chunks/Dn539gm8.js","_app/immutable/chunks/BzznDWs5.js","_app/immutable/chunks/B4lb6oQz.js","_app/immutable/chunks/BkD8iEWA.js","_app/immutable/chunks/H20gRAwY.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-C_YiGNmf.js')),
			__memo(() => import('./chunks/1-BcnEvpbQ.js')),
			__memo(() => import('./chunks/2-Cdm1_ESE.js')),
			__memo(() => import('./chunks/3-DTbTws3u.js'))
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
