
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/analytics" | "/dashboard" | "/database" | "/database/backup" | "/database/restore" | "/docs" | "/docs/api" | "/docs/changelog" | "/docs/guide" | "/login" | "/notify" | "/orders" | "/orders/export" | "/orders/list" | "/orders/return" | "/plugins" | "/plugins/installed" | "/plugins/market" | "/security" | "/settings" | "/users" | "/users/list" | "/users/logs" | "/users/roles";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/analytics": Record<string, never>;
			"/dashboard": Record<string, never>;
			"/database": Record<string, never>;
			"/database/backup": Record<string, never>;
			"/database/restore": Record<string, never>;
			"/docs": Record<string, never>;
			"/docs/api": Record<string, never>;
			"/docs/changelog": Record<string, never>;
			"/docs/guide": Record<string, never>;
			"/login": Record<string, never>;
			"/notify": Record<string, never>;
			"/orders": Record<string, never>;
			"/orders/export": Record<string, never>;
			"/orders/list": Record<string, never>;
			"/orders/return": Record<string, never>;
			"/plugins": Record<string, never>;
			"/plugins/installed": Record<string, never>;
			"/plugins/market": Record<string, never>;
			"/security": Record<string, never>;
			"/settings": Record<string, never>;
			"/users": Record<string, never>;
			"/users/list": Record<string, never>;
			"/users/logs": Record<string, never>;
			"/users/roles": Record<string, never>
		};
		Pathname(): "/" | "/analytics" | "/dashboard" | "/database/backup" | "/database/restore" | "/docs/api" | "/docs/changelog" | "/docs/guide" | "/login" | "/notify" | "/orders/export" | "/orders/list" | "/orders/return" | "/plugins/installed" | "/plugins/market" | "/security" | "/settings" | "/users/list" | "/users/logs" | "/users/roles";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}