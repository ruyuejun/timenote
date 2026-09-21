import { post } from './request'
import type { SysConfig, SysOperLog } from './types'

export const FILE_STORE_PATH_KEY = 'fileStorePath'

export async function fetchConfigPageApi(payload?: {
	configKey?: string
	page?: number
	limit?: number
}) {
	const res = await post<SysConfig>('/sysConfig/page', {
		page: 1,
		limit: 50,
		...payload,
	})
	return { list: res.data, total: res.total ?? res.data.length }
}

export async function fetchConfigDetailApi(id: number) {
	const res = await post<SysConfig>('/sysConfig/detail', { id })
	return res.data[0]
}

export async function updateConfigApi(payload: {
	id: number
	configKey?: string
	configValue?: string
}) {
	return post('/sysConfig/update', payload)
}

export async function deleteConfigApi(id: number) {
	return post('/sysConfig/delete', { id })
}

/** 获取服务器端口配置 */
export async function fetchServerPortApi() {
	const res = await post<{ port: number }>('/sysConfig/getPort')
	return res.data[0]
}

/** 更新服务器端口配置 */
export async function updateServerPortApi(port: number) {
	return post('/sysConfig/updatePort', { port })
}

export async function fetchOperLogPageApi(payload?: {
	userName?: string
	path?: string
	status?: number
	beginTime?: string
	endTime?: string
	page?: number
	limit?: number
}) {
	const res = await post<SysOperLog>('/sysOperLog/page', {
		page: 1,
		limit: 20,
		...payload,
	})
	return { list: res.data, total: res.total ?? res.data.length }
}
