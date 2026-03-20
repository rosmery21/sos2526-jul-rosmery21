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
		client: {start:"_app/immutable/entry/start.SUSwCai9.js",app:"_app/immutable/entry/app.C0LqbK3c.js",imports:["_app/immutable/entry/start.SUSwCai9.js","_app/immutable/chunks/DBNmVk-u.js","_app/immutable/chunks/BkmzAk0b.js","_app/immutable/chunks/ugKgeJL7.js","_app/immutable/entry/app.C0LqbK3c.js","_app/immutable/chunks/BkmzAk0b.js","_app/immutable/chunks/BwCMgtXZ.js","_app/immutable/chunks/BnzF24Bu.js","_app/immutable/chunks/ugKgeJL7.js","_app/immutable/chunks/VJtvNGXf.js","_app/immutable/chunks/CgtNvibp.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-Cd7r-Fcx.js')),
			__memo(() => import('./chunks/1-NU-trcuf.js')),
			__memo(() => import('./chunks/2-DJv0ntUG.js')),
			__memo(() => import('./chunks/3-CNtDmibO.js'))
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
