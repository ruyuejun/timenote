import { post, postForm } from './request'
import type {
	DocFolderAuth,
	DocFolderAuthAssignItem,
	DocFolderChild,
	DocFolderTree,
	DocInfo,
	UploadMdResult,
} from './types'

/** 文档名无后缀时默认补 .md */
export function ensureDocNameMd(name: string) {
	const trimmed = name.trim()
	if (!trimmed) return 'untitled.md'
	if (/\.[^./\\]+$/.test(trimmed)) return trimmed
	return `${trimmed}.md`
}

export async function fetchDocTreeApi(keyword?: string) {
	const res = await post<DocFolderTree>('/docFolder/tree', {
		keyword: keyword?.trim() || undefined,
	})
	return res.data
}

/** 只查一层：parentId=0 为根 */
export async function fetchDocChildrenApi(parentId = 0) {
	const res = await post<DocFolderChild>('/docFolder/children', { parentId })
	return res.data
}

export async function createDocFolderApi(payload: {
	docFolderName: string
	parentId?: number
}) {
	await post('/docFolder/create', {
		docFolderName: payload.docFolderName,
		parentId: payload.parentId ?? 0,
	})
}

export async function deleteDocFolderApi(id: number) {
	return post('/docFolder/delete', { id })
}

export async function updateDocFolderApi(payload: {
	id: number
	docFolderName?: string
	parentId?: number
}) {
	return post('/docFolder/update', payload)
}

export async function deleteDocInfoApi(id: number) {
	return post('/docInfo/delete', { id })
}

/** 文档正文写入 schema 字段（application/json） */
export async function createDocInfoApi(payload: {
	folderId: number
	docName: string
	schema: string
	remark?: string
}) {
	const res = await post<DocInfo>('/docInfo/save', {
		action: 'create',
		folderId: payload.folderId,
		docName: ensureDocNameMd(payload.docName),
		schema: payload.schema,
		remark: payload.remark,
	})
	const data = res.data[0]
	if (!data) throw new Error(res.msg || '创建文档失败')
	return data
}

/** 上传 Markdown 文件：转 schema 并写入 doc_info 记录 */
export async function uploadMdApi(folderId: number, file: File) {
	const form = new FormData()
	form.append('folderId', String(folderId))
	form.append('file', file)
	const res = await postForm<UploadMdResult>('/docInfo/uploadMd', form)
	const data = res.data[0]
	if (!data) throw new Error(res.msg || '上传失败')
	return data
}

export async function updateDocInfoApi(payload: {
	id: number
	docName?: string
	schema: string
	remark?: string
}) {
	const res = await post<DocInfo>('/docInfo/save', {
		action: 'update',
		id: payload.id,
		docName: payload.docName ? ensureDocNameMd(payload.docName) : undefined,
		schema: payload.schema,
		remark: payload.remark,
	})
	const data = res.data[0]
	if (!data) throw new Error(res.msg || '保存文档失败')
	return data
}

/** 查询文件夹授权列表 */
export async function fetchDocFolderAuthListApi(folderId: number) {
	const res = await post<DocFolderAuth>('/docFolder/auth/list', { folderId })
	return res.data
}

/** 分配文件夹授权（有则更新，无则插入） */
export async function assignDocFolderAuthApi(folderId: number, auths: DocFolderAuthAssignItem[]) {
	return post('/docFolder/assignAuth', { folderId, auths })
}
