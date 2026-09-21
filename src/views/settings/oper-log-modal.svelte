<script lang="ts">
	import Modal from '$lib/ui/Modal.svelte'
	import { toast } from '$lib/toast'
	import { fetchOperLogPageApi } from '@/api/system'
	import type { SysOperLog } from '@/api/types'

	interface Props {
		open: boolean
		onClose: () => void
	}

	let { open, onClose }: Props = $props()
	let list = $state<SysOperLog[]>([])
	let total = $state(0)
	let page = $state(1)
	let loading = $state(false)
	const pageSize = 20
	const pageCount = $derived(Math.max(1, Math.ceil(total / pageSize)))

	async function load() {
		loading = true
		try {
			const result = await fetchOperLogPageApi({ page, limit: pageSize })
			list = result.list
			total = result.total
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '加载日志失败')
		} finally {
			loading = false
		}
	}

	$effect(() => {
		if (!open) return
		page
		void load()
	})
</script>

<Modal {open} title="操作日志" wide onClose={onClose}>
	{#if loading}
		<div class="hint">加载中…</div>
	{:else}
		<table class="log-table">
			<thead>
				<tr>
					<th>时间</th>
					<th>账号</th>
					<th>模块</th>
					<th>说明</th>
					<th>路径</th>
					<th>状态</th>
					<th>耗时</th>
				</tr>
			</thead>
			<tbody>
				{#each list as row (row.id)}
					<tr>
						<td>{row.createTime ?? '—'}</td>
						<td>{row.userName ?? '—'}</td>
						<td>{row.module ?? '—'}</td>
						<td>{row.title ?? '—'}</td>
						<td>{row.path ?? '—'}</td>
						<td>
							<span class:ok={row.status === 0} class:fail={row.status !== 0}>
								{row.status === 0 ? '成功' : '失败'}
							</span>
						</td>
						<td>{row.duration != null ? `${row.duration}ms` : '—'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<div class="pager">
			<button type="button" disabled={page <= 1} onclick={() => (page -= 1)}>上一页</button>
			<span>{page} / {pageCount}</span>
			<button type="button" disabled={page >= pageCount} onclick={() => (page += 1)}>下一页</button>
		</div>
	{/if}
</Modal>

<style>
	.hint {
		padding: 24px;
		text-align: center;
		color: #888;
	}
	.log-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
	}
	th,
	td {
		border-bottom: 1px solid #e8eaed;
		padding: 8px 6px;
		text-align: left;
		max-width: 180px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.ok {
		color: #17b26a;
	}
	.fail {
		color: #f04438;
	}
	.pager {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 12px;
		margin-top: 12px;
	}
	.pager button {
		height: 28px;
		padding: 0 10px;
		border: 1px solid #d0d3d6;
		border-radius: 6px;
		background: #fff;
		cursor: pointer;
	}
	.pager button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
