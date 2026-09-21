import { post } from './request'
import type { FolderAuthItem, SysUser, SysUserDetail } from './types'

export async function fetchUserPageApi(payload: {
	account?: string
	userName?: string
	orgId?: number
	isAdmin?: number
	employStatus?: number
	page?: number
	limit?: number
}) {
	const res = await post<SysUser>('/sysUser/page', {
		page: 1,
		limit: 10,
		...payload,
	})
	return { list: res.data, total: res.total ?? res.data.length }
}

export async function fetchUserDetailApi(id: number) {
	const res = await post<SysUserDetail>('/sysUser/detail', { id })
	const data = res.data[0]
	if (!data) throw new Error(res.msg || '用户不存在')
	return data
}

export async function createUserApi(payload: {
	account: string
	userName: string
	orgId: number
	headImg?: string
	sex?: number
	roleName?: string
	password?: string
	isAdmin?: number
}) {
	const res = await post<SysUser>('/sysUser/create', payload)
	return res.data[0]
}

export async function updateUserApi(payload: {
	id: number
	account?: string
	userName?: string
	orgId?: number
	headImg?: string
	sex?: number
	roleName?: string
	password?: string
	isAdmin?: number
	employStatus?: number
}) {
	const res = await post<SysUser>('/sysUser/update', payload)
	return res.data[0]
}

export async function deleteUserApi(id: number) {
	return post('/sysUser/delete', { id })
}

export async function resetPasswordApi(id: number) {
	return post('/sysUser/resetPassword', { id })
}

export async function assignUserAuthApi(id: number, folderAuths: FolderAuthItem[]) {
	return post('/sysUser/assignAuth', { id, folderAuths })
}
