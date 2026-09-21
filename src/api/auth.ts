import { post, postForm } from './request'
import type { LoginResult, UploadImageResult } from './types'

export async function loginApi(payload: { account: string; password: string }) {
	const res = await post<LoginResult>('/auth/login', payload)
	const data = res.data[0]
	if (!data?.token) throw new Error(res.msg || '登录失败')
	return data
}

export async function changePasswordApi(payload: {
	oldPassword: string
	newPassword: string
	confirmNewPassword: string
}) {
	return post('/auth/changePassword', payload)
}

export async function updateProfileApi(payload: { userName?: string; headImg?: string }) {
	return post('/auth/profile', payload)
}

export async function uploadImageApi(file: File) {
	const form = new FormData()
	form.append('file', file)
	const res = await postForm<UploadImageResult>('/auth/uploadImage', form)
	const data = res.data[0]
	if (!data) throw new Error(res.msg || '上传失败')
	return data
}
