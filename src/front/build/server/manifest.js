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
		client: {start:"_app/immutable/entry/start.B3WsL48g.js",app:"_app/immutable/entry/app.Dhw9bTta.js",imports:["_app/immutable/entry/start.B3WsL48g.js","_app/immutable/chunks/CyuB_Y2A.js","_app/immutable/chunks/BYAuJWRz.js","_app/immutable/chunks/B93_p-Lf.js","_app/immutable/entry/app.Dhw9bTta.js","_app/immutable/chunks/BYAuJWRz.js","_app/immutable/chunks/Bj9E3YpF.js","_app/immutable/chunks/BBLuSfmN.js","_app/immutable/chunks/B93_p-Lf.js","_app/immutable/chunks/CTSAeImI.js","_app/immutable/chunks/BbWHltVL.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-xqCnBzN8.js')),
			__memo(() => import('./chunks/1-D58p-K2Z.js')),
			__memo(() => import('./chunks/2-CZ_kigHu.js')),
			__memo(() => import('./chunks/3-cGo22_bY.js')),
			__memo(() => import('./chunks/4-CB-wbuhf.js')),
			__memo(() => import('./chunks/5-BNt0zp1P.js')),
			__memo(() => import('./chunks/6-tRy1OPWv.js')),
			__memo(() => import('./chunks/7-mNYGrSBr.js')),
			__memo(() => import('./chunks/8-DiaaROeN.js')),
			__memo(() => import('./chunks/9-C8SU2g_N.js'))
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
				id: "/pandemics",
				pattern: /^\/pandemics\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/pandemics/create",
				pattern: /^\/pandemics\/create\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/pandemics/[entity]/[year]",
				pattern: /^\/pandemics\/([^/]+?)\/([^/]+?)\/?$/,
				params: [{"name":"entity","optional":false,"rest":false,"chained":false},{"name":"year","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/protests",
				pattern: /^\/protests\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
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
