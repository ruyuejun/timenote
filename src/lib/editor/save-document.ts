import { get } from 'svelte/store'
import { activeTab, tabsStore } from '@/stores/editor.store'
import { localFilesStore } from '@/stores/localFiles.store'

const webHandles = new Map<string, FileSystemFileHandle>()

function isLocalTab(filePath: string, isNew?: boolean) {
	return Boolean(filePath) && !isNew
}

function hasElectron() {
	return typeof window !== 'undefined' && 'electron' in window && Boolean(window.electron)
}

async function saveElectron(tab: NonNullable<ReturnType<typeof get<typeof activeTab>>>) {
	if (isLocalTab(tab.filePath, tab.isNew)) {
		await window.electron.writeFile(tab.filePath, tab.content)
		tabsStore.markTabSaved(tab.id)
		return
	}

	const filePath = await window.electron.saveFileDialog(tab.fileName)
	if (!filePath) return

	await window.electron.writeFile(filePath, tab.content)
	tabsStore.updateTabPath(tab.id, filePath)
	localFilesStore.addStandaloneFile(filePath)
}

async function writeWebHandle(handle: FileSystemFileHandle, content: string) {
	const writable = await handle.createWritable()
	await writable.write(content)
	await writable.close()
}

function downloadBlob(fileName: string, content: string) {
	const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = fileName || '文档.html'
	link.click()
	URL.revokeObjectURL(url)
}

async function saveWeb(tab: NonNullable<ReturnType<typeof get<typeof activeTab>>>) {
	const existing = webHandles.get(tab.id)
	if (existing) {
		await writeWebHandle(existing, tab.content)
		tabsStore.markTabSaved(tab.id)
		return
	}

	if (typeof window.showSaveFilePicker === 'function') {
		try {
			const handle = await window.showSaveFilePicker({
				suggestedName: tab.fileName || '文档.html',
				types: [
					{
						description: 'HTML 文档',
						accept: { 'text/html': ['.html', '.htm'] },
					},
				],
			})
			await writeWebHandle(handle, tab.content)
			webHandles.set(tab.id, handle)
			tabsStore.updateTabPath(tab.id, handle.name)
			return
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return
		}
	}

	downloadBlob(tab.fileName || '文档.html', tab.content)
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
