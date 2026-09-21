import { BulletList, OrderedList } from '@tiptap/extension-list'

export const StyledOrderedList = OrderedList.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			listStyle: {
				default: 'decimal-dot',
				parseHTML: element => element.getAttribute('data-ol-style') || 'decimal-dot',
				renderHTML: attributes => {
					if (!attributes.listStyle) return {}
					return { 'data-ol-style': attributes.listStyle }
				},
			},
		}
	},
})

export const StyledBulletList = BulletList.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			listStyle: {
				default: 'disc',
				parseHTML: element => element.getAttribute('data-ul-style') || 'disc',
				renderHTML: attributes => {
					if (!attributes.listStyle) return {}
					return { 'data-ul-style': attributes.listStyle }
				},
			},
		}
	},
})
