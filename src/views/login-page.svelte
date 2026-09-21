<script lang="ts">
	import { login } from '@/stores/session'
	import { toast } from '$lib/toast'

	let username = $state('')
	let password = $state('')
	let submitting = $state(false)

	async function handleSubmit(event: Event) {
		event.preventDefault()
		if (!username.trim() || !password) {
			toast.error('请输入用户名和密码')
			return
		}
		submitting = true
		try {
			await login({ username: username.trim(), password })
			toast.success('登录成功')
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '登录失败')
		} finally {
			submitting = false
		}
	}
</script>

<div class="login-page">
	<div class="login-card">
		<div class="login-card-head">登录文档系统</div>
		<form class="login-card-body" onsubmit={handleSubmit}>
			<label class="field">
				<span>用户名</span>
				<input
					bind:value={username}
					placeholder="请输入用户名"
					autocomplete="username"
					disabled={submitting}
				/>
			</label>
			<label class="field">
				<span>密码</span>
				<input
					type="password"
					bind:value={password}
					placeholder="请输入密码"
					autocomplete="current-password"
					disabled={submitting}
				/>
			</label>
			<button type="submit" class="login-submit" disabled={submitting}>
				{submitting ? '登录中…' : '登录'}
			</button>
		</form>
	</div>
</div>

<style>
	.login-card {
		position: relative;
		width: 420px;
		background: #fff;
		border-radius: 8px;
		border: 1px solid rgba(148, 163, 184, 0.12);
		box-shadow:
			0 1px 2px 0 rgba(0, 0, 0, 0.05),
			0 4px 12px 0 rgba(0, 0, 0, 0.08);
	}
	.login-card-head {
		border-bottom: 1px solid rgba(148, 163, 184, 0.12);
		font-size: 20px;
		font-weight: 600;
		text-align: center;
		padding: 24px;
	}
	.login-card-body {
		padding: 32px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 14px;
		color: #1f2329;
	}
	.field input {
		height: 40px;
		padding: 0 12px;
		border: 1px solid #d0d3d6;
		border-radius: 6px;
		font-size: 14px;
	}
	.field input:focus {
		outline: none;
		border-color: #3370ff;
		box-shadow: 0 0 0 2px rgb(51 112 255 / 0.15);
	}
	.login-submit {
		margin-top: 8px;
		height: 40px;
		border: 0;
		border-radius: 6px;
		background: #3370ff;
		color: #fff;
		font-size: 15px;
		font-weight: 500;
		cursor: pointer;
	}
	.login-submit:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
