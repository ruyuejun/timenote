import { derived, get, writable } from 'svelte/store'

import {
	createDocFolderApi,
	createDocInfoApi,
	deleteDocFolderApi,
	deleteDocInfoApi,
	fetchDocChildrenApi,
	fetchDocTreeApi,
	updateDocFolderApi,
	updateDocInfoApi,
} from '@/api/doc'
import {
	emptyDocHtml,
	flattenDocTree,
	mapDocChildren,
	parseNodeId,
	replaceDocChildren,
	toDocNodeId,
} from '$lib/mappers'
import { getAncestors } from '$lib/tree'
import type { DocNode } from '@/types'
import { persisted } from './persist'
import { requireSession } from './session'

const SELECTED_DOC_KEY = 'editor-selected-doc-v2'

export const selectedDocId = persisted<string | null>(SELECTED_DOC_KEY, null)
export const docs = writable<DocNode[]>([])
export const loadedFolderIds = writable<string[]>([])
export const docContent = writable<Record<string, string>>({})
export const treeLoading = writable(false)

export const selectedDoc = derived([selectedDocId, docs], ([$id, $docs]) => {
	if (!$id) return null
	return $docs.find(item => item.id === $id) ?? null
})

export async function loadDocChildren(parentId: string, force = false) {
	if (!force && get(loadedFolderIds).includes(parentId)) return

	const parsed = parseNodeId(parentId)
	if (!parsed || parsed.kind !== 'folder') return

	const children = mapDocChildren(await fetchDocChildrenApi(parsed.backendId), parentId)
	docs.update(list => replaceDocChildren(list, parentId, children))

	const loaded = new Set(get(loadedFolderIds))
	loaded.add(parentId)
	for (const child of children) {
		if (child.type === 'folder') loaded.delete(child.id)
	}
	loadedFolderIds.set([...loaded])
}

export async function revealSelectedDocInTree() {
	const docId = get(selectedDocId)
	if (!docId) return [] as string[]

	const parsed = parseNodeId(docId)
	if (!parsed || parsed.kind !== 'doc') {
		selectedDocId.set(null)
		return [] as string[]
	}

	const findDoc = () => get(docs).find(item => item.id === docId && item.type === 'doc')

	let doc = findDoc()
	if (!doc) {
		const queue = get(docs)
			.filter(item => item.type === 'folder')
			.map(item => item.id)
		if (queue.length === 0) return [] as string[]

		const visited = new Set<string>()
		while (queue.length > 0 && !doc) {
			const folderId = queue.shift()
			if (!folderId || visited.has(folderId)) continue
			visited.add(folderId)
			await loadDocChildren(folderId)
			doc = findDoc()
			if (doc) break
			for (const child of get(docs)) {
				if (child.parentId === folderId && child.type === 'folder' && !visited.has(child.id)) {
					queue.push(child.id)
				}
			}
		}
	}

	if (!doc) {
		selectedDocId.set(null)
		return [] as string[]
	}

	const ancestors = getAncestors(get(docs), docId).reverse()
	for (const ancestor of ancestors) {
		if (ancestor.type === 'folder') await loadDocChildren(ancestor.id)
	}

	return ancestors.filter(item => item.type === 'folder').map(item => item.id)
}

export async function refreshDocTree(keyword?: string) {
	treeLoading.set(true)
	try {
		const q = keyword?.trim() || undefined
		const list = flattenDocTree(await fetchDocTreeApi(q))
		docs.set(list)
		loadedFolderIds.set(q ? list.filter(item => item.type === 'folder').map(item => item.id) : [])
		if (!q) return revealSelectedDocInTree()
		return [] as string[]
	} finally {
		treeLoading.set(false)
	}
}

export async function loadAllDocFolders() {
	const folders: DocNode[] = []
	const walk = async (parentId: string | null, backendId: number) => {
		const children = mapDocChildren(await fetchDocChildrenApi(backendId), parentId)
		for (const item of children) {
			if (item.type !== 'folder') continue
			folders.push(item)
			await walk(item.id, item.backendId)
		}
	}
	await walk(null, 0)
	return folders
}

export async function loadDocContent(docId: string) {
	const cache = get(docContent)
	if (cache[docId] != null) return cache[docId]

	const doc = get(docs).find(item => item.id === docId && item.type === 'doc')
	if (!doc) throw new Error('文档不存在')

	const html = doc.schema?.trim() || emptyDocHtml(doc.name || '未命名文档')
	docContent.update(current => ({ ...current, [docId]: html }))
	return html
}

export async function saveDocContent(payload: { id: string; content: string; docName?: string }) {
	requireSession()
	const parsed = parseNodeId(payload.id)
	if (!parsed || parsed.kind !== 'doc') throw new Error('无效的文档 id')
	const schema = payload.content?.trim()
	if (!schema) throw new Error('文档内容不能为空')
	await updateDocInfoApi({
		id: parsed.backendId,
		docName: payload.docName,
		schema,
	})
	docContent.update(current => ({ ...current, [payload.id]: payload.content }))
	docs.update(list =>
		list.map(item => (item.id === payload.id ? { ...item, schema: payload.content } : item)),
	)
}

export async function addDocNode(payload: { parentId: string | null; name: string; type: DocNode['type'] }) {
	requireSession()
	if (payload.type === 'folder') {
		const parent = payload.parentId ? parseNodeId(payload.parentId) : null
		if (payload.parentId && (!parent || parent.kind !== 'folder')) {
			throw new Error('父级必须是文件夹')
		}
		await createDocFolderApi({
			docFolderName: payload.name,
			parentId: parent?.backendId ?? 0,
		})
		if (payload.parentId) await loadDocChildren(payload.parentId, true)
		else await refreshDocTree()
		return null
	}

	if (!payload.parentId) throw new Error('请先选择文件夹再新建文档')
	const parent = parseNodeId(payload.parentId)
	if (!parent || parent.kind !== 'folder') throw new Error('父级必须是文件夹')

	const created = await createDocInfoApi({
		folderId: parent.backendId,
		docName: payload.name,
		schema: emptyDocHtml(payload.name),
	})
	await loadDocChildren(payload.parentId, true)
	const id = toDocNodeId(created.id)
	docContent.update(current => ({ ...current, [id]: emptyDocHtml(payload.name) }))
	selectedDocId.set(id)
	return id
}

export async function renameDocNode(payload: { id: string; name: string }) {
	requireSession()
	const trimmed = payload.name.trim()
	if (!trimmed) throw new Error('名称不能为空')

	const parsed = parseNodeId(payload.id)
	const node = get(docs).find(item => item.id === payload.id)
	if (!parsed || !node) throw new Error('节点不存在')

	if (parsed.kind === 'folder') {
		await updateDocFolderApi({
			id: parsed.backendId,
			docFolderName: trimmed,
		})
	} else {
		const schema =
			get(docContent)[payload.id]?.trim() || node.schema?.trim() || emptyDocHtml(trimmed)
		await updateDocInfoApi({
			id: parsed.backendId,
			docName: trimmed,
			schema,
		})
		docContent.update(current => ({ ...current, [payload.id]: schema }))
	}

	docs.update(list => list.map(item => (item.id === payload.id ? { ...item, name: trimmed } : item)))

	if (node.parentId) await loadDocChildren(node.parentId, true)
	else if (parsed.kind === 'folder') await refreshDocTree()
}

export async function deleteDocNode(id: string) {
	requireSession()
	const parsed = parseNodeId(id)
	const node = get(docs).find(item => item.id === id)
	if (!parsed || !node) return
	if (parsed.kind === 'folder') await deleteDocFolderApi(parsed.backendId)
	else await deleteDocInfoApi(parsed.backendId)

	docContent.update(current => Object.fromEntries(Object.entries(current).filter(([key]) => key !== id)))
	if (node.parentId) await loadDocChildren(node.parentId, true)
	else await refreshDocTree()
	if (get(selectedDocId) === id) selectedDocId.set(null)
}
