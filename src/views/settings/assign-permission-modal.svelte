<script lang="ts">
	import Modal from '$lib/ui/Modal.svelte'
	import { toast } from '$lib/toast'
	import { loadAllDocFolders } from '@/stores/docs'
	import { assignUserFolderAuths, loadUserFolderAuths } from '@/stores/auth'
	import type { Employee, FolderAuthDraft } from '@/types'
	import type { DocNode } from '@/types'

	interface Props {
		employee: Employee | null
		onClose: () => void
	}

	let { employee, onClose }: Props = $props()
	let folders = $state<DocNode[]>([])
	let auths = $state<FolderAuthDraft[]>([])
	let loading = $state(false)
	let saving = $state(false)
	const open = $derived(Boolean(employee))

	$effect(() => {
		if (!employee) return
		loading = true
		void Promise.all([loadAllDocFolders(), loadUserFolderAuths(employee.id)])
			.then(([folderList, authList]) => {
				folders = folderList
				const map = new Map(authList.map(item => [item.folderId, item]))
				auths = folderList.map(folder => ({
					folderId: folder.backendId,
					folderName: folder.name,
					authRead: map.get(folder.backendId)?.authRead ?? false,
					authWrite: map.get(folder.backendId)?.authWrite ?? false,
				}))
			})
			.catch(error => toast.error(error instanceof Error ? error.message : '加载权限失败'))
			.finally(() => (loading = false))
	})

	function toggle(folderId: number, key: 'authRead' | 'authWrite') {
		auths = auths.map(item => {
			if (item.folderId !== folderId) return item
			const next = { ...item, [key]: !item[key] }
			if (key === 'authWrite' && next.authWrite) next.authRead = true
			if (key === 'authRead' && !next.authRead) next.authWrite = false
			return next
		})
	}

	async function save() {
		if (!employee) return
		saving = true
		try {
			await assignUserFolderAuths({
				userId: employee.id,
				folderAuths: auths.filter(item => item.authRead || item.authWrite),
			})
			toast.success('权限已保存')
			onClose()
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '保存失败')
		} finally {
			saving = false
		}
	}
</script>

<Modal {open} title={`分配权限 · ${employee?.name ?? ''}`} wide onClose={onClose}>
	{#if loading}
		<div class="hint">加载中…</div>
	{:else if folders.length === 0}
		<div class="hint">暂无文件夹</div>
	{:else}
		<table>
			<thead>
				<tr><th>文件夹</th><th>可读</th><th>可写</th></tr>
			</thead>
			<tbody>
				{#each auths as item (item.folderId)}
					<tr>
						<td>{item.folderName}</td>
						<td><input type="checkbox" checked={item.authRead} onchange={() => toggle(item.folderId, 'authRead')} /></td>
						<td><input type="checkbox" checked={item.authWrite} onchange={() => toggle(item.folderId, 'authWrite')} /></td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
	{#snippet footer()}
		<button type="button" class="btn" onclick={onClose}>取消</button>
		<button type="button" class="btn primary" disabled={saving || loading} onclick={() => void save()}>
			{saving ? '保存中…' : '保存'}
		</button>
	{/snippet}
</Modal>

<style>
	.hint { text-align: center; color: #888; padding: 24px; }
	table { width: 100%; border-collapse: collapse; font-size: 13px; }
	th, td { border-bottom: 1px solid #e8eaed; padding: 8px; text-align: left; }
	.btn { height: 32px; padding: 0 14px; border: 1px solid #d0d3d6; border-radius: 6px; background: #fff; cursor: pointer; }
	.btn.primary { border-color: #3370ff; background: #3370ff; color: #fff; }
</style>
