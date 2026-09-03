import { get } from 'svelte/store'
import { activeTab, tabsStore, type Tab } from '@/stores/editor.store'
import { localFilesStore } from '@/stores/localFiles.store'
import { editorHtmlToFile } from './html-markdown'

type SaveFilePicker = (options: {
	suggestedName?: string
	types?: { description?: string; accept: Record<string, string[]> }[]
}) => Promise<FileSystemFileHandle>

const webHandles = new Map<string, FileSystemFileHandle>()

function isRemoteMockPath(filePath: string) {
	return filePath.startsWith('/remote/') || filePath.startsWith('remote/')
}

function isWritableLocalPath(filePath: string, isNew?: boolean) {
	return Boolean(filePath) && !isNew && !isRemoteMockPath(filePath)
}

function hasElectron() {
	return typeof window !== 'undefined' && 'electron' in window && Boolean(window.electron)
}

async function saveAsElectron(tab: Tab) {
	const filePath = await window.electron.saveFileDialog(tab.fileName)
	if (!filePath) return

	await window.electron.writeFile(filePath, editorHtmlToFile(tab.content, filePath, tab.fileName))
	tabsStore.updateTabPath(tab.id, filePath)
	localFilesStore.addStandaloneFile(filePath)
}

async function saveElectron(tab: Tab) {
	if (!isWritableLocalPath(tab.filePath, tab.isNew)) {
		await saveAsElectron(tab)
		return
	}

	try {
		await window.electron.writeFile(tab.filePath, editorHtmlToFile(tab.content, tab.filePath, tab.fileName))
		tabsStore.markTabSaved(tab.id)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		if (message.includes('ENOENT')) {
			await saveAsElectron(tab)
			return
		}
		throw error
	}
}

async function writeWebHandle(handle: FileSystemFileHandle, content: string) {
	const writable = await handle.createWritable()
	await writable.write(content)
	await writable.close()
}

function downloadBlob(fileName: string, content: string) {
	const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = fileName || '文档.html'
	link.click()
	URL.revokeObjectURL(url)
}

async function saveWeb(tab: Tab) {
	const existing = webHandles.get(tab.id)
	if (existing) {
		await writeWebHandle(existing, editorHtmlToFile(tab.content, tab.filePath, tab.fileName))
		tabsStore.markTabSaved(tab.id)
		return
	}

	const showSaveFilePicker = (window as Window & { showSaveFilePicker?: SaveFilePicker }).showSaveFilePicker
	if (typeof showSaveFilePicker === 'function') {
		try {
			const handle = await showSaveFilePicker({
				suggestedName: tab.fileName || '文档.md',
				types: [
					{
						description: 'Markdown',
						accept: { 'text/markdown': ['.md'] },
					},
				],
			})
			await writeWebHandle(handle, editorHtmlToFile(tab.content, handle.name, handle.name))
			webHandles.set(tab.id, handle)
			tabsStore.updateTabPath(tab.id, handle.name)
			return
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return
		}
	}

	downloadBlob(tab.fileName || '文档.md', editorHtmlToFile(tab.content, tab.fileName, tab.fileName))
}

export async function saveActiveDocument() {
	const tab = get(activeTab)
	if (!tab) return

	try {
		if (hasElectron()) await saveElectron(tab)
		else await saveWeb(tab)
	} catch (error) {
		console.error('保存失败:', error)
	}
}

export function isSaveHotkey(event: KeyboardEvent) {
	return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's' && !event.shiftKey && !event.altKey
}
