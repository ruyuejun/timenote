import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import {
	hydratePendingImagesInEditor,
	replaceDataImagesInHtml,
} from '../pending-editor-images'

/**
 * Word / 网页粘贴中的 base64 图：
 * 1. transformPastedHTML 换成短占位符，避免文档瞬间膨胀
 * 2. 粘贴后异步解码为 blob: 预览，保存时再上传
 */
export const PendingImagePaste = Extension.create({
	name: 'pendingImagePaste',

	addProseMirrorPlugins() {
		const editor = this.editor

		return [
			new Plugin({
				key: new PluginKey('pendingImagePaste'),
				props: {
					transformPastedHTML(html) {
						return replaceDataImagesInHtml(html)
					},
					handlePaste(_view, event) {
						const html = event.clipboardData?.getData('text/html') ?? ''
						if (/data:image\//i.test(html)) {
							queueMicrotask(() => {
								void hydratePendingImagesInEditor(editor)
							})
						}
						return false
					},
				},
			}),
		]
	},
})
