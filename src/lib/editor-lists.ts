import type { Editor } from '@tiptap/core'

export interface ListStyleOption {
	key: string
	label: string
	preview: string[]
}

export const ORDERED_LIST_STYLES: ListStyleOption[] = [
	{ key: 'none', label: '无', preview: [] },
	{ key: 'cjk-dot', label: '一、', preview: ['一、', '二、', '三、'] },
	{ key: 'cjk-paren', label: '（一）', preview: ['（一）', '（二）', '（三）'] },
	{ key: 'decimal-dot', label: '1.', preview: ['1.', '2.', '3.'] },
	{ key: 'decimal-paren', label: '(1)', preview: ['(1)', '(2)', '(3)'] },
	{ key: 'circled', label: '①', preview: ['①', '②', '③'] },
	{ key: 'decimal-closed', label: '1)', preview: ['1)', '2)', '3)'] },
	{ key: 'upper-alpha', label: 'A.', preview: ['A.', 'B.', 'C.'] },
	{ key: 'lower-alpha', label: 'a.', preview: ['a.', 'b.', 'c.'] },
]

export const BULLET_LIST_STYLES: ListStyleOption[] = [
	{ key: 'none', label: '无', preview: [] },
	{ key: 'disc', label: '实心圆', preview: ['●', '●', '●'] },
	{ key: 'square', label: '方块', preview: ['■', '■', '■'] },
	{ key: 'diamond', label: '菱形', preview: ['◆', '◆', '◆'] },
	{ key: 'star', label: '四角星', preview: ['✦', '✦', '✦'] },
	{ key: 'triangle', label: '三角', preview: ['▸', '▸', '▸'] },
	{ key: 'check', label: '对勾', preview: ['✓', '✓', '✓'] },
	{ key: 'diamond-outline', label: '空心菱形', preview: ['◇', '◇', '◇'] },
]

function clearOtherLists(editor: Editor) {
	const chain = editor.chain().focus()
	if (editor.isActive('taskList')) chain.toggleTaskList()
	return chain
}

export function applyOrderedListStyle(editor: Editor, key: string) {
	if (key === 'none') {
		if (editor.isActive('orderedList')) editor.chain().focus().toggleOrderedList().run()
		return
	}
	const chain = clearOtherLists(editor)
	if (editor.isActive('bulletList')) chain.toggleBulletList()
	if (!editor.isActive('orderedList')) chain.toggleOrderedList()
	chain.updateAttributes('orderedList', { listStyle: key }).run()
}

export function applyBulletListStyle(editor: Editor, key: string) {
	if (key === 'none') {
		if (editor.isActive('bulletList')) editor.chain().focus().toggleBulletList().run()
		return
	}
	const chain = clearOtherLists(editor)
	if (editor.isActive('orderedList')) chain.toggleOrderedList()
	if (!editor.isActive('bulletList')) chain.toggleBulletList()
	chain.updateAttributes('bulletList', { listStyle: key }).run()
}

export function currentOrderedStyle(editor: Editor) {
	if (!editor.isActive('orderedList')) return 'none'
	return (editor.getAttributes('orderedList').listStyle as string | undefined) ?? 'decimal-dot'
}

export function currentBulletStyle(editor: Editor) {
	if (!editor.isActive('bulletList')) return 'none'
	return (editor.getAttributes('bulletList').listStyle as string | undefined) ?? 'disc'
}
