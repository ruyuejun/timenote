/** 文档导出：HTML / Markdown / PDF */

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

function sanitizeFilename(name: string) {
	const trimmed = name.trim() || '未命名文档'
	return trimmed.replace(/[\\/:*?"<>|]/g, '_').slice(0, 80)
}

function downloadBlob(filename: string, blob: Blob) {
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement('a')
	anchor.href = url
	anchor.download = filename
	anchor.click()
	URL.revokeObjectURL(url)
}

function escapeHtml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
}

function buildStandaloneHtml(title: string, bodyHtml: string) {
	const safeTitle = escapeHtml(title)
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>${safeTitle}</title>
	<style>
		body {
			font-family: "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, sans-serif;
			font-size: 14px;
			line-height: 1.8;
			color: #1f2329;
			max-width: 800px;
			margin: 32px auto;
			padding: 0 24px;
		}
		h1 { font-size: 22px; font-weight: 700; margin: 0 0 16px; }
		h2 { font-size: 18px; font-weight: 700; margin: 24px 0 12px; }
		h3 { font-size: 16px; font-weight: 700; margin: 20px 0 10px; }
		h4 { font-size: 15px; font-weight: 600; margin: 18px 0 8px; }
		h5 { font-size: 14px; font-weight: 600; margin: 16px 0 8px; }
		h6 { font-size: 13px; font-weight: 500; margin: 14px 0 8px; }
		p { margin: 0 0 12px; }
		img { max-width: 100%; height: auto; }
		a { color: #1677ff; text-decoration: none; }
		ul, ol { padding-left: 22px; margin: 0 0 12px; }
		li { margin: 0 0 4px; }
		code {
			background: #f0f1f2;
			padding: 2px 4px;
			border-radius: 4px;
			font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
			font-size: 0.9em;
		}
		pre {
			background: #f5f6f7;
			padding: 12px 16px;
			border-radius: 8px;
			overflow-x: auto;
			margin: 0 0 12px;
		}
		pre code { background: transparent; padding: 0; }
		table { border-collapse: collapse; width: 100%; margin: 0 0 12px; }
		th, td { border: 1px solid #d0d3d6; padding: 8px 12px; }
		th { background: #f5f6f7; font-weight: 600; }
		blockquote {
			border-left: 4px solid #d0d3d6;
			padding-left: 16px;
			margin: 0 0 12px;
			color: #5f6368;
		}
		hr { border: none; border-top: 1px solid #d0d3d6; margin: 16px 0; }
	</style>
</head>
<body>
	<h1>${safeTitle}</h1>
	${bodyHtml}
</body>
</html>`
}

function nodeToMarkdown(node: Node): string {
	if (node.nodeType === Node.TEXT_NODE) {
		return node.textContent?.replace(/\s+/g, ' ') ?? ''
	}
	if (node.nodeType !== Node.ELEMENT_NODE) return ''

	const el = node as HTMLElement
	const tag = el.tagName.toLowerCase()
	const children = Array.from(el.childNodes).map(nodeToMarkdown).join('')

	switch (tag) {
		case 'h1':
			return `# ${children.trim()}\n\n`
		case 'h2':
			return `## ${children.trim()}\n\n`
		case 'h3':
			return `### ${children.trim()}\n\n`
		case 'h4':
			return `#### ${children.trim()}\n\n`
		case 'h5':
			return `##### ${children.trim()}\n\n`
		case 'h6':
			return `###### ${children.trim()}\n\n`
		case 'p':
			return `${children.trim()}\n\n`
		case 'br':
			return '\n'
		case 'strong':
		case 'b':
			return `**${children}**`
		case 'em':
		case 'i':
			return `*${children}*`
		case 'u':
			return children
		case 's':
		case 'del':
		case 'strike':
			return `~~${children}~~`
		case 'code':
			return el.parentElement?.tagName.toLowerCase() === 'pre' ? children : `\`${children}\``
		case 'pre':
			return `\`\`\`\n${el.textContent?.replace(/\n$/, '') ?? ''}\n\`\`\`\n\n`
		case 'a': {
			const href = el.getAttribute('href') || ''
			return href ? `[${children}](${href})` : children
		}
		case 'img': {
			const src = el.getAttribute('src') || ''
			const alt = el.getAttribute('alt') || 'image'
			return src ? `![${alt}](${src})\n\n` : ''
		}
		case 'ul':
			return `${Array.from(el.children)
				.map(li => `- ${nodeToMarkdown(li).trim()}`)
				.join('\n')}\n\n`
		case 'ol':
			return `${Array.from(el.children)
				.map((li, index) => `${index + 1}. ${nodeToMarkdown(li).trim()}`)
				.join('\n')}\n\n`
		case 'li':
			return children.trim()
		case 'blockquote':
			return `${children
				.trim()
				.split('\n')
				.map(line => `> ${line}`)
				.join('\n')}\n\n`
		case 'hr':
			return '---\n\n'
		case 'table': {
			const rows = Array.from(el.querySelectorAll('tr'))
			if (rows.length === 0) return ''
			const cells = (row: Element) =>
				Array.from(row.querySelectorAll('th,td')).map(cell => cell.textContent?.trim() || '')
			const header = cells(rows[0])
			const lines = [
				`| ${header.join(' | ')} |`,
				`| ${header.map(() => '---').join(' | ')} |`,
				...rows.slice(1).map(row => `| ${cells(row).join(' | ')} |`),
			]
			return `${lines.join('\n')}\n\n`
		}
		case 'thead':
		case 'tbody':
		case 'tr':
		case 'th':
		case 'td':
			return children
		default:
			return children
	}
}

export function htmlToMarkdown(html: string, title?: string) {
	const container = document.createElement('div')
	container.innerHTML = html
	const body = Array.from(container.childNodes).map(nodeToMarkdown).join('').trim()
	const heading = title?.trim() ? `# ${title.trim()}\n\n` : ''
	return `${heading}${body}\n`
}

export function exportAsHtml(title: string, html: string) {
	const content = buildStandaloneHtml(title, html)
	downloadBlob(`${sanitizeFilename(title)}.html`, new Blob([content], { type: 'text/html;charset=utf-8' }))
}

export function exportAsMarkdown(title: string, html: string) {
	const markdown = htmlToMarkdown(html, title)
	downloadBlob(`${sanitizeFilename(title)}.md`, new Blob([markdown], { type: 'text/markdown;charset=utf-8' }))
}

/** 导出为 PDF 文件（生成并自动下载） */
export async function exportAsPdf(title: string, html: string): Promise<void> {
	// 创建隐藏的渲染容器
	document.getElementById('yjwy-export-pdf-container')?.remove()

	const container = document.createElement('div')
	container.id = 'yjwy-export-pdf-container'
	container.style.cssText = `
		position: fixed;
		left: -9999px;
		top: 0;
		width: 794px;
		background: white;
		padding: 40px;
		font-family: "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, sans-serif;
		font-size: 14px;
		line-height: 1.8;
		color: #1f2329;
	`

	const safeTitle = escapeHtml(title)
	container.innerHTML = `
		<style>
			#yjwy-export-pdf-container h1 { font-size: 22px; font-weight: 700; margin: 0 0 16px; }
			#yjwy-export-pdf-container h2 { font-size: 18px; font-weight: 700; margin: 24px 0 12px; }
			#yjwy-export-pdf-container h3 { font-size: 16px; font-weight: 700; margin: 20px 0 10px; }
			#yjwy-export-pdf-container h4 { font-size: 15px; font-weight: 600; margin: 18px 0 8px; }
			#yjwy-export-pdf-container h5 { font-size: 14px; font-weight: 600; margin: 16px 0 8px; }
			#yjwy-export-pdf-container h6 { font-size: 13px; font-weight: 500; margin: 14px 0 8px; }
			#yjwy-export-pdf-container p { margin: 0 0 12px; }
			#yjwy-export-pdf-container img { max-width: 100%; height: auto; }
			#yjwy-export-pdf-container a { color: #1677ff; text-decoration: none; }
			#yjwy-export-pdf-container ul, #yjwy-export-pdf-container ol { padding-left: 22px; margin: 0 0 12px; }
			#yjwy-export-pdf-container li { margin: 0 0 4px; }
			#yjwy-export-pdf-container code {
				background: #f0f1f2;
				padding: 2px 4px;
				border-radius: 4px;
				font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
				font-size: 0.9em;
			}
			#yjwy-export-pdf-container pre {
				background: #f5f6f7;
				padding: 12px 16px;
				border-radius: 8px;
				overflow-x: auto;
				margin: 0 0 12px;
			}
			#yjwy-export-pdf-container pre code { background: transparent; padding: 0; }
			#yjwy-export-pdf-container table { border-collapse: collapse; width: 100%; margin: 0 0 12px; }
			#yjwy-export-pdf-container th, #yjwy-export-pdf-container td { border: 1px solid #d0d3d6; padding: 8px 12px; }
			#yjwy-export-pdf-container th { background: #f5f6f7; font-weight: 600; }
			#yjwy-export-pdf-container blockquote {
				border-left: 4px solid #d0d3d6;
				padding-left: 16px;
				margin: 0 0 12px;
				color: #5f6368;
			}
			#yjwy-export-pdf-container hr { border: none; border-top: 1px solid #d0d3d6; margin: 16px 0; }
		</style>
		<h1>${safeTitle}</h1>
		${html}
	`
	document.body.appendChild(container)

	try {
		// 等待图片加载
		const images = Array.from(container.querySelectorAll('img')) as HTMLImageElement[]
		await Promise.all(
			images.map(
				img =>
					new Promise<void>(resolve => {
						if (img.complete) {
							resolve()
						} else {
							img.onload = () => resolve()
							img.onerror = () => resolve()
						}
					}),
			),
		)

		// 使用 html2canvas 渲染为图片
		const canvas = await html2canvas(container, {
			scale: 2,
			useCORS: true,
			logging: false,
			backgroundColor: '#ffffff',
		})

		// 创建 PDF (A4 尺寸)
		const imgWidth = 210 // A4 宽度 mm
		const imgHeight = (canvas.height * imgWidth) / canvas.width
		const pdf = new jsPDF({
			orientation: imgHeight > 297 ? 'portrait' : 'portrait',
			unit: 'mm',
			format: 'a4',
		})

		// 如果内容高度超过一页，需要分页
		const pageHeight = 297 // A4 高度 mm
		let heightLeft = imgHeight
		let position = 0

		const imgData = canvas.toDataURL('image/png')
		pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
		heightLeft -= pageHeight

		while (heightLeft > 0) {
			position = heightLeft - imgHeight
			pdf.addPage()
			pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
			heightLeft -= pageHeight
		}

		// 下载 PDF
		pdf.save(`${sanitizeFilename(title)}.pdf`)
	} finally {
		// 清理容器
		container.remove()
	}
}
