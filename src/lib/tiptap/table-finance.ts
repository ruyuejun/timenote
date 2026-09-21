import { Extension, findParentNode } from '@tiptap/core'

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		tableFinance: {
			/** 表头行开/关（第一行 th） */
			toggleTableHeaderRow: () => ReturnType
			/** 长表滚动时固定表头 */
			toggleTableStickyHeader: () => ReturnType
		}
	}
}

export const TableFinance = Extension.create({
	name: 'tableFinance',

	addGlobalAttributes() {
		return [
			{
				types: ['table'],
				attributes: {
					stickyHeader: {
						default: false,
						parseHTML: element =>
							element.getAttribute('data-sticky-header') === 'true',
						renderHTML: attributes => {
							if (!attributes.stickyHeader) return {}
							return { 'data-sticky-header': 'true' }
						},
					},
				},
			},
		]
	},

	addCommands() {
		return {
			toggleTableHeaderRow:
				() =>
				({ commands }) =>
					commands.toggleHeaderRow(),

			toggleTableStickyHeader:
				() =>
				({ state, tr, dispatch }) => {
					const table = findParentNode(node => node.type.name === 'table')(
						state.selection,
					)
					if (!table) return false

					const next = !table.node.attrs.stickyHeader
					if (dispatch) {
						tr.setNodeMarkup(table.pos, undefined, {
							...table.node.attrs,
							stickyHeader: next,
						})
						dispatch(tr)
					}
					return true
				},
		}
	},
})

export function isTableStickyHeader(editor: {
	isActive: (name: string, attrs?: Record<string, unknown>) => boolean
	getAttributes: (name: string) => Record<string, unknown>
}): boolean {
	if (!editor.isActive('table')) return false
	return Boolean(editor.getAttributes('table').stickyHeader)
}
