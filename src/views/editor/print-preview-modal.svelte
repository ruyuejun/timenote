<script lang="ts">
	import Modal from '$lib/ui/Modal.svelte'

	interface Props {
		open: boolean
		onClose: () => void
		title: string
		content: string
	}

	let { open, onClose, title, content }: Props = $props()

	function htmlEscape(value: string) {
		return value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
	}

	function handlePrint() {
		document.getElementById('yjwy-print-iframe')?.remove()
		const iframe = document.createElement('iframe')
		iframe.id = 'yjwy-print-iframe'
		iframe.title = 'print'
		iframe.setAttribute('aria-hidden', 'true')
		iframe.style.position = 'fixed'
		iframe.style.right = '0'
		iframe.style.bottom = '0'
		iframe.style.width = '0'
		iframe.style.height = '0'
		iframe.style.border = '0'
		document.body.appendChild(iframe)

		const doc = iframe.contentDocument || iframe.contentWindow?.document
		if (!doc) return

		doc.open()
		doc.write(`
			<!DOCTYPE html>
			<html lang="zh-CN">
				<head>
					<meta charset="utf-8" />
					<title>${htmlEscape(title)}</title>
					<style>
						@page { margin: 0 0 12mm 0; }
						body {
							font-family: "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, sans-serif;
							font-size: 14px;
							line-height: 1.8;
							color: #1f2329;
							margin: 0;
						}
						.doc-body {
							padding: 20mm 16mm 16mm 16mm;
							box-decoration-break: clone;
							-webkit-box-decoration-break: clone;
						}
						table { border-collapse: collapse; width: 100%; }
						th, td { border: 1px solid #d0d3d6; padding: 8px 12px; }
						img { max-width: 100%; height: auto; }
					</style>
				</head>
				<body><div class="doc-body">${content}</div></body>
			</html>
		`)
		doc.close()
		iframe.contentWindow?.focus()
		iframe.contentWindow?.print()
	}
</script>

<Modal {open} title="打印预览" wide onClose={onClose}>
	<div class="print-preview-body">{@html content}</div>
	{#snippet footer()}
		<button type="button" class="btn primary" onclick={handlePrint}>打印</button>
		<button type="button" class="btn" onclick={onClose}>关闭</button>
	{/snippet}
</Modal>

<style>
	.btn {
		height: 32px;
		padding: 0 14px;
		border: 1px solid #d0d3d6;
		border-radius: 6px;
		background: #fff;
		cursor: pointer;
	}
	.btn.primary {
		border-color: #3370ff;
		background: #3370ff;
		color: #fff;
	}
</style>
