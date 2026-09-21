<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import { Editor } from '@tiptap/core'
	import { Color } from '@tiptap/extension-color'
	import Highlight from '@tiptap/extension-highlight'
	import Image from '@tiptap/extension-image'
	import Link from '@tiptap/extension-link'
	import Placeholder from '@tiptap/extension-placeholder'
	import Subscript from '@tiptap/extension-subscript'
	import Superscript from '@tiptap/extension-superscript'
	import { TableKit } from '@tiptap/extension-table'
	import TaskItem from '@tiptap/extension-task-item'
	import TaskList from '@tiptap/extension-task-list'
	import TextAlign from '@tiptap/extension-text-align'
	import { FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style'
	import Underline from '@tiptap/extension-underline'
	import type { EditorView } from '@tiptap/pm/view'
	import StarterKit from '@tiptap/starter-kit'

	import { isAuthExpiredError } from '@/api/request'
	import { BlockLineHeight } from '$lib/tiptap/block-line-height'
	import { OfficePaste } from '$lib/tiptap/office-paste'
	import { PendingImagePaste } from '$lib/tiptap/pending-image-paste'
	import { StyledBulletList, StyledOrderedList } from '$lib/tiptap/styled-lists'
	import { TableFinance } from '$lib/tiptap/table-finance'
	import {
		createLocalEditorImageSrc,
		hasPendingLocalImages,
		hydratePendingImagesInEditor,
		pruneOrphanPendingImages,
		uploadLocalImagesInEditor,
	} from '$lib/pending-editor-images'
	import { toast, dismiss } from '$lib/toast'
	import { loadDocContent, saveDocContent } from '@/stores/docs'
	import { focusMode } from '@/stores/session'
	import type { DocNode } from '@/types'
	import EditorToolbar from './editor-toolbar.svelte'

	interface Props {
		doc: DocNode
		canEdit: boolean
	}

	let { doc, canEdit }: Props = $props()

	let editor = $state<Editor | null>(null)
	let editorElement = $state<HTMLElement | null>(null)
	let ready = $state(false)
	let saving = $state(false)
	let stats = $state({ chars: 0, words: 0 })
	let canEditRef = canEdit
	let savingRef = false
	let docRef = doc

	$effect(() => {
		canEditRef = canEdit
	})
	$effect(() => {
		docRef = doc
	})

	function pickImageFile(files: FileList | File[] | null | undefined) {
		if (!files) return null
		return Array.from(files).find(file => file.type.startsWith('image/')) ?? null
	}

	function pickClipboardImageFile(clipboard: DataTransfer | null | undefined) {
		if (!clipboard) return null
		const html = clipboard.getData('text/html')?.trim()
		const text = clipboard.getData('text/plain')?.trim()
		if (html || text) return null
		const fromFiles = pickImageFile(clipboard.files)
		if (fromFiles) return fromFiles
		const imageItem = Array.from(clipboard.items).find(
			item => item.kind === 'file' && item.type.startsWith('image/'),
		)
		return imageItem?.getAsFile() ?? null
	}

	function insertLocalImage(view: EditorView, file: File) {
		const src = createLocalEditorImageSrc(file)
		const imageType = view.state.schema.nodes.image
		if (!imageType) return
		view.dispatch(view.state.tr.replaceSelectionWith(imageType.create({ src })))
	}

	function computeStats(instance: Editor) {
		const text = instance.state.doc.textContent
		const chars = text.length
		const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length
		const words =
			cjk +
			text
				.replace(/[\u4e00-\u9fa5]/g, ' ')
				.trim()
				.split(/\s+/)
				.filter(Boolean).length
		return { chars, words }
	}

	async function handleSave() {
		if (!editor || !canEditRef || savingRef) return
		savingRef = true
		saving = true
		const current = docRef
		const loadingId = hasPendingLocalImages(editor) ? toast.loading('正在上传图片…') : null
		try {
			const content = await uploadLocalImagesInEditor(editor)
			await saveDocContent({
				id: current.id,
				content,
				docName: current.name,
			})
			toast.success('已保存')
		} catch (error) {
			if (isAuthExpiredError(error)) return
			toast.error(error instanceof Error ? error.message : '保存失败')
		} finally {
			if (loadingId != null) dismiss(loadingId)
			savingRef = false
			saving = false
		}
	}

	onMount(() => {
		if (!editorElement) return

		editor = new Editor({
			element: editorElement,
			extensions: [
				StarterKit.configure({
					heading: { levels: [1, 2, 3, 4, 5, 6] },
					orderedList: false,
					bulletList: false,
				}),
				StyledOrderedList,
				StyledBulletList,
				Underline,
				TextStyle,
				FontFamily,
				FontSize,
				BlockLineHeight,
				Color,
				Highlight.configure({ multicolor: true }),
				Superscript,
				Subscript,
				Link.configure({ openOnClick: !canEdit }),
				Image.configure({
					allowBase64: true,
					resize: canEdit
						? {
								enabled: true,
								directions: ['top', 'right', 'bottom', 'left'],
								minWidth: 48,
								minHeight: 48,
								alwaysPreserveAspectRatio: true,
							}
						: false,
				}),
				TableKit.configure({
					table: {
						resizable: canEdit,
						renderWrapper: true,
					},
				}),
				TableFinance,
				OfficePaste,
				PendingImagePaste,
				TextAlign.configure({ types: ['heading', 'paragraph'] }),
				TaskList,
				TaskItem.configure({ nested: true }),
				Placeholder.configure({
					placeholder: canEdit ? '输入文字，开始编写这篇文档…' : '',
				}),
			],
			editable: canEdit,
			content: '',
			editorProps: {
				attributes: {
					class: canEdit ? 'doc-editor-content' : 'doc-editor-content is-preview',
				},
				handlePaste: (view, event) => {
					if (!canEdit) return true
					const file = pickClipboardImageFile(event.clipboardData)
					if (!file) return false
					event.preventDefault()
					insertLocalImage(view, file)
					return true
				},
				handleDrop: (view, event) => {
					if (!canEdit) return true
					const file = pickImageFile(event.dataTransfer?.files)
					if (!file) return false
					event.preventDefault()
					insertLocalImage(view, file)
					return true
				},
			},
		})

		const onUpdate = () => {
			if (!editor) return
			stats = computeStats(editor)
			if (!canEdit) return
			pruneOrphanPendingImages(editor)
			void hydratePendingImagesInEditor(editor)
		}
		editor.on('update', onUpdate)

		const onKeyDown = (event: KeyboardEvent) => {
			if ($focusMode && event.key === 'Escape') {
				focusMode.set(false)
				return
			}
			if (!canEdit) return
			const isSave = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's'
			if (!isSave || !editor) return
			const root = editor.view.dom.closest('.doc-editor')
			if (!root?.contains(document.activeElement) && !editor.isFocused) return
			event.preventDefault()
			void handleSave()
		}
		window.addEventListener('keydown', onKeyDown)

		return () => {
			window.removeEventListener('keydown', onKeyDown)
			editor?.off('update', onUpdate)
			editor?.destroy()
			editor = null
		}
	})

	onDestroy(() => {
		editor?.destroy()
		editor = null
	})

	$effect(() => {
		const id = doc.id
		const instance = editor
		if (!instance) return
		let cancelled = false
		ready = false
		void loadDocContent(id)
			.then(html => {
				if (cancelled || !editor) return
				editor.commands.setContent(html || '', { emitUpdate: false })
				stats = computeStats(editor)
				ready = true
			})
			.catch(error => {
				if (cancelled || isAuthExpiredError(error)) return
				toast.error(error instanceof Error ? error.message : '加载文档失败')
				ready = true
			})
		return () => {
			cancelled = true
		}
	})

	$effect(() => {
		if (!editor) return
		editor.setEditable(canEdit)
		editor.view.dom.classList.toggle('is-preview', !canEdit)
	})
</script>

<div class="doc-editor" class:is-preview={!canEdit} class:is-focus-mode={$focusMode}>
	{#if canEdit && editor}
		<div class="doc-editor-toolbar">
			{#if saving}<span class="saving-tag">保存中</span>{/if}
			<EditorToolbar {editor} {canEdit} {saving} onSave={handleSave} docName={doc.name} />
		</div>
	{/if}
	<div class="doc-editor-paper">
		{#if !ready}
			<div class="loading">加载中…</div>
		{/if}
		<div bind:this={editorElement}></div>
	</div>
	<div class="doc-editor-status">
		字数 {stats.words} · 字符 {stats.chars}
		{#if $focusMode}<span> · 按 ESC 退出专注模式</span>{/if}
	</div>
</div>

<style>
	.saving-tag {
		display: inline-block;
		margin-right: 8px;
		padding: 2px 8px;
		border-radius: 999px;
		background: #e6f4ff;
		color: #1677ff;
		font-size: 12px;
	}
	.loading {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background: rgb(255 255 255 / 0.6);
		z-index: 1;
	}
	.doc-editor-paper {
		position: relative;
	}
</style>
