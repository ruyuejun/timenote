<script lang="ts">
	import Modal from '$lib/ui/Modal.svelte'
	import { toast } from '$lib/toast'
	import { changePassword } from '@/stores/session'

	interface Props {
		open: boolean
		onClose: () => void
	}

	let { open, onClose }: Props = $props()
	let oldPassword = $state('')
	let newPassword = $state('')
	let confirm = $state('')
	let saving = $state(false)

	$effect(() => {
		if (!open) {
			oldPassword = ''
			newPassword = ''
			confirm = ''
		}
	})

	async function save() {
		if (!oldPassword || !newPassword) {
			toast.error('请填写完整')
			return
		}
		if (newPassword.length < 6) {
			toast.error('新密码至少 6 位')
			return
		}
		if (newPassword !== confirm) {
			toast.error('两次输入的密码不一致')
			return
		}
		saving = true
		try {
			await changePassword({
				oldPassword,
				newPassword,
				confirmNewPassword: confirm,
			})
			toast.success('密码已修改')
			onClose()
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '修改失败')
		} finally {
			saving = false
		}
	}
</script>

<Modal {open} title="修改密码" onClose={onClose}>
	<label class="field">
		<span>旧密码</span>
		<input type="password" bind:value={oldPassword} autocomplete="current-password" />
	</label>
	<label class="field">
		<span>新密码</span>
		<input type="password" bind:value={newPassword} autocomplete="new-password" />
	</label>
	<label class="field">
		<span>确认新密码</span>
		<input type="password" bind:value={confirm} autocomplete="new-password" />
	</label>
	{#snippet footer()}
		<button type="button" class="btn" onclick={onClose}>取消</button>
		<button type="button" class="btn primary" disabled={saving} onclick={() => void save()}>
			{saving ? '提交中…' : '确认修改'}
		</button>
	{/snippet}
</Modal>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 12px;
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
