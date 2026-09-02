import { Extension } from '@tiptap/core'

export const ListStyle = Extension.create({
	name: 'listStyle',
	addGlobalAttributes() {
		return [
			{
				types: ['orderedList', 'bulletList'],
				attributes: {
					listStyle: {
						default: null,
						parseHTML: element => element.getAttribute('data-list-style'),
						renderHTML: attributes => {
							if (!attributes.listStyle) return {}
							return { 'data-list-style': attributes.listStyle }
						},
					},
				},
			},
		]
	},
})
