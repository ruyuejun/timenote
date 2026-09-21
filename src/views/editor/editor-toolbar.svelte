<script lang="ts">
	import type { Editor } from '@tiptap/core'
	import {
		AlignCenter,
		AlignLeft,
		AlignRight,
		Bold,
		CheckSquare,
		ChevronDown,
		Code,
		Code2,
		Download,
		Eraser,
		Highlighter,
		Italic,
		Link2,
		List,
		ListOrdered,
		Maximize2,
		Minimize2,
		Image as ImageIcon,
		Printer,
		Redo2,
		Save,
		Strikethrough,
		Table,
		Underline,
		Undo2,
		AlignVerticalSpaceBetween,
	} from '@lucide/svelte'
	import { EDITOR_FONT_SIZES, resolveFontSizeKey, stepFontSize } from '$lib/editor-font-sizes'
	import { DEFAULT_EDITOR_FONT, EDITOR_FONTS, resolveEditorFontKey } from '$lib/editor-fonts'
	import { exportAsHtml, exportAsMarkdown, exportAsPdf } from '$lib/export-doc'
	import { createLocalEditorImageSrc } from '$lib/pending-editor-images'
	import { toast } from '$lib/toast'
	import Modal from '$lib/ui/Modal.svelte'
	import { focusMode } from '@/stores/session'
	import ListStylePanel from './list-style-panel.svelte'
	import PrintPreviewModal from './print-preview-modal.svelte'
	import TableInsertPanel from './table-insert-panel.svelte'
	import ToolbarIcon from './toolbar-icons.svelte'

	interface Props {
		editor: Editor
		canEdit: boolean
		saving: boolean
		onSave: () => Promise<void> | void
		docName: string
	}

	let { editor, canEdit, saving, onSave, docName }: Props = $props()

	const HIGHLIGHT_COLORS = ['#ffe58f', '#b7eb8f', '#87e8de', '#91d5ff', '#d3adf7', '#ffadd2', '#ffd591', '#d9d9d9']
	const TEXT_COLORS = ['#1f2329', '#ff4d4f', '#fa8c16', '#fadb14', '#52c41a', '#1677ff', '#722ed1', '#eb2f96']
	const HEADING_OPTIONS = [
		{ value: 'p', label: '正文', fontSize: 14, fontWeight: 400 },
		{ value: 'h1', label: '标题 1', fontSize: 22, fontWeight: 700 },
		{ value: 'h2', label: '标题 2', fontSize: 18, fontWeight: 700 },
		{ value: 'h3', label: '标题 3', fontSize: 16, fontWeight: 700 },
		{ value: 'h4', label: '标题 4', fontSize: 15, fontWeight: 600 },
		{ value: 'h5', label: '标题 5', fontSize: 14, fontWeight: 600 },
		{ value: 'h6', label: '标题 6', fontSize: 13, fontWeight: 500 },
	] as const
	const LINE_HEIGHT_OPTIONS = [
		{ value: '', label: '默认' },
		{ value: '1', label: '单倍' },
		{ value: '1.15', label: '1.15' },
		{ value: '1.5', label: '1.5 倍' },
		{ value: '1.75', label: '1.75' },
		{ value: '2', label: '2 倍' },
		{ value: '2.5', label: '2.5 倍' },
		{ value: '3', label: '3 倍' },
	] as const

	let tick = $state(0)
	let openPanel = $state<string | null>(null)
	let linkOpen = $state(false)
	let linkText = $state('')
	let linkHref = $state('https://')
	let printOpen = $state(false)
	let printContent = $state('')
	let imageInput = $state<HTMLInputElement | null>(null)

	$effect(() => {
		const update = () => {
			tick += 1
		}
		editor.on('transaction', update)
		editor.on('selectionUpdate', update)
		return () => {
			editor.off('transaction', update)
			editor.off('selectionUpdate', update)
		}
	})

	function currentHeading() {
		tick
		for (const level of [1, 2, 3, 4, 5, 6] as const) {
			if (editor.isActive('heading', { level })) return `h${level}`
		}
		return 'p'
	}

	const fontSize = $derived.by(() => {
		tick
		return editor.getAttributes('textStyle').fontSize as string | undefined
	})
	const textColor = $derived.by(() => {
		tick
		return (editor.getAttributes('textStyle').color as string | undefined) ?? '#1f2329'
	})
	const highlightColor = $derived.by(() => {
		tick
		return (editor.getAttributes('highlight').color as string | undefined) ?? '#ffe58f'
	})
	const fontKey = $derived.by(() => {
		tick
		return resolveEditorFontKey(editor.getAttributes('textStyle').fontFamily)
	})

	function togglePanel(name: string) {
		openPanel = openPanel === name ? null : name
	}

	function openLinkModal() {
		const { from, to } = editor.state.selection
		linkText = editor.state.doc.textBetween(from, to, ' ')
		linkHref = (editor.getAttributes('link').href as string | undefined) || 'https://'
		linkOpen = true
	}

	function applyLink() {
		const href = linkHref.trim()
		const text = linkText.trim()
		if (!href) {
			editor.chain().focus().extendMarkRange('link').unsetLink().run()
			linkOpen = false
			return
		}
		const { empty } = editor.state.selection
		if (empty && text) {
			editor
				.chain()
				.focus()
				.insertContent({
					type: 'text',
					text,
					marks: [{ type: 'link', attrs: { href } }],
				})
				.run()
		} else {
			editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
		}
		linkOpen = false
	}

	function onImageFile(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0]
		;(event.target as HTMLInputElement).value = ''
		if (!file?.type.startsWith('image/')) return
		const src = createLocalEditorImageSrc(file)
		editor.chain().focus().setImage({ src }).run()
	}

	async function handleExport(key: string) {
		const html = editor.getHTML()
		openPanel = null
		if (key === 'html') {
			exportAsHtml(docName, html)
			toast.success('已导出 HTML')
			return
		}
		if (key === 'md') {
			exportAsMarkdown(docName, html)
			toast.success('已导出 Markdown')
			return
		}
		if (key === 'pdf') {
			try {
				toast.info('正在生成 PDF...')
				await exportAsPdf(docName, html)
				toast.success('已导出 PDF')
			} catch (error) {
				console.error(error)
				toast.error('PDF 导出失败')
			}
		}
	}

	function active(name: string, attrs?: Record<string, unknown>) {
		tick
		return editor.isActive(name, attrs)
	}
</script>

<input bind:this={imageInput} type="file" accept="image/*" hidden onchange={onImageFile} />

{#if openPanel}
	<button type="button" class="panel-mask" aria-label="关闭面板" onclick={() => (openPanel = null)}></button>
{/if}

<div class="toolbar-row">
	<button type="button" class="tb" title="保存 (Ctrl+S)" aria-label="保存" disabled={!canEdit || saving} onclick={() => void onSave()}>
		<Save size={14} />
	</button>
	<div class="drop">
		<button type="button" class="tb" title="导出" aria-label="导出" onclick={() => togglePanel('export')}>
			<Download size={14} />
		</button>
		{#if openPanel === 'export'}
			<div class="menu">
				<button type="button" onclick={() => void handleExport('pdf')}>导出为 PDF</button>
				<button type="button" onclick={() => void handleExport('html')}>导出为 HTML</button>
				<button type="button" onclick={() => void handleExport('md')}>导出为 Markdown</button>
			</div>
		{/if}
	</div>
	<button
		type="button"
		class="tb"
		title={$focusMode ? '退出专注模式' : '专注模式'}
		aria-label={$focusMode ? '退出专注模式' : '专注模式'}
		onclick={() => focusMode.update(v => !v)}
	>
		{#if $focusMode}
			<Minimize2 size={14} />
		{:else}
			<Maximize2 size={14} />
		{/if}
	</button>
	<span class="divider"></span>
	<button type="button" class="tb" title="撤销" aria-label="撤销" onclick={() => editor.chain().focus().undo().run()}>
		<Undo2 size={14} />
	</button>
	<button type="button" class="tb" title="重做" aria-label="重做" onclick={() => editor.chain().focus().redo().run()}>
		<Redo2 size={14} />
	</button>

	<select
		class="tb-select"
		disabled={!canEdit}
		value={fontKey}
		onchange={e => {
			const font = EDITOR_FONTS.find(item => item.key === e.currentTarget.value) ?? DEFAULT_EDITOR_FONT
			editor.chain().focus().setFontFamily(font.css).run()
		}}
	>
		{#each EDITOR_FONTS as font}
			<option value={font.key}>{font.label}</option>
		{/each}
	</select>
	<select
		class="tb-select"
		disabled={!canEdit}
		value={resolveFontSizeKey(fontSize)}
		onchange={e => {
			const size = EDITOR_FONT_SIZES.find(item => item.key === e.currentTarget.value)
			if (size) editor.chain().focus().setFontSize(size.css).run()
		}}
	>
		{#each EDITOR_FONT_SIZES as size}
			<option value={size.key}>{size.label}</option>
		{/each}
	</select>
	<button type="button" class="tb" disabled={!canEdit} title="增大字号" aria-label="增大字号" onclick={() => editor.chain().focus().setFontSize(stepFontSize(fontSize, -1).css).run()}>
		<ToolbarIcon kind="increase" />
	</button>
	<button type="button" class="tb" disabled={!canEdit} title="减小字号" aria-label="减小字号" onclick={() => editor.chain().focus().setFontSize(stepFontSize(fontSize, 1).css).run()}>
		<ToolbarIcon kind="decrease" />
	</button>

	<button type="button" class="tb" class:is-active={active('bold')} disabled={!canEdit} title="加粗" aria-label="加粗" onclick={() => editor.chain().focus().toggleBold().run()}>
		<Bold size={14} />
	</button>
	<button type="button" class="tb" class:is-active={active('italic')} disabled={!canEdit} title="斜体" aria-label="斜体" onclick={() => editor.chain().focus().toggleItalic().run()}>
		<Italic size={14} />
	</button>
	<button type="button" class="tb" class:is-active={active('underline')} disabled={!canEdit} title="下划线" aria-label="下划线" onclick={() => editor.chain().focus().toggleUnderline().run()}>
		<Underline size={14} />
	</button>
	<button type="button" class="tb" class:is-active={active('strike')} disabled={!canEdit} title="删除线" aria-label="删除线" onclick={() => editor.chain().focus().toggleStrike().run()}>
		<Strikethrough size={14} />
	</button>
	<button type="button" class="tb" class:is-active={active('superscript')} disabled={!canEdit} title="上标" aria-label="上标" onclick={() => editor.chain().focus().unsetSubscript().toggleSuperscript().run()}>
		<ToolbarIcon kind="sup" />
	</button>
	<button type="button" class="tb" class:is-active={active('subscript')} disabled={!canEdit} title="下标" aria-label="下标" onclick={() => editor.chain().focus().unsetSuperscript().toggleSubscript().run()}>
		<ToolbarIcon kind="sub" />
	</button>

	<div class="drop">
		<button type="button" class="tb" disabled={!canEdit} title="字体颜色" aria-label="字体颜色" onclick={() => togglePanel('color')}>
			<ToolbarIcon kind="color" color={textColor} />
		</button>
		{#if openPanel === 'color'}
			<div class="menu color-menu">
				<button type="button" onclick={() => editor.chain().focus().unsetColor().run()}>无</button>
				{#each TEXT_COLORS as color}
					<button type="button" class="swatch" style:background={color} aria-label={color} onclick={() => editor.chain().focus().setColor(color).run()}></button>
				{/each}
				<input type="color" value={textColor} oninput={e => editor.chain().focus().setColor(e.currentTarget.value).run()} />
			</div>
		{/if}
	</div>
	<div class="drop">
		<button type="button" class="tb" class:is-active={active('highlight')} disabled={!canEdit} title="高亮" aria-label="高亮" onclick={() => togglePanel('highlight')}>
			<Highlighter size={14} />
		</button>
		{#if openPanel === 'highlight'}
			<div class="menu color-menu">
				<button type="button" onclick={() => editor.chain().focus().unsetHighlight().run()}>无</button>
				{#each HIGHLIGHT_COLORS as color}
					<button type="button" class="swatch" style:background={color} aria-label={color} onclick={() => editor.chain().focus().setHighlight({ color }).run()}></button>
				{/each}
				<input type="color" value={highlightColor} oninput={e => editor.chain().focus().setHighlight({ color: e.currentTarget.value }).run()} />
			</div>
		{/if}
	</div>
	<button type="button" class="tb" disabled={!canEdit} title="清除格式" aria-label="清除格式" onclick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
		<Eraser size={14} />
	</button>

	<span class="divider"></span>
	<div class="drop">
		<button type="button" class="tb heading-trigger" disabled={!canEdit} onclick={() => togglePanel('heading')}>
			<span class="heading-t">T</span>
			{HEADING_OPTIONS.find(item => item.value === currentHeading())?.label ?? '正文'}
			<ChevronDown size={12} />
		</button>
		{#if openPanel === 'heading'}
			<div class="menu">
				{#each HEADING_OPTIONS as item}
					<button
						type="button"
						style:font-size={`${item.fontSize}px`}
						style:font-weight={item.fontWeight}
						onclick={() => {
							if (item.value === 'p') editor.chain().focus().setParagraph().run()
							else editor.chain().focus().setHeading({ level: Number(item.value.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6 }).run()
							openPanel = null
						}}
					>
						{item.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>
	<button type="button" class="tb" disabled={!canEdit} title="左对齐" aria-label="左对齐" onclick={() => editor.chain().focus().setTextAlign('left').run()}>
		<AlignLeft size={14} />
	</button>
	<button type="button" class="tb" disabled={!canEdit} title="居中" aria-label="居中" onclick={() => editor.chain().focus().setTextAlign('center').run()}>
		<AlignCenter size={14} />
	</button>
	<button type="button" class="tb" disabled={!canEdit} title="右对齐" aria-label="右对齐" onclick={() => editor.chain().focus().setTextAlign('right').run()}>
		<AlignRight size={14} />
	</button>
	<div class="drop">
		<button type="button" class="tb" disabled={!canEdit} title="行间距" aria-label="行间距" onclick={() => togglePanel('lineHeight')}>
			<AlignVerticalSpaceBetween size={14} />
		</button>
		{#if openPanel === 'lineHeight'}
			<div class="menu">
				{#each LINE_HEIGHT_OPTIONS as item}
					<button
						type="button"
						onclick={() => {
							editor.chain().focus().setBlockLineHeight(item.value || null).run()
							openPanel = null
						}}
					>
						{item.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>
	<div class="drop">
		<button type="button" class="tb" class:is-active={active('orderedList')} disabled={!canEdit} title="有序列表" aria-label="有序列表" onclick={() => togglePanel('ol')}>
			<ListOrdered size={14} />
		</button>
		{#if openPanel === 'ol'}
			<div class="menu panel-wide"><ListStylePanel {editor} kind="ordered" /></div>
		{/if}
	</div>
	<div class="drop">
		<button type="button" class="tb" class:is-active={active('bulletList')} disabled={!canEdit} title="无序列表" aria-label="无序列表" onclick={() => togglePanel('ul')}>
			<List size={14} />
		</button>
		{#if openPanel === 'ul'}
			<div class="menu panel-wide"><ListStylePanel {editor} kind="bullet" /></div>
		{/if}
	</div>
	<div class="drop">
		<button type="button" class="tb" class:is-active={active('table')} disabled={!canEdit} title="表格" aria-label="表格" onclick={() => togglePanel('table')}>
			<Table size={14} />
		</button>
		{#if openPanel === 'table'}
			<div class="menu panel-wide"><TableInsertPanel {editor} onInserted={() => (openPanel = null)} /></div>
		{/if}
	</div>
	<button type="button" class="tb" disabled={!canEdit} title="链接" aria-label="链接" onclick={openLinkModal}>
		<Link2 size={14} />
	</button>
	<button type="button" class="tb" disabled={!canEdit} title="图片" aria-label="图片" onclick={() => imageInput?.click()}>
		<ImageIcon size={14} />
	</button>
	<button type="button" class="tb" class:is-active={active('code')} disabled={!canEdit} title="行内代码" aria-label="行内代码" onclick={() => editor.chain().focus().toggleCode().run()}>
		<Code size={14} />
	</button>
	<button type="button" class="tb" class:is-active={active('codeBlock')} disabled={!canEdit} title="代码块" aria-label="代码块" onclick={() => editor.chain().focus().toggleCodeBlock().run()}>
		<Code2 size={14} />
	</button>
	<button type="button" class="tb" class:is-active={active('taskList')} disabled={!canEdit} title="待办" aria-label="待办" onclick={() => editor.chain().focus().toggleTaskList().run()}>
		<CheckSquare size={14} />
	</button>
	<span class="divider"></span>
	<button
		type="button"
		class="tb"
		title="打印预览"
		aria-label="打印预览"
		onclick={() => {
			printContent = editor.getHTML()
			printOpen = true
		}}
	>
		<Printer size={14} />
	</button>
</div>

<Modal open={linkOpen} title="插入链接" onClose={() => (linkOpen = false)}>
	<label class="field"><span>文本</span><input bind:value={linkText} placeholder="显示文字" /></label>
	<label class="field"><span>链接地址</span><input bind:value={linkHref} placeholder="https://" /></label>
	{#snippet footer()}
		<button type="button" class="btn" onclick={() => (linkOpen = false)}>取消</button>
		<button type="button" class="btn primary" onclick={applyLink}>确定</button>
	{/snippet}
</Modal>

<PrintPreviewModal open={printOpen} onClose={() => (printOpen = false)} title={docName} content={printContent} />

<style>
	.toolbar-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
		position: relative;
		z-index: 5;
	}
	.panel-mask {
		position: fixed;
		inset: 0;
		border: 0;
		background: transparent;
		z-index: 4;
	}
	.tb,
	.tb-select {
		height: 28px;
		min-width: 28px;
		padding: 0 8px;
		border: 1px solid #d0d3d6;
		border-radius: 6px;
		background: #fff;
		cursor: pointer;
		font-size: 12px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		color: #1f2329;
	}
	.heading-trigger {
		padding: 0 8px;
	}
	.heading-t {
		font-weight: 700;
		margin-right: 2px;
	}
	.tb.is-active {
		border-color: #3370ff;
		color: #3370ff;
		background: #eef3ff;
	}
	.tb:disabled,
	.tb-select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.divider {
		width: 1px;
		height: 18px;
		background: #e8eaed;
		margin: 0 4px;
	}
	.drop {
		position: relative;
	}
	.menu {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		z-index: 6;
		min-width: 140px;
		background: #fff;
		border: 1px solid #e8eaed;
		border-radius: 8px;
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
		padding: 6px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.panel-wide {
		min-width: 240px;
	}
	.menu > button {
		border: 0;
		background: transparent;
		text-align: left;
		padding: 6px 8px;
		border-radius: 6px;
		cursor: pointer;
	}
	.menu > button:hover {
		background: #f5f6f7;
	}
	.color-menu {
		flex-direction: row;
		flex-wrap: wrap;
		width: 180px;
	}
	.swatch {
		width: 20px;
		height: 20px;
		border-radius: 4px;
		border: 1px solid #d0d3d6;
		padding: 0;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-bottom: 10px;
	}
	.field input {
		height: 34px;
		border: 1px solid #d0d3d6;
		border-radius: 6px;
		padding: 0 8px;
	}
	.btn {
		height: 32px;
		padding: 0 14px;
		border: 1px solid #d0d3d6;
		border-radius: 6px;
		background: #fff;
		cursor: pointer;
	}
	.btn.primary {
		border-color: #3370ff;
		background: #3370ff;
		color: #fff;
	}
</style>
