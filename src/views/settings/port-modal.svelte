<script lang="ts">
	import Modal from '$lib/ui/Modal.svelte'
	import { toast } from '$lib/toast'
	import { currentUser } from '@/stores/session'
	import { fetchServerPortApi, updateServerPortApi } from '@/api/system'

	interface Props {
		open: boolean
		onClose: () => void
	}

	let { open, onClose }: Props = $props()
	let currentPort = $state(3000)
	let port = $state(3000)
	let loading = $state(false)
	let saving = $state(false)
	const isAdmin = $derived($currentUser?.role === 'admin')

	async function load() {
		loading = true
		try {
			const data = await fetchServerPortApi()
			currentPort = data?.port ?? 3000
			port = currentPort
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '加载端口配置失败')
		} finally {
			loading = false
		}
	}

	$effect(() => {
		if (open) void load()
	})

	async function save() {
		if (!isAdmin) {
			toast.error('仅管理员可配置端口')
			return
		}
		if (!Number.isInteger(port) || port < 1024 || port > 65535) {
			toast.error('端口号必须在 1024-65535 范围内的整数')
			return
		}
		saving = true
		try {
			await updateServerPortApi(port)
			toast.success('端口已保存，重启服务后生效')
			await load()
			onClose()
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '保存失败')
		} finally {
			saving = false
		}
	}
</script>

<Modal {open} title="配置服务器端口" onClose={onClose}>
	<div class="port-card">
		<div class="label">当前端口</div>
		<div class="value">{currentPort}</div>
	</div>
	<p class="hint">修改端口后需要重启服务器才能生效</p>
	<label class="field">
		<span>新端口号</span>
		<input type="number" min="1024" max="65535" bind:value={port} disabled={!isAdmin || loading} />
	</label>
	{#snippet footer()}
		<button type="button" class="btn" onclick={onClose}>取消</button>
		<button type="button" class="btn primary" disabled={!isAdmin || saving} onclick={() => void save()}>
			{saving ? '保存中…' : '保存'}
		</button>
	{/snippet}
</Modal>

<style>
	.port-card {
		padding: 12px 16px;
		background: #f5f5f5;
		border-radius: 8px;
		margin-bottom: 12px;
	}
	.label {
		font-weight: 500;
	}
	.value {
		font-size: 24px;
		font-weight: 600;
		margin-top: 8px;
		color: #1677ff;
	}
	.hint {
		color: #888;
		font-size: 13px;
		margin: 0 0 16px;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.field input {
		height: 36px;
		padding: 0 10px;
		border: 1px solid #d0d3d6;
		border-radius: 6px;
	}
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
