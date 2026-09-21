export interface EditorFontOption {
	key: string
	label: string
	/** 写入文档的 font-family，按系统自动匹配可用字体 */
	css: string
}

/**
 * 宋体 / 仿宋 / 黑体 / 楷体走系统字体（macOS 与 Windows 名称不同，写在同一栈里）。
 * 「微软雅黑」：macOS 命中苹方，Windows 命中微软雅黑。
 * 思源黑体没有系统保证，使用本地打包的 Noto Sans SC（思源黑体的开源同源字体）。
 */
export const EDITOR_FONTS: EditorFontOption[] = [
	{
		key: 'songti',
		label: '宋体',
		css: '"Songti SC", SimSun, "宋体", serif',
	},
	{
		key: 'fangsong',
		label: '仿宋',
		css: '"STFangsong", FangSong, "仿宋", serif',
	},
	{
		key: 'heiti',
		label: '黑体',
		css: '"Heiti SC", SimHei, "黑体", sans-serif',
	},
	{
		key: 'kaiti',
		label: '楷体',
		css: '"Kaiti SC", KaiTi, "楷体", serif',
	},
	{
		key: 'ui-sans',
		label: '微软雅黑',
		css: '"PingFang SC", "Microsoft YaHei", "微软雅黑", sans-serif',
	},
	{
		key: 'source-han',
		label: '思源',
		css: '"Noto Sans SC Variable", "Noto Sans SC", "Source Han Sans SC", sans-serif',
	},
]

export const DEFAULT_EDITOR_FONT = EDITOR_FONTS.find(item => item.key === 'ui-sans') ?? EDITOR_FONTS[0]

function normalizeFontFamily(value: string) {
	return value
		.replace(/['"]/g, '')
		.replace(/\s*,\s*/g, ',')
		.replace(/\s+/g, ' ')
		.trim()
		.toLowerCase()
}

export function resolveEditorFontKey(fontFamily?: string | null) {
	if (!fontFamily) return DEFAULT_EDITOR_FONT.key
	const current = normalizeFontFamily(fontFamily)
	const matched = EDITOR_FONTS.find(item => {
		const css = normalizeFontFamily(item.css)
		return (
			current === css ||
			current.startsWith(css.split(',')[0] ?? '') ||
			css.startsWith(current.split(',')[0] ?? '')
		)
	})
	return matched?.key ?? DEFAULT_EDITOR_FONT.key
}
