<script lang="ts">
	import Modal from '$lib/ui/Modal.svelte'
	import { toast } from '$lib/toast'
	import {
		DOC_AUTH_TYPE_ORG,
		DOC_AUTH_TYPE_USER,
		type DocFolderAuthAssignItem,
	} from '@/api/types'
	import { assignDocFolderAuthApi, fetchDocFolderAuthListApi } from '@/api/doc'
	import { fetchOrgTreeApi } from '@/api/org'
	import { fetchUserPageApi } from '@/api/user'
	import { flattenOrgTree, mapSysUser } from '$lib/mappers'
	import type { DocNode, Employee } from '@/types'
	import type { Department } from '@/types'

	interface Props {
		folder: DocNode | null
		onClose: () => void
	}

	let { folder, onClose }: Props = $props()
	let departments = $state<Department[]>([])
	let employees = $state<Employee[]>([])
	let selected = $state<Array<{ authType: number; authId: number; authRead: boolean; authWrite: boolean; label: string }>>([])
	let loading = $state(false)
	let saving = $state(false)
	const open = $derived(Boolean(folder))

	$effect(() => {
		if (!folder) return
		loading = true
		void Promise.all([
			fetchOrgTreeApi().then(flattenOrgTree),
			fetchUserPageApi({ page: 1, limit: 200 }).then(res => res.list.map(mapSysUser)),
			fetchDocFolderAuthListApi(folder.backendId),
		])
			.then(([depts, users, auths]) => {
				departments = depts
				employees = users
				selected = auths.map(item => ({
					authType: item.authType,
					authId: item.authId,
					authRead: item.authRead === 1,
					authWrite: item.authWrite === 1,
					label:
						item.authType === DOC_AUTH_TYPE_ORG
							? depts.find(d => Number(d.id) === item.authId)?.name || `部门#${item.authId}`
							: users.find(u => Number(u.id) === item.authId)?.name || `用户#${item.authId}`,
				}))
			})
			.catch(error => toast.error(error instanceof Error ? error.message : '加载授权失败'))
			.finally(() => (loading = false))
	})

	function upsert(authType: number, authId: number, label: string) {
		const exists = selected.find(item => item.authType === authType && item.authId === authId)
		if (exists) return
		selected = [...selected, { authType, authId, authRead: true, authWrite: false, label }]
	}

	async function save() {
		if (!folder) return
		saving = true
		try {
			const auths: DocFolderAuthAssignItem[] = selected.map(item => ({
				authType: item.authType,
				authId: item.authId,
				authRead: item.authRead || item.authWrite ? 1 : 0,
				authWrite: item.authWrite ? 1 : 0,
			}))
			await assignDocFolderAuthApi(folder.backendId, auths)
			toast.success('授权已保存')
			onClose()
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '保存失败')
		} finally {
			saving = false
		}
	}
</script>

<Modal {open} title={`分配文件夹权限 · ${folder?.name ?? ''}`} wide onClose={onClose}>
	{#if loading}
		<div class="hint">加载中…</div>
	{:else}
		<div class="grid">
			<div>
				<strong>添加部门</strong>
				{#each departments as dept}
					<button type="button" class="chip" onclick={() => upsert(DOC_AUTH_TYPE_ORG, Number(dept.id), dept.name)}>{dept.name}</button>
				{/each}
			</div>
			<div>
				<strong>添加员工</strong>
				{#each employees as emp}
					<button type="button" class="chip" onclick={() => upsert(DOC_AUTH_TYPE_USER, Number(emp.id), emp.name)}>{emp.name}</button>
				{/each}
			</div>
		</div>
		<table>
			<thead><tr><th>对象</th><th>可读</th><th>可写</th><th></th></tr></thead>
			<tbody>
				{#each selected as item, index}
					<tr>
						<td>{item.label}</td>
						<td><input type="checkbox" bind:checked={selected[index].authRead} /></td>
						<td><input type="checkbox" bind:checked={selected[index].authWrite} /></td>
						<td><button type="button" onclick={() => (selected = selected.filter((_, i) => i !== index))}>移除</button></td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
	{#snippet footer()}
		<button type="button" class="btn" onclick={onClose}>取消</button>
		<button type="button" class="btn primary" disabled={saving || loading} onclick={() => void save()}>保存</button>
	{/snippet}
</Modal>

<style>
	.hint { text-align: center; color: #888; padding: 24px; }
	.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
	.chip { margin: 4px; padding: 4px 8px; border: 1px solid #d0d3d6; border-radius: 999px; background: #fff; cursor: pointer; }
	table { width: 100%; border-collapse: collapse; font-size: 13px; }
	th, td { border-bottom: 1px solid #e8eaed; padding: 8px; text-align: left; }
	.btn { height: 32px; padding: 0 14px; border: 1px solid #d0d3d6; border-radius: 6px; background: #fff; cursor: pointer; }
	.btn.primary { border-color: #3370ff; background: #3370ff; color: #fff; }
</style>
