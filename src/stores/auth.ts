import { setToken } from '@/api/request'
import { assignOrgAuthApi, fetchOrgFolderAuthsApi } from '@/api/org'
import { assignUserAuthApi, fetchUserDetailApi } from '@/api/user'
import type { FolderAuthDraft } from '@/types'
import { docs, docContent, loadedFolderIds, selectedDocId } from './docs'
import { departments, employees, selectedOrg } from './org'
import { focusMode, requireAdmin, session } from './session'

export async function loadUserFolderAuths(userId: string): Promise<FolderAuthDraft[]> {
	const detail = await fetchUserDetailApi(Number(userId))
	return detail.folderAuths.map(item => ({
		folderId: item.folderId,
		folderName: item.folderName || undefined,
		authRead: item.authRead === 1,
		authWrite: item.authWrite === 1,
	}))
}

export async function loadOrgFolderAuths(orgId: string): Promise<FolderAuthDraft[]> {
	const list = await fetchOrgFolderAuthsApi(Number(orgId))
	return list.map(item => ({
		folderId: item.folderId,
		folderName: item.folderName || undefined,
		authRead: item.authRead === 1,
		authWrite: item.authWrite === 1,
		inherited: item.inherited,
	}))
}

export async function assignUserFolderAuths(payload: { userId: string; folderAuths: FolderAuthDraft[] }) {
	requireAdmin()
	await assignUserAuthApi(
		Number(payload.userId),
		payload.folderAuths.map(item => ({
			folderId: item.folderId,
			authRead: item.authRead || item.authWrite ? 1 : 0,
			authWrite: item.authWrite ? 1 : 0,
		})),
	)
}

export async function assignOrgFolderAuths(payload: { orgId: string; folderAuths: FolderAuthDraft[] }) {
	await assignOrgAuthApi(
		Number(payload.orgId),
		payload.folderAuths.map(item => ({
			folderId: item.folderId,
			authRead: item.authRead || item.authWrite ? 1 : 0,
			authWrite: item.authWrite ? 1 : 0,
		})),
	)
}

export function logout() {
	setToken(null)
	session.set(null)
	docs.set([])
	loadedFolderIds.set([])
	departments.set([])
	employees.set([])
	docContent.set({})
	selectedDocId.set(null)
	selectedOrg.set(null)
	focusMode.set(false)
}
