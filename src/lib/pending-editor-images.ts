import type { Editor } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

import { uploadEditorImage } from './upload-image'

/** 编辑中的本地图片（blob:），保存时再压缩上传 */
const pendingFiles = new Map<string, File>()

/** 粘贴瞬间暂存的 data URL，文档里只放短占位符 pending-image:id */
const pendingDataUrls = new Map<string, string>()

const UPLOAD_CONCURRENCY = 3
const PENDING_SRC_PREFIX = 'pending-image:'

export function createLocalEditorImageSrc(file: File): string {
	const src = URL.createObjectURL(file)
	pendingFiles.set(src, file)
	return src
}

function isLocalImageSrc(src: string) {
	return (
		src.startsWith('blob:') ||
		src.startsWith('data:') ||
		src.startsWith(PENDING_SRC_PREFIX)
	)
}

export function hasPendingLocalImages(editor: Editor): boolean {
	let found = false
	editor.state.doc.descendants(node => {
		if (found || node.type.name !== 'image') return
		const src = String(node.attrs.src || '')
		if (isLocalImageSrc(src)) found = true
	})
	return found
}

/**
 * 粘贴 HTML 时把 data:image 换成短占位符，base64 留在内存 Map，避免进 ProseMirror 文档。
 */
export function replaceDataImagesInHtml(html: string): string {
	if (!/data:image\//i.test(html)) return html

	const doc = new DOMParser().parseFromString(html, 'text/html')
	doc.querySelectorAll('img').forEach(img => {
		const src = (img.getAttribute('src') || '').trim()
		if (!/^data:image\//i.test(src)) return
		const id = crypto.randomUUID()
		pendingDataUrls.set(id, src.replace(/\s+/g, ''))
		img.setAttribute('src', `${PENDING_SRC_PREFIX}${id}`)
	})
	return doc.body.innerHTML
}

async function dataUrlToFile(dataUrl: string): Promise<File> {
	const res = await fetch(dataUrl)
	const blob = await res.blob()
	const type = blob.type || 'image/jpeg'
	const ext = type.includes('png')
		? 'png'
		: type.includes('webp')
			? 'webp'
			: type.includes('gif')
				? 'gif'
				: 'jpg'
	return new File([blob], `paste.${ext}`, { type })
}

async function fileFromSrc(src: string): Promise<File> {
	if (src.startsWith(PENDING_SRC_PREFIX)) {
		const id = src.slice(PENDING_SRC_PREFIX.length)
		const dataUrl = pendingDataUrls.get(id)
		if (!dataUrl) throw new Error('粘贴图片数据已失效')
		return dataUrlToFile(dataUrl)
	}

	const pending = pendingFiles.get(src)
	if (pending) return pending

	const res = await fetch(src)
	const blob = await res.blob()
	const type = blob.type || 'image/jpeg'
	const ext = type.includes('png')
		? 'png'
		: type.includes('webp')
			? 'webp'
			: type.includes('gif')
				? 'gif'
				: 'jpg'
	return new File([blob], `image.${ext}`, { type })
}

function revokeBlobSrc(src: string) {
	if (!src.startsWith('blob:')) return
	pendingFiles.delete(src)
	URL.revokeObjectURL(src)
}

function clearPendingDataSrc(src: string) {
	if (!src.startsWith(PENDING_SRC_PREFIX)) return
	pendingDataUrls.delete(src.slice(PENDING_SRC_PREFIX.length))
}

/** 回收已从文档中删除的 blob / 占位符，避免内存泄漏 */
export function pruneOrphanPendingImages(editor: Editor) {
	const liveBlob = new Set<string>()
	const livePending = new Set<string>()
	editor.state.doc.descendants(node => {
		if (node.type.name !== 'image') return
		const src = String(node.attrs.src || '')
		if (src.startsWith('blob:')) liveBlob.add(src)
		if (src.startsWith(PENDING_SRC_PREFIX)) livePending.add(src.slice(PENDING_SRC_PREFIX.length))
	})

	for (const src of pendingFiles.keys()) {
		if (!liveBlob.has(src)) revokeBlobSrc(src)
	}
	for (const id of pendingDataUrls.keys()) {
		if (!livePending.has(id)) pendingDataUrls.delete(id)
	}
}

function collectImageSrcs(doc: ProseMirrorNode, pred: (src: string) => boolean) {
	const list: string[] = []
	doc.descendants(node => {
		if (node.type.name !== 'image') return
		const src = String(node.attrs.src || '')
		if (pred(src)) list.push(src)
	})
	return [...new Set(list)]
}

async function mapPool<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
	const results = new Array<R>(items.length)
	let next = 0
	async function run() {
		while (next < items.length) {
			const i = next++
			results[i] = await worker(items[i])
		}
	}
	const runners = Array.from({ length: Math.min(limit, items.length) }, () => run())
	await Promise.all(runners)
	return results
}

let hydrateInFlight: Promise<void> | null = null

/**
 * 把 pending-image: / data: 异步换成 blob: 预览，减轻文档体积与后续序列化成本。
 */
export function hydratePendingImagesInEditor(editor: Editor): Promise<void> {
	if (hydrateInFlight) return hydrateInFlight

	hydrateInFlight = (async () => {
		const localSrcs = collectImageSrcs(
			editor.state.doc,
			src => src.startsWith(PENDING_SRC_PREFIX) || src.startsWith('data:'),
		)
		if (localSrcs.length === 0) return

		const fileBySrc = new Map<string, File>()
		await mapPool(localSrcs, UPLOAD_CONCURRENCY, async src => {
			fileBySrc.set(src, await fileFromSrc(src))
			await new Promise<void>(resolve => setTimeout(resolve, 0))
		})

		if (editor.isDestroyed) return

		// 同步创建 blob 并写入文档，避免中途 prune 误回收
		const blobBySrc = new Map<string, string>()
		for (const [src, file] of fileBySrc) {
			blobBySrc.set(src, createLocalEditorImageSrc(file))
		}

		const { tr } = editor.state
		let changed = false
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name !== 'image') return
			const next = blobBySrc.get(String(node.attrs.src || ''))
			if (!next) return
			tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: next })
			changed = true
		})
		if (changed) editor.view.dispatch(tr)
		else {
			for (const blobSrc of blobBySrc.values()) revokeBlobSrc(blobSrc)
		}

		for (const src of localSrcs) clearPendingDataSrc(src)
	})().finally(() => {
		hydrateInFlight = null
	})

	return hydrateInFlight
}

/**
 * 把编辑器里尚未上传的本地图（blob: / data: / 占位符）压缩上传，并替换为服务器 URL。
 * 应在保存文档前调用。
 */
export async function uploadLocalImagesInEditor(editor: Editor): Promise<string> {
	await hydratePendingImagesInEditor(editor)

	const localSrcs = collectImageSrcs(editor.state.doc, isLocalImageSrc)
	if (localSrcs.length === 0) return editor.getHTML()

	const uploaded = new Map<string, string>()
	await mapPool(localSrcs, UPLOAD_CONCURRENCY, async src => {
		const file = await fileFromSrc(src)
		const result = await uploadEditorImage(file)
		uploaded.set(src, result.url)
	})

	const { tr } = editor.state
	let changed = false
	editor.state.doc.descendants((node, pos) => {
		if (node.type.name !== 'image') return
		const next = uploaded.get(String(node.attrs.src || ''))
		if (!next) return
		tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: next })
		changed = true
	})
	if (changed) editor.view.dispatch(tr)

	for (const src of localSrcs) {
		revokeBlobSrc(src)
		clearPendingDataSrc(src)
	}

	return editor.getHTML()
}
