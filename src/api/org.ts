import { post } from './request'
import type { FolderAuthItem, OrgFolderAuth, SysOrgTree } from './types'

export async function fetchOrgTreeApi() {
	const res = await post<SysOrgTree>('/sysOrg/tree')
	return res.data
}

export async function createOrgApi(payload: { orgName: string; parentId?: number }) {
	const res = await post<SysOrgTree>('/sysOrg/create', {
		orgName: payload.orgName,
		parentId: payload.parentId ?? 0,
	})
	return res.data[0]
}

export async function updateOrgApi(payload: { id: number; orgName?: string; parentId?: number }) {
	return post('/sysOrg/update', payload)
}

export async function deleteOrgApi(id: number) {
	return post('/sysOrg/delete', { id })
}

export async function moveOrgApi(id: number, direction: 'up' | 'down') {
	return post('/sysOrg/move', { id, direction })
}

export async function fetchOrgFolderAuthsApi(id: number) {
	const res = await post<OrgFolderAuth>('/sysOrg/folderAuths', { id })
	return res.data
}

export async function assignOrgAuthApi(id: number, folderAuths: FolderAuthItem[]) {
	return post('/sysOrg/assignAuth', { id, folderAuths })
}
