import { derived, get } from 'svelte/store'

import { changePasswordApi, loginApi, updateProfileApi } from '@/api/auth'
import { setToken } from '@/api/request'
import { mapLoginUser } from '$lib/mappers'
import { uploadAvatarImage } from '$lib/upload-image'
import type { SessionState } from '@/types'
import { persisted } from './persist'

const SESSION_KEY = 'editor-session-v2'

export const session = persisted<SessionState | null>(SESSION_KEY, null)
export const currentUser = derived(session, $session => $session?.user ?? null)
export const fileAccessPath = derived(session, $session => $session?.fileAccessPath ?? '')
export const focusMode = persisted('editor-focus-mode', false)

export function requireSession() {
	const current = get(session)
	if (!current?.token) throw new Error('请先登录')
	return current
}

export function requireAdmin() {
	const current = requireSession()
	if (current.user.role !== 'admin') throw new Error('仅管理员可操作')
	return current
}

export async function login(payload: { username: string; password: string }) {
	const result = await loginApi({
		account: payload.username,
		password: payload.password,
	})
	setToken(result.token)
	session.set({
		token: result.token,
		fileAccessPath: result.fileAccessPath,
		user: mapLoginUser(result.user),
	})
}

export async function updateProfile(payload: { name: string; avatarFile?: File | null; headImg?: string }) {
	const current = requireSession()
	let headImg = payload.headImg ?? current.user.headImg
	let avatar = current.user.avatar

	if (payload.avatarFile) {
		const uploaded = await uploadAvatarImage(payload.avatarFile)
		headImg = uploaded.path
		avatar = uploaded.url
	}

	await updateProfileApi({
		userName: payload.name,
		headImg: headImg || undefined,
	})

	session.set({
		...current,
		user: {
			...current.user,
			name: payload.name,
			avatar: avatar || current.user.avatar,
			headImg: headImg || '',
		},
	})
}

export async function changePassword(payload: {
	oldPassword: string
	newPassword: string
	confirmNewPassword: string
}) {
	requireSession()
	await changePasswordApi(payload)
}
