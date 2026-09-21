import type { ApiResponse } from './types'

const TOKEN_KEY = 'editor-token'

/** 内存缓存，避免只依赖 localStorage 时被异步 session 水合清掉 */
let memoryToken: string | null = null

/** 业务码 201 / HTTP 401：登录失效时回调（由 App 注册 logout） */
type AuthExpiredHandler = () => void
let onAuthExpired: AuthExpiredHandler | null = null
let authExpiredNotifying = false

export function setOnAuthExpired(handler: AuthExpiredHandler | null) {
	onAuthExpired = handler
}

export function getToken() {
	if (memoryToken) return memoryToken
	memoryToken = localStorage.getItem(TOKEN_KEY)
	return memoryToken
}

export function setToken(token: string | null) {
	memoryToken = token
	if (!token) {
		localStorage.removeItem(TOKEN_KEY)
		return
	}
	localStorage.setItem(TOKEN_KEY, token)
}

function notifyAuthExpired() {
	if (authExpiredNotifying) return
	authExpiredNotifying = true
	setToken(null)
	try {
		onAuthExpired?.()
	} finally {
		queueMicrotask(() => {
			authExpiredNotifying = false
		})
	}
}

function resolveUrl(path: string) {
	// 生产环境：从服务器注入的配置中获取端口
	const serverConfig = (window as any).__SERVER_CONFIG__ as { port?: number | string } | undefined
	const serverPort = serverConfig?.port
	
	// 如果有注入的端口号（打包后的 exe），使用完整的 URL
	if (serverPort && typeof serverPort === 'number' && import.meta.env.PROD) {
		// 使用当前页面的 hostname，而不是硬编码 127.0.0.1
		const hostname = window.location.hostname || 'localhost'
		const protocol = window.location.protocol || 'http:'
		const baseUrl = `${protocol}//${hostname}:${serverPort}/api/v1`
		if (path.startsWith('http://') || path.startsWith('https://')) return path
		return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
	}
	
	// 开发环境：使用 Vite 代理
	const base = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''
	if (path.startsWith('http://') || path.startsWith('https://')) return path
	return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export class ApiError extends Error {
	code: number

	constructor(code: number, message: string) {
		super(message)
		this.code = code
		this.name = 'ApiError'
	}
}

/** Token 失效：已触发退出登录，调用方无需再弹业务错误 */
export class AuthExpiredError extends ApiError {
	constructor(message = '登录已失效，请重新登录') {
		super(201, message)
		this.name = 'AuthExpiredError'
	}
}

export function isAuthExpiredError(error: unknown): error is AuthExpiredError {
	return error instanceof AuthExpiredError
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
	const headers = new Headers(init.headers)
	const isForm = init.body instanceof FormData
	if (!isForm && !headers.has('Content-Type') && init.body) {
		headers.set('Content-Type', 'application/json')
	}

	const token = getToken()
	if (token && !headers.has('Authorization')) {
		headers.set('Authorization', `Bearer ${token}`)
	}

	const res = await fetch(resolveUrl(path), { ...init, headers })
	const json = (await res.json().catch(() => null)) as
		| (ApiResponse<T> & { message?: string | string[]; error?: string })
		| null

	const nestMsg = Array.isArray(json?.message) ? json.message.join('；') : json?.message
	const failMsg = nestMsg || json?.msg

	// HTTP 401 或业务码 201：Token 无效，清空登录态并回到登录页
	if (res.status === 401 || json?.code === 201) {
		notifyAuthExpired()
		throw new AuthExpiredError(failMsg || '登录已失效，请重新登录')
	}

	if (!res.ok) {
		throw new ApiError(res.status, failMsg || `请求失败 (${res.status})`)
	}
	if (!json) {
		throw new ApiError(res.status, '响应解析失败')
	}
	if (json.code !== 200) {
		throw new ApiError(json.code, json.msg || '业务请求失败')
	}
	return json
}

export async function post<T>(path: string, body?: unknown) {
	return request<T>(path, {
		method: 'POST',
		body: body === undefined ? undefined : JSON.stringify(body),
	})
}

export async function postForm<T>(path: string, form: FormData) {
	return request<T>(path, {
		method: 'POST',
		body: form,
	})
}
