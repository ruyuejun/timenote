<script lang="ts">
	import {
		History,
		KeyRound,
		LogOut,
		Network,
		Settings,
		User,
		Users,
	} from '@lucide/svelte'
	import { logout } from '@/stores/auth'
	import { selectedDoc } from '@/stores/docs'
	import { currentUser } from '@/stores/session'
	import EmployeeModal from './settings/employee-modal.svelte'
	import OperLogModal from './settings/oper-log-modal.svelte'
	import PasswordModal from './settings/password-modal.svelte'
	import PortModal from './settings/port-modal.svelte'
	import ProfileModal from './settings/profile-modal.svelte'

	let profileOpen = $state(false)
	let passwordOpen = $state(false)
	let employeeOpen = $state(false)
	let portOpen = $state(false)
	let logOpen = $state(false)
	let menuOpen = $state(false)

	const doc = $derived($selectedDoc)
	const user = $derived($currentUser)
</script>

<header class="app-header">
	<div class="header-title">
		<span>{doc?.type === 'doc' ? doc.name : '请选择一篇文档'}</span>
	</div>
	<div class="header-user">
		<div class="user-chip">
			{#if user?.avatar}
				<img class="avatar" src={user.avatar} alt="" />
			{:else}
				<span class="avatar avatar-fallback">{user?.name?.slice(0, 1) ?? '用'}</span>
			{/if}
			<span>{user?.name}</span>
		</div>
		<div class="settings-wrap">
			<button type="button" class="settings-btn" onclick={() => (menuOpen = !menuOpen)}>
				<Settings size={16} />
				设置
			</button>
			{#if menuOpen}
				<button type="button" class="menu-mask" aria-label="关闭菜单" onclick={() => (menuOpen = false)}></button>
				<div class="settings-menu" role="menu">
					<button type="button" role="menuitem" onclick={() => { menuOpen = false; profileOpen = true }}>
						<User size={14} /> 个人资料
					</button>
					<button type="button" role="menuitem" onclick={() => { menuOpen = false; passwordOpen = true }}>
						<KeyRound size={14} /> 修改密码
					</button>
					{#if user?.role === 'admin'}
						<button type="button" role="menuitem" onclick={() => { menuOpen = false; employeeOpen = true }}>
							<Users size={14} /> 员工管理
						</button>
						<button type="button" role="menuitem" onclick={() => { menuOpen = false; logOpen = true }}>
							<History size={14} /> 操作日志
						</button>
						<button type="button" role="menuitem" onclick={() => { menuOpen = false; portOpen = true }}>
							<Network size={14} /> 配置端口
						</button>
					{/if}
					<hr />
					<button type="button" role="menuitem" onclick={() => { menuOpen = false; logout() }}>
						<LogOut size={14} /> 退出登录
					</button>
				</div>
			{/if}
		</div>
	</div>
</header>

<ProfileModal open={profileOpen} onClose={() => (profileOpen = false)} />
<PasswordModal open={passwordOpen} onClose={() => (passwordOpen = false)} />
<EmployeeModal open={employeeOpen && user?.role === 'admin'} onClose={() => (employeeOpen = false)} />
<PortModal open={portOpen} onClose={() => (portOpen = false)} />
<OperLogModal open={logOpen && user?.role === 'admin'} onClose={() => (logOpen = false)} />

<style>
	.header-user {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.user-chip {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--text);
	}
	.avatar {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		object-fit: cover;
	}
	.avatar-fallback {
		display: grid;
		place-items: center;
		background: #3370ff;
		color: #fff;
		font-size: 12px;
	}
	.settings-wrap {
		position: relative;
	}
	.settings-btn {
		border: 0;
		background: transparent;
		padding: 6px 10px;
		border-radius: 6px;
		cursor: pointer;
		color: var(--text);
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.settings-btn:hover {
		background: #f0f1f2;
	}
	.menu-mask {
		position: fixed;
		inset: 0;
		border: 0;
		background: transparent;
		z-index: 20;
	}
	.settings-menu {
		position: absolute;
		right: 0;
		top: calc(100% + 4px);
		z-index: 21;
		min-width: 160px;
		padding: 6px;
		background: #fff;
		border: 1px solid #e8eaed;
		border-radius: 8px;
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
		display: flex;
		flex-direction: column;
	}
	.settings-menu button {
		border: 0;
		background: transparent;
		text-align: left;
		padding: 8px 10px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 13px;
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.settings-menu button:hover {
		background: #f5f6f7;
	}
	.settings-menu hr {
		border: 0;
		border-top: 1px solid #e8eaed;
		margin: 4px 0;
	}
</style>
