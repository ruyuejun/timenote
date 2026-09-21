/**
 * 清理从 Excel / WPS / Office 粘贴的 HTML，保留表格结构与单元格文字，去掉样式垃圾。
 * 非表格内容原样返回，避免影响普通粘贴。
 */
export function cleanOfficePasteHtml(html: string): string {
	if (!html.includes('<table') && !/mso-|Excel|SpreadsheetML/i.test(html)) {
		return html
	}

	const doc = new DOMParser().parseFromString(html, 'text/html')
	const tables = [...doc.body.querySelectorAll('table')]
	if (tables.length === 0) {
		return stripOfficeNoise(doc.body).innerHTML
	}

	const fragment = doc.createElement('div')
	for (const table of tables) {
		fragment.appendChild(normalizeTable(table, doc))
	}
	return fragment.innerHTML
}

function stripOfficeNoise(root: HTMLElement): HTMLElement {
	root.querySelectorAll('style, meta, link, xml, o\\:p, script').forEach(el => el.remove())
	root.querySelectorAll('*').forEach(el => {
		for (const attr of [...el.attributes]) {
			const name = attr.name.toLowerCase()
			if (
				name === 'style' ||
				name === 'class' ||
				name.startsWith('data-') ||
				name.startsWith('on') ||
				name.startsWith('xmlns') ||
				name.startsWith('v:') ||
				name.startsWith('o:') ||
				name.startsWith('w:')
			) {
				el.removeAttribute(attr.name)
			}
		}
	})
	return root
}

function normalizeTable(source: HTMLTableElement, doc: Document): HTMLTableElement {
	const table = doc.createElement('table')
	const rows = [...source.querySelectorAll('tr')]

	for (const sourceRow of rows) {
		const row = doc.createElement('tr')
		const cells = [...sourceRow.children].filter(
			el => el.tagName === 'TD' || el.tagName === 'TH',
		) as HTMLTableCellElement[]

		for (const sourceCell of cells) {
			const isHeader = sourceCell.tagName === 'TH'
			const cell = doc.createElement(isHeader ? 'th' : 'td')
			const colspan = Number(sourceCell.getAttribute('colspan') || 1)
			const rowspan = Number(sourceCell.getAttribute('rowspan') || 1)
			if (colspan > 1) cell.setAttribute('colspan', String(colspan))
			if (rowspan > 1) cell.setAttribute('rowspan', String(rowspan))

			const text = extractCellText(sourceCell)
			const paragraph = doc.createElement('p')
			paragraph.textContent = text
			cell.appendChild(paragraph)
			row.appendChild(cell)
		}

		if (row.childElementCount > 0) table.appendChild(row)
	}

	return table
}

function extractCellText(cell: HTMLElement): string {
	const clone = cell.cloneNode(true) as HTMLElement
	clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'))
	return (clone.textContent || '')
		.replace(/\u00a0/g, ' ')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim()
}

/**
 * 纯文本里的 Tab / 换行（Excel 复制常见）转成简单 HTML 表格。
 * 仅在「看起来像表格」时转换：至少两行，且含 Tab。
 */
export function plainTextToTableHtml(text: string): string | null {
	const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trimEnd()
	if (!normalized.includes('\t')) return null

	const rows = normalized.split('\n').filter(line => line.length > 0)
	if (rows.length < 2) return null

	const matrix = rows.map(line => line.split('\t'))
	const colCount = Math.max(...matrix.map(cols => cols.length))
	if (colCount < 2) return null

	const htmlRows = matrix
		.map((cols, rowIndex) => {
			const cells = Array.from({ length: colCount }, (_, i) => {
				const value = (cols[i] ?? '').trim()
				const tag = rowIndex === 0 ? 'th' : 'td'
				return `<${tag}><p>${escapeHtml(value)}</p></${tag}>`
			}).join('')
			return `<tr>${cells}</tr>`
		})
		.join('')

	return `<table>${htmlRows}</table>`
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}
