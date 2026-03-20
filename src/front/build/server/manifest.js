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
		client: {start:"_app/immutable/entry/start.BnYHQ6jJ.js",app:"_app/immutable/entry/app.DIX_zQTg.js",imports:["_app/immutable/entry/start.BnYHQ6jJ.js","_app/immutable/chunks/BVXOgWKb.js","_app/immutable/chunks/BYAuJWRz.js","_app/immutable/chunks/B93_p-Lf.js","_app/immutable/entry/app.DIX_zQTg.js","_app/immutable/chunks/BYAuJWRz.js","_app/immutable/chunks/Bj9E3YpF.js","_app/immutable/chunks/BBLuSfmN.js","_app/immutable/chunks/B93_p-Lf.js","_app/immutable/chunks/CTSAeImI.js","_app/immutable/chunks/BbWHltVL.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-xqCnBzN8.js')),
			__memo(() => import('./chunks/1-BMTtdWE-.js')),
			__memo(() => import('./chunks/2-nN9e2Y0T.js')),
			__memo(() => import('./chunks/3-rFlgtXlK.js')),
			__memo(() => import('./chunks/4-L9txjR4K.js')),
			__memo(() => import('./chunks/5-BQFY4tIH.js')),
			__memo(() => import('./chunks/6-DZcoSXor.js'))
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
				id: "/deaths-by-risk-factors/create",
				pattern: /^\/deaths-by-risk-factors\/create\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/deaths-by-risk-factors/[entity]/[year]",
				pattern: /^\/deaths-by-risk-factors\/([^/]+?)\/([^/]+?)\/?$/,
				params: [{"name":"entity","optional":false,"rest":false,"chained":false},{"name":"year","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/protests",
				pattern: /^\/protests\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
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
