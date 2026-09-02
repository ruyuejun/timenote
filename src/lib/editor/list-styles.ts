export type OrderedListStyleId =
	| 'none'
	| 'cjk-dot'
	| 'cjk-paren'
	| 'decimal'
	| 'decimal-paren'
	| 'circled'
	| 'decimal-rparen'
	| 'upper-alpha'
	| 'lower-alpha'

export type BulletListStyleId =
	| 'none'
	| 'disc'
	| 'square'
	| 'diamond'
	| 'star'
	| 'arrow'
	| 'check'
	| 'diamond-outline'

export const ORDERED_LIST_STYLES: {
	id: OrderedListStyleId
	label: string
	preview: string[]
}[] = [
	{ id: 'none', label: '无', preview: [] },
	{ id: 'cjk-dot', label: '一、', preview: ['一、', '二、', '三、'] },
	{ id: 'cjk-paren', label: '（一）', preview: ['（一）', '（二）', '（三）'] },
	{ id: 'decimal', label: '1.', preview: ['1.', '2.', '3.'] },
	{ id: 'decimal-paren', label: '(1)', preview: ['(1)', '(2)', '(3)'] },
	{ id: 'circled', label: '①', preview: ['①', '②', '③'] },
	{ id: 'decimal-rparen', label: '1)', preview: ['1)', '2)', '3)'] },
	{ id: 'upper-alpha', label: 'A.', preview: ['A.', 'B.', 'C.'] },
	{ id: 'lower-alpha', label: 'a.', preview: ['a.', 'b.', 'c.'] },
]

export const BULLET_LIST_STYLES: {
	id: BulletListStyleId
	label: string
	marker: string
}[] = [
	{ id: 'none', label: '无', marker: '' },
	{ id: 'disc', label: '实心圆', marker: '●' },
	{ id: 'square', label: '方块', marker: '■' },
	{ id: 'diamond', label: '菱形', marker: '◆' },
	{ id: 'star', label: '四角星', marker: '✦' },
	{ id: 'arrow', label: '箭头', marker: '▸' },
	{ id: 'check', label: '勾选', marker: '✓' },
	{ id: 'diamond-outline', label: '空心菱形', marker: '◇' },
]
