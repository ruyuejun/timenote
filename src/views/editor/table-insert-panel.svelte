<script lang="ts">
	import type { Editor } from '@tiptap/core'
	import { toast } from '$lib/toast'
	import { isTableStickyHeader } from '$lib/tiptap/table-finance'

	const TABLE_MAX = 6

	interface Props {
		editor: Editor
		onInserted?: () => void
	}

	let { editor, onInserted }: Props = $props()
	let hover = $state({ rows: 0, cols: 0 })
	let tick = $state(0)

	$effect(() => {
		const update = () => {
			tick += 1
		}
		editor.on('transaction', update)
		return () => editor.off('transaction', update)
	})

	const inTable = $derived.by(() => {
		tick
		return editor.isActive('table')
	})
	const sticky = $derived.by(() => {
		tick
		return isTableStickyHeader(editor)
	})

	function run(ok: boolean, failText: string) {
		if (!ok) toast.error(failText)
		onInserted?.()
	}
</script>

<div
	class="table-insert-panel"
	role="group"
	aria-label="插入表格"
	onmouseleave={() => (hover = { rows: 0, cols: 0 })}
>
	<div class="table-insert-title">插入表格</div>
	<div class="table-insert-grid">
		{#each Array.from({ length: TABLE_MAX * TABLE_MAX }, (_, index) => index) as index}
			{@const rows = Math.floor(index / TABLE_MAX) + 1}
			{@const cols = (index % TABLE_MAX) + 1}
			<button
				type="button"
				class="table-insert-cell"
				class:is-active={hover.rows >= rows && hover.cols >= cols}
				onmouseenter={() => (hover = { rows, cols })}
				onclick={() => {
					editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
					onInserted?.()
				}}
			></button>
		{/each}
	</div>
	{#if hover.rows > 0}
		<div class="table-insert-size">{hover.rows} × {hover.cols}</div>
	{/if}

	{#if inTable}
		<hr />
		<div class="table-insert-title">表格操作</div>
		<div class="table-ops-hint">拖选多个单元格后再合并；Excel 表格可直接粘贴</div>
		<div class="table-ops">
			<button type="button" title="合并单元格" disabled={!editor.can().mergeCells()} onclick={() => run(editor.chain().focus().mergeCells().run(), '请先拖选至少两个单元格')}>合并</button>
			<button type="button" title="拆分单元格" disabled={!editor.can().splitCell()} onclick={() => run(editor.chain().focus().splitCell().run(), '当前单元格无法拆分')}>拆分</button>
			<button type="button" class:is-active={sticky} title={sticky ? '取消固定表头' : '固定表头'} onclick={() => { editor.chain().focus().toggleTableStickyHeader().run(); onInserted?.() }}>固定表头</button>
			<button type="button" onclick={() => { editor.chain().focus().toggleTableHeaderRow().run(); onInserted?.() }}>表头</button>
			<button type="button" onclick={() => editor.chain().focus().addRowBefore().run()}>上行</button>
			<button type="button" onclick={() => editor.chain().focus().addRowAfter().run()}>下行</button>
			<button type="button" onclick={() => editor.chain().focus().addColumnBefore().run()}>左列</button>
			<button type="button" onclick={() => editor.chain().focus().addColumnAfter().run()}>右列</button>
			<button type="button" class="danger" onclick={() => { editor.chain().focus().deleteTable().run(); onInserted?.() }}>删表</button>
		</div>
	{/if}
</div>

<style>
	.table-ops {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.table-ops button {
		height: 28px;
		padding: 0 8px;
		border: 1px solid #d0d3d6;
		border-radius: 6px;
		background: #fff;
		cursor: pointer;
		font-size: 12px;
	}
	.table-ops button.is-active {
		border-color: #3370ff;
		color: #3370ff;
	}
	.table-ops .danger {
		color: #f04438;
	}
	hr {
		border: 0;
		border-top: 1px solid #e8eaed;
		margin: 10px 0;
	}
</style>
