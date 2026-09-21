import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import { cleanOfficePasteHtml, plainTextToTableHtml } from './clean-office-paste'
import { replaceDataImagesInHtml } from '../pending-editor-images'

/**
 * Excel / WPS 粘贴：
 * 1. HTML 表格 → 清洗样式后按表格插入
 * 2. 纯文本 Tab 分隔 → 转成表格插入
 * 3. 顺带把 data: 图换成短占位符（与 PendingImagePaste 双保险）
 */
export const OfficePaste = Extension.create({
	name: 'officePaste',

	addProseMirrorPlugins() {
		const editor = this.editor

		return [
			new Plugin({
				key: new PluginKey('officePaste'),
				props: {
					transformPastedHTML(html) {
						return replaceDataImagesInHtml(cleanOfficePasteHtml(html))
					},
					handlePaste(_view, event) {
						const clipboard = event.clipboardData
						if (!clipboard) return false

						const html = clipboard.getData('text/html')
						// 有 HTML 表格时走默认粘贴 + transformPastedHTML
						if (html.includes('<table')) return false

						const text = clipboard.getData('text/plain')
						const tableHtml = text ? plainTextToTableHtml(text) : null
						if (!tableHtml) return false

						editor.commands.insertContent(tableHtml)
						return true
					},
				},
			}),
		]
	},
})
