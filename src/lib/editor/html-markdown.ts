import { marked } from 'marked'
import TurndownService from 'turndown'
import { highlightedCodeBlock, strikethrough, taskListItems } from 'turndown-plugin-gfm'

const turndownOptions: TurndownService.Options = {
	headingStyle: 'atx',
	codeBlockStyle: 'fenced',
	emDelimiter: '*',
	bulletListMarker: '-',
}

function addSharedRules(service: TurndownService) {
	service.use([highlightedCodeBlock, strikethrough, taskListItems])
	service.addRule('underline', {
		filter: ['u'],
		replacement: content => `<u>${content}</u>`,
	})
	service.addRule('superscript', {
		filter: ['sup'],
		replacement: content => `<sup>${content}</sup>`,
	})
	service.addRule('subscript', {
		filter: ['sub'],
		replacement: content => `<sub>${content}</sub>`,
	})
	service.addRule('styledSpan', {
		filter: node => node.nodeName === 'SPAN' && Boolean((node as HTMLElement).getAttribute('style')),
		replacement: (content, node) => {
			const style = (node as HTMLElement).getAttribute('style')
			return style ? `<span style="${style}">${content}</span>` : content
		},
	})
	service.addRule('styledBlock', {
		filter: node => /^(P|H[1-6])$/.test(node.nodeName) && Boolean((node as HTMLElement).getAttribute('style')),
		replacement: (content, node) => {
			const el = node as HTMLElement
			const tag = el.nodeName.toLowerCase()
			const style = el.getAttribute('style')
			return `\n\n<${tag} style="${style}">${content}</${tag}>\n\n`
		},
	})
	service.keep(node => {
		const el = node as HTMLElement
		return (el.nodeName === 'UL' || el.nodeName === 'OL') && el.hasAttribute('data-list-style')
	})
}

const turndown = new TurndownService(turndownOptions)
addSharedRules(turndown)
turndown.addRule('tiptapTable', {
	filter: 'table',
	replacement(_content, node) {
		return serializeTable(node as HTMLTableElement)
	},
})

function flattenCellHtml(cell: HTMLElement) {
	return cell.innerHTML
		.replace(/<\/p>\s*<p[^>]*>/gi, '<br>')
		.replace(/<\/?p[^>]*>/gi, '')
		.trim()
}

function serializeTable(table: HTMLTableElement) {
	const rows = Array.from(table.rows)
	if (!rows.length) return '\n\n'

	const renderCell = (cell: HTMLTableCellElement) => {
		const tag = cell.tagName.toLowerCase()
		const inner = flattenCellHtml(cell)
		return `<${tag}><p>${inner}</p></${tag}>`
	}

	const body = rows.map(row => `<tr>${Array.from(row.cells).map(renderCell).join('')}</tr>`).join('')
	return `\n\n<table><tbody>${body}</tbody></table>\n\n`
}

function stripLayoutNoise(html: string) {
	return html.replace(/<colgroup[\s\S]*?<\/colgroup>/gi, '').replace(/\scolwidth="[^"]*"/gi, '')
}

function splitTableRow(line: string) {
	let text = line.trim()
	if (text.startsWith('|')) text = text.slice(1)
	if (text.endsWith('|')) text = text.slice(0, -1)
	return text.split('|').map(cell => cell.trim())
}

function isSeparatorRow(line: string) {
	const cells = splitTableRow(line)
	return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell))
}

function isPipeRow(line: string) {
	const text = line.trim()
	return text.includes('|') && (text.match(/\|/g) || []).length >= 2
}

function gfmTablesToHtml(markdown: string) {
	const lines = markdown.split('\n')
	const output: string[] = []
	let index = 0

	while (index < lines.length) {
		if (index + 1 < lines.length && isPipeRow(lines[index]) && isSeparatorRow(lines[index + 1])) {
			const header = splitTableRow(lines[index])
			index += 2
			const body: string[][] = []
			while (index < lines.length && isPipeRow(lines[index]) && !isSeparatorRow(lines[index])) {
				body.push(splitTableRow(lines[index]))
				index += 1
			}
			const width = Math.max(header.length, ...body.map(row => row.length), 1)
			const pad = (row: string[]) => Array.from({ length: width }, (_, cellIndex) => row[cellIndex] ?? '')
			const cell = (value: string, tag: string) => `<${tag}><p>${value}</p></${tag}>`
			output.push(
				`<table><tbody><tr>${pad(header).map(value => cell(value, 'th')).join('')}</tr>${body
					.map(row => `<tr>${pad(row).map(value => cell(value, 'td')).join('')}</tr>`)
					.join('')}</tbody></table>`,
			)
			continue
		}
		output.push(lines[index])
		index += 1
	}

	return output.join('\n')
}

function wrapTableCells(html: string) {
	return html.replace(/<(td|th)(\b[^>]*)>([\s\S]*?)<\/\1>/gi, (_match, tag: string, attrs: string, inner: string) => {
		const trimmed = inner.trim()
		if (!trimmed) return `<${tag}${attrs}><p></p></${tag}>`
		if (/^<p[\s>]/i.test(trimmed)) return `<${tag}${attrs}>${trimmed}</${tag}>`
		return `<${tag}${attrs}><p>${trimmed}</p></${tag}>`
	})
}

marked.setOptions({ gfm: true, breaks: false })

export function isMarkdownFile(filePath?: string, fileName?: string) {
	return /\.(md|markdown)$/i.test(filePath || '') || /\.(md|markdown)$/i.test(fileName || '')
}

export function looksLikeHtml(text: string) {
	const trimmed = text.trim()
	return /^<(p|h[1-6]|ul|ol|table|div|blockquote|pre|img|hr)\b/i.test(trimmed) && /<\/[a-z][\w:-]*>/i.test(trimmed)
}

export function looksLikeMarkdownSource(text: string) {
	const trimmed = text.trim()
	if (!trimmed || looksLikeHtml(trimmed)) return false
	return /(^|\n)\s*#{1,6}\s|(^|\n)\s*\|.+\||(^|\n)\s*[-*+]\s|(^|\n)```/.test(trimmed)
}

export function htmlToMarkdown(html: string) {
	return `${turndown.turndown(stripLayoutNoise(html)).trim()}\n`
}

export function markdownToHtml(markdown: string) {
	if (!markdown.trim()) return '<p></p>'
	if (looksLikeHtml(markdown) && !looksLikeMarkdownSource(markdown)) return wrapTableCells(markdown)
	const html = marked.parse(gfmTablesToHtml(markdown), { async: false }) as string
	return wrapTableCells(html)
}

export function toEditorHtml(content: string) {
	if (!content.trim()) return '<p></p>'
	if (looksLikeMarkdownSource(content)) return markdownToHtml(content)
	if (content.includes('<table')) return wrapTableCells(content)
	return content
}

export function fileToEditorHtml(raw: string, filePath?: string, fileName?: string) {
	if (isMarkdownFile(filePath, fileName) || looksLikeMarkdownSource(raw) || !looksLikeHtml(raw)) {
		return toEditorHtml(raw)
	}
	return wrapTableCells(raw)
}

export function editorHtmlToFile(html: string, filePath?: string, fileName?: string) {
	if (isMarkdownFile(filePath, fileName)) return htmlToMarkdown(html)
	return html
}
