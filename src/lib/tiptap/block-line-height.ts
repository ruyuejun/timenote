import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		blockLineHeight: {
			setBlockLineHeight: (lineHeight: string | null) => ReturnType
		}
	}
}

export const BlockLineHeight = Extension.create({
	name: 'blockLineHeight',

	addGlobalAttributes() {
		return [
			{
				types: ['paragraph', 'heading'],
				attributes: {
					lineHeight: {
						default: null,
						parseHTML: element => element.style.lineHeight || null,
						renderHTML: attributes => {
							if (!attributes.lineHeight) return {}
							return { style: `line-height: ${attributes.lineHeight}` }
						},
					},
				},
			},
		]
	},

	addCommands() {
		return {
			setBlockLineHeight:
				lineHeight =>
				({ chain }) => {
					const next = { lineHeight }
					return chain()
						.updateAttributes('paragraph', next)
						.updateAttributes('heading', next)
						.run()
				},
		}
	},
})
