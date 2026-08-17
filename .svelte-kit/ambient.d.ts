
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const VITE_HOST: string;
	export const VITE_HOST_MSGWS: string;
	export const VITE_HOST_WS: string;
	export const VITE_NODE_ENV: string;
	export const VITE_TOKEN: string;
	export const NODE_ENV: string;
	export const npm_package_config_commitizen_useEmoji: string;
	export const OSLogRateLimit: string;
	export const ANDROID_NDK_HOME: string;
	export const GIT_ASKPASS: string;
	export const npm_config_user_agent: string;
	export const BUN_INSTALL: string;
	export const CODELLDB_LAUNCH_CONNECT_FILE: string;
	export const NVM_BIN: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const npm_lifecycle_script: string;
	export const LOGNAME: string;
	export const XPC_SERVICE_NAME: string;
	export const npm_lifecycle_event: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const npm_command: string;
	export const XPC_FLAGS: string;
	export const COLORTERM: string;
	export const NODE_PATH: string;
	export const GIT_EXEC_PATH: string;
	export const npm_package_name: string;
	export const npm_package_version: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const TERM_PROGRAM: string;
	export const NVM_INC: string;
	export const HOME: string;
	export const JAVA_HOME: string;
	export const USER_ZDOTDIR: string;
	export const USER: string;
	export const MAVEN_HOME: string;
	export const __CFBundleIdentifier: string;
	export const npm_package_json: string;
	export const PATH: string;
	export const pnpm_config_verify_deps_before_run: string;
	export const NVM_CD_FLAGS: string;
	export const npm_config_node_gyp: string;
	export const PWD: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const VSCODE_INJECTION: string;
	export const VSCODE_PROFILE_INITIALIZED: string;
	export const SSH_AUTH_SOCK: string;
	export const SVELTEKIT_FORK: string;
	export const npm_node_execpath: string;
	export const PNPM_SCRIPT_SRC_DIR: string;
	export const NVM_DIR: string;
	export const LANG: string;
	export const ZDOTDIR: string;
	export const SHELL: string;
	export const npm_package_config_commitizen_path: string;
	export const npm_execpath: string;
	export const TERM_PROGRAM_VERSION: string;
	export const COMMAND_MODE: string;
	export const VSCODE_PYTHON_AUTOACTIVATE_GUARD: string;
	export const ANDROID_SDK_HOME: string;
	export const GIT_PREFIX: string;
	export const SHLVL: string;
	export const MallocNanoZone: string;
	export const TERM: string;
	export const TMPDIR: string;
	export const NODE: string;
	export const INIT_CWD: string;
	export const BUN_INSPECT_CONNECT_TO: string;
	export const VSCODE_GIT_IPC_AUTH_TOKEN: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		VITE_HOST: string;
		VITE_HOST_MSGWS: string;
		VITE_HOST_WS: string;
		VITE_NODE_ENV: string;
		VITE_TOKEN: string;
		NODE_ENV: string;
		npm_package_config_commitizen_useEmoji: string;
		OSLogRateLimit: string;
		ANDROID_NDK_HOME: string;
		GIT_ASKPASS: string;
		npm_config_user_agent: string;
		BUN_INSTALL: string;
		CODELLDB_LAUNCH_CONNECT_FILE: string;
		NVM_BIN: string;
		VSCODE_GIT_IPC_HANDLE: string;
		npm_lifecycle_script: string;
		LOGNAME: string;
		XPC_SERVICE_NAME: string;
		npm_lifecycle_event: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		npm_command: string;
		XPC_FLAGS: string;
		COLORTERM: string;
		NODE_PATH: string;
		GIT_EXEC_PATH: string;
		npm_package_name: string;
		npm_package_version: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		TERM_PROGRAM: string;
		NVM_INC: string;
		HOME: string;
		JAVA_HOME: string;
		USER_ZDOTDIR: string;
		USER: string;
		MAVEN_HOME: string;
		__CFBundleIdentifier: string;
		npm_package_json: string;
		PATH: string;
		pnpm_config_verify_deps_before_run: string;
		NVM_CD_FLAGS: string;
		npm_config_node_gyp: string;
		PWD: string;
		__CF_USER_TEXT_ENCODING: string;
		VSCODE_INJECTION: string;
		VSCODE_PROFILE_INITIALIZED: string;
		SSH_AUTH_SOCK: string;
		SVELTEKIT_FORK: string;
		npm_node_execpath: string;
		PNPM_SCRIPT_SRC_DIR: string;
		NVM_DIR: string;
		LANG: string;
		ZDOTDIR: string;
		SHELL: string;
		npm_package_config_commitizen_path: string;
		npm_execpath: string;
		TERM_PROGRAM_VERSION: string;
		COMMAND_MODE: string;
		VSCODE_PYTHON_AUTOACTIVATE_GUARD: string;
		ANDROID_SDK_HOME: string;
		GIT_PREFIX: string;
		SHLVL: string;
		MallocNanoZone: string;
		TERM: string;
		TMPDIR: string;
		NODE: string;
		INIT_CWD: string;
		BUN_INSPECT_CONNECT_TO: string;
		VSCODE_GIT_IPC_AUTH_TOKEN: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
