export interface EditorFontSize {
	key: string
	label: string
	/** Word / WPS 中文字号对应磅值 */
	css: string
}

/** 初号最大，八号最小 */
export const EDITOR_FONT_SIZES: EditorFontSize[] = [
	{ key: 'chuhao', label: '初号', css: '42pt' },
	{ key: 'xiaochu', label: '小初', css: '36pt' },
	{ key: 'yihao', label: '一号', css: '26pt' },
	{ key: 'xiaoyi', label: '小一', css: '24pt' },
	{ key: 'erhao', label: '二号', css: '22pt' },
	{ key: 'xiaoer', label: '小二', css: '18pt' },
	{ key: 'sanhao', label: '三号', css: '16pt' },
	{ key: 'xiaosan', label: '小三', css: '15pt' },
	{ key: 'sihao', label: '四号', css: '14pt' },
	{ key: 'xiaosi', label: '小四', css: '12pt' },
	{ key: 'wuhao', label: '五号', css: '10.5pt' },
	{ key: 'xiaowu', label: '小五', css: '9pt' },
	{ key: 'liuhao', label: '六号', css: '7.5pt' },
	{ key: 'xiaoliu', label: '小六', css: '6.5pt' },
	{ key: 'qihao', label: '七号', css: '5.5pt' },
	{ key: 'bahao', label: '八号', css: '5pt' },
]

export const DEFAULT_FONT_SIZE = EDITOR_FONT_SIZES.find(item => item.key === 'xiaosi') ?? EDITOR_FONT_SIZES[9]

function normalizeSize(value: string) {
	return value.replace(/\s+/g, '').toLowerCase()
}

export function resolveFontSizeKey(fontSize?: string | null) {
	if (!fontSize) return DEFAULT_FONT_SIZE.key
	const current = normalizeSize(fontSize)
	const matched = EDITOR_FONT_SIZES.find(item => normalizeSize(item.css) === current)
	return matched?.key ?? DEFAULT_FONT_SIZE.key
}

export function stepFontSize(fontSize: string | null | undefined, direction: 1 | -1) {
	const key = resolveFontSizeKey(fontSize)
	const index = EDITOR_FONT_SIZES.findIndex(item => item.key === key)
	const nextIndex = Math.min(EDITOR_FONT_SIZES.length - 1, Math.max(0, index + direction))
	return EDITOR_FONT_SIZES[nextIndex]
}
