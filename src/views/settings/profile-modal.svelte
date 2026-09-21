<script lang="ts">
	import Modal from '$lib/ui/Modal.svelte'
	import { toast } from '$lib/toast'
	import { currentUser, updateProfile } from '@/stores/session'

	interface Props {
		open: boolean
		onClose: () => void
	}

	let { open, onClose }: Props = $props()
	let name = $state('')
	let preview = $state('')
	let avatarFile = $state<File | null>(null)
	let saving = $state(false)
	let fileInput = $state<HTMLInputElement | null>(null)

	$effect(() => {
		if (!open) return
		const user = $currentUser
		name = user?.name ?? ''
		preview = user?.avatar ?? ''
		avatarFile = null
	})

	function onPickFile(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0]
		;(event.target as HTMLInputElement).value = ''
		if (!file) return
		avatarFile = file
		const reader = new FileReader()
		reader.onload = () => {
			preview = String(reader.result)
		}
		reader.readAsDataURL(file)
	}

	async function save() {
		const trimmed = name.trim()
		if (!trimmed) {
			toast.error('请输入姓名')
			return
		}
		saving = true
		try {
			await updateProfile({ name: trimmed, avatarFile })
			toast.success('资料已更新')
			onClose()
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '保存失败')
		} finally {
			saving = false
		}
	}
</script>

<Modal {open} title="个人资料" onClose={onClose}>
	<div class="avatar-uploader">
		{#if preview}
			<img class="avatar" src={preview} alt="" />
		{:else}
			<span class="avatar fallback">{name.slice(0, 1) || '用'}</span>
		{/if}
		<input bind:this={fileInput} type="file" accept="image/*" hidden onchange={onPickFile} />
		<button type="button" class="link" onclick={() => fileInput?.click()}>上传头像</button>
	</div>
	<label class="field">
		<span>姓名</span>
		<input bind:value={name} placeholder="请输入姓名" />
	</label>
	{#snippet footer()}
		<button type="button" class="btn" onclick={onClose}>取消</button>
		<button type="button" class="btn primary" disabled={saving} onclick={() => void save()}>
			{saving ? '保存中…' : '保存'}
		</button>
	{/snippet}
</Modal>

<style>
	.avatar-uploader {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
	}
	.avatar {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		object-fit: cover;
	}
	.fallback {
		display: grid;
		place-items: center;
		background: #3370ff;
		color: #fff;
		font-size: 24px;
	}
	.link {
		border: 0;
		background: transparent;
		color: #3370ff;
		cursor: pointer;
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
