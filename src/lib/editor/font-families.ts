/** 公文常用中文字体；雅黑/苹方按系统切换，思源走 @font-face。 */

export const isMacOS =
	typeof navigator !== 'undefined' &&
	(/Mac|iPhone|iPad|iPod/i.test(navigator.platform) || /Mac OS X|Macintosh/i.test(navigator.userAgent))

const SONG = isMacOS
	? '"Songti SC", "STSong", "SimSun", "NSimSun", serif'
	: '"SimSun", "NSimSun", "Songti SC", "STSong", serif'

const FANGSONG = isMacOS
	? '"STFangsong", "FangSong", "FangSong_GB2312", serif'
	: '"FangSong", "FangSong_GB2312", "STFangsong", serif'

const HEITI = isMacOS
	? '"Heiti SC", "STHeiti", "SimHei", sans-serif'
	: '"SimHei", "Heiti SC", "STHeiti", sans-serif'

const KAITI = isMacOS
	? '"Kaiti SC", "STKaiti", "KaiTi", "KaiTi_GB2312", serif'
	: '"KaiTi", "KaiTi_GB2312", "Kaiti SC", "STKaiti", serif'

/** Mac 优先苹方，Windows 优先微软雅黑；另一端作为回退，方便跨系统打开同一份稿。 */
export const YAHEI_PINGFANG = isMacOS
	? '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
	: '"Microsoft YaHei", "Microsoft YaHei UI", "PingFang SC", sans-serif'

export const SOURCE_HAN = '"Noto Sans SC", "Source Han Sans SC", "Source Han Sans CN", sans-serif'

export type EditorFontId = 'song' | 'fangsong' | 'heiti' | 'kaiti' | 'yahei' | 'sourcehan'

export type EditorFont = {
	id: EditorFontId
	label: string
	css: string
	tokens: readonly string[]
}

export const FONT_FAMILIES: readonly EditorFont[] = [
	{ id: 'song', label: '宋体', css: SONG, tokens: ['simsun', 'nsimsun', 'songti sc', 'stsong'] },
	{ id: 'fangsong', label: '仿宋', css: FANGSONG, tokens: ['fangsong', 'stfangsong'] },
	{ id: 'heiti', label: '黑体', css: HEITI, tokens: ['simhei', 'heiti sc', 'stheiti'] },
	{ id: 'kaiti', label: '楷体', css: KAITI, tokens: ['kaiti', 'stkaiti', 'kaiti sc'] },
	{
		id: 'yahei',
		label: '苹方',
		css: YAHEI_PINGFANG,
		tokens: ['microsoft yahei', 'pingfang', 'hiragino sans gb'],
	},
	{
		id: 'sourcehan',
		label: '思源',
		css: SOURCE_HAN,
		tokens: ['noto sans sc', 'source han sans'],
	},
]

export const DEFAULT_FONT = YAHEI_PINGFANG

function normalizeFamily(value: string) {
	return value.replace(/['"]/g, '').replace(/\s+/g, ' ').trim().toLowerCase()
}

export function matchFontFamily(css: string | undefined): EditorFont {
	const normalized = normalizeFamily(css || DEFAULT_FONT)
	return (
		FONT_FAMILIES.find(font => font.tokens.some(token => normalized.includes(token))) ??
		FONT_FAMILIES.find(font => font.id === 'yahei')!
	)
}
