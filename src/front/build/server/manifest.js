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
		client: {start:"_app/immutable/entry/start.Byffw8Mu.js",app:"_app/immutable/entry/app.pNodv1EB.js",imports:["_app/immutable/entry/start.Byffw8Mu.js","_app/immutable/chunks/B7bXZ2q8.js","_app/immutable/chunks/Ca2MqjLR.js","_app/immutable/chunks/Bh4wmLNe.js","_app/immutable/entry/app.pNodv1EB.js","_app/immutable/chunks/Ca2MqjLR.js","_app/immutable/chunks/BHgWvn_P.js","_app/immutable/chunks/CjjyF07J.js","_app/immutable/chunks/Bh4wmLNe.js","_app/immutable/chunks/DFUciLV1.js","_app/immutable/chunks/DdNExdkx.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-C3cJXHji.js')),
			__memo(() => import('./chunks/1-BL5YnjWR.js')),
			__memo(() => import('./chunks/2-DtKdxIR-.js')),
			__memo(() => import('./chunks/3-R8FkHxUD.js')),
			__memo(() => import('./chunks/4-C3cbdcr4.js')),
			__memo(() => import('./chunks/5-BfajIr8F.js')),
			__memo(() => import('./chunks/6-DxYw83j-.js')),
			__memo(() => import('./chunks/7-B4lLdtoB.js')),
			__memo(() => import('./chunks/8-DDl4hQ10.js')),
			__memo(() => import('./chunks/9-CvX9B4hx.js'))
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
