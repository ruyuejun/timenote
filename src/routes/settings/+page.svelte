<script lang="ts">
	import Card from '@/components/ui/Card.svelte';
	import Button from '@/components/ui/Button.svelte';
	import { User, Shield, Bell, Palette, Check } from '@lucide/svelte';
	import { theme, type Theme } from '@/stores/theme';
	import { cn } from '@/utils/clsx';

	type TabKey = 'profile' | 'security' | 'notifications' | 'appearance';

	const tabs: { key: TabKey; label: string; icon: any }[] = [
		{ key: 'profile', label: '个人资料', icon: User },
		{ key: 'security', label: '账号安全', icon: Shield },
		{ key: 'notifications', label: '消息通知', icon: Bell },
		{ key: 'appearance', label: '外观主题', icon: Palette }
	];

	const themeOptions = [
		{
			key: 'light' as Theme,
			label: '浅蓝专业',
			swatch: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #e0e7ff 100%)'
		},
		{
			key: 'pink' as Theme,
			label: '粉色柔和',
			swatch: 'linear-gradient(135deg, #be185d 0%, #ec4899 50%, #fce7f3 100%)'
		}
	];

	const inputCls =
		'w-full rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-[13.5px] text-ink-900 outline-none focus:border-brand-400 focus:bg-white transition-colors';

	let tab = $state<TabKey>('profile');
	let toggles = $state({
		email: true,
		push: true,
		weekly: false,
		twofa: true
	});
</script>

<div class="space-y-5">
	<div>
		<h1 class="text-[20px] font-semibold text-ink-900">系统设置</h1>
		<p class="mt-1 text-[13px] text-ink-500">管理账号资料、安全策略与系统偏好</p>
	</div>

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
		<!-- Tab list -->
		<Card flat class="h-fit p-2 lg:col-span-1">
			<nav class="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
				{#each tabs as t (t.key)}
					{@const Icon = t.icon}
					{@const active = tab === t.key}
					<button
						onclick={() => (tab = t.key)}
						class={cn(
							'flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors',
							active
								? 'bg-brand-50 text-brand-700'
								: 'text-ink-500 hover:bg-ink-100 hover:text-ink-800'
						)}
					>
						<Icon class={cn('h-4 w-4', active ? 'text-brand-500' : 'text-ink-400')} />
						{t.label}
					</button>
				{/each}
			</nav>
		</Card>

		<!-- Content pane -->
		<Card flat class="p-6 lg:col-span-3">
			{#if tab === 'profile'}
				<div class="animate-fade-in-up space-y-5">
					<h3 class="text-[15px] font-semibold text-ink-900">个人资料</h3>
					<div class="flex items-center gap-4">
						<span
							class="flex h-16 w-16 items-center justify-center rounded-full text-[22px] font-bold text-white"
							style="background: linear-gradient(135deg, var(--t-brand-600), var(--t-brand-400))"
						>
							苏
						</span>
						<div>
							<Button variant="secondary" size="sm">
								{#snippet children()}
									更换头像
								{/snippet}
							</Button>
							<p class="mt-1.5 text-[11.5px] text-ink-400">支持 JPG、PNG，最大 2MB</p>
						</div>
					</div>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{#each [{ label: '姓名', v: '苏晴', id: 'name' }, { label: '职位', v: '系统管理员', id: 'position' }, { label: '邮箱', v: 'admin@nova-console.com', id: 'email' }, { label: '手机号', v: '138****8899', id: 'phone' }] as f}
							<div>
								<label for={f.id} class="mb-1.5 block text-[12.5px] font-medium text-ink-700">
									{f.label}
								</label>
								<input id={f.id} value={f.v} class={inputCls} />
							</div>
						{/each}
					</div>
					<div>
						<label for="bio" class="mb-1.5 block text-[12.5px] font-medium text-ink-700">个人简介</label>
						<textarea
							id="bio"
							rows={3}
							value="专注于企业级管理系统的产品设计与体验优化。"
							class={inputCls + ' resize-none'}
						></textarea>
					</div>
					<div class="flex justify-end">
						<Button>
							{#snippet children()}
								保存修改
							{/snippet}
						</Button>
					</div>
				</div>
			{:else if tab === 'security'}
				<div class="animate-fade-in-up space-y-5">
					<h3 class="text-[15px] font-semibold text-ink-900">账号安全</h3>
					<div class="space-y-3">
						<div>
							<label for="current-password" class="mb-1.5 block text-[12.5px] font-medium text-ink-700">当前密码</label>
							<input id="current-password" type="password" value="••••••••" class={inputCls} />
						</div>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label for="new-password" class="mb-1.5 block text-[12.5px] font-medium text-ink-700">新密码</label>
								<input id="new-password" type="password" placeholder="至少 8 位字符" class={inputCls} />
							</div>
							<div>
								<label for="confirm-password" class="mb-1.5 block text-[12.5px] font-medium text-ink-700">确认新密码</label>
								<input id="confirm-password" type="password" placeholder="再次输入新密码" class={inputCls} />
							</div>
						</div>
					</div>
					<div class="flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50 p-4">
						<div>
							<p class="text-[13px] font-medium text-ink-900">双重身份验证</p>
							<p class="mt-0.5 text-[12px] text-ink-500">使用验证器应用为账号增加一层保护</p>
						</div>
						<button
							type="button"
							role="switch"
							aria-checked={toggles.twofa}
							aria-label="切换双重身份验证"
							onclick={() => (toggles.twofa = !toggles.twofa)}
							class={cn(
								'relative h-6 w-11 shrink-0 rounded-full transition-colors',
								toggles.twofa ? 'bg-brand-500' : 'bg-ink-200'
							)}
						>
							<span
								class={cn(
									'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
									toggles.twofa && 'translate-x-5'
								)}
							></span>
						</button>
					</div>
					<div class="flex justify-end">
						<Button>
							{#snippet children()}
								更新密码
							{/snippet}
						</Button>
					</div>
				</div>
			{:else if tab === 'notifications'}
				<div class="animate-fade-in-up space-y-3">
					<h3 class="mb-2 text-[15px] font-semibold text-ink-900">消息通知</h3>
					{#each [{ key: 'email' as const, title: '邮件通知', desc: '接收关于账户活动的邮件提醒' }, { key: 'push' as const, title: '推送通知', desc: '在设备上接收实时推送消息' }, { key: 'weekly' as const, title: '每周简报', desc: '每周一发送数据摘要与运营简报' }] as item}
						<div class="flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50 p-4">
							<div>
								<p class="text-[13px] font-medium text-ink-900">{item.title}</p>
								<p class="mt-0.5 text-[12px] text-ink-500">{item.desc}</p>
							</div>
							<button
								type="button"
								role="switch"
								aria-checked={toggles[item.key]}
								aria-label={'切换' + item.title}
								onclick={() => (toggles[item.key] = !toggles[item.key])}
								class={cn(
									'relative h-6 w-11 shrink-0 rounded-full transition-colors',
									toggles[item.key] ? 'bg-brand-500' : 'bg-ink-200'
								)}
							>
								<span
									class={cn(
										'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
										toggles[item.key] && 'translate-x-5'
									)}
								></span>
							</button>
						</div>
					{/each}
				</div>
			{:else if tab === 'appearance'}
				<div class="animate-fade-in-up space-y-5">
					<h3 class="text-[15px] font-semibold text-ink-900">外观主题</h3>
					<p class="text-[12.5px] text-ink-500">选择系统界面的主色调皮肤</p>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{#each themeOptions as opt}
							{@const active = $theme === opt.key}
							<button
								onclick={() => theme.set(opt.key)}
								class={cn(
									'rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5',
									active ? 'border-brand-400 bg-brand-50' : 'border-ink-200 bg-white hover:border-ink-300'
								)}
							>
								<div class="h-20 w-full rounded-xl" style="background: {opt.swatch}"></div>
								<div class="mt-2.5 flex items-center justify-between">
									<span class="text-[12.5px] font-medium text-ink-800">{opt.label}</span>
									{#if active}
										<span
											class="flex h-5 w-5 items-center justify-center rounded-full text-white"
											style="background: var(--t-brand-500)"
										>
											<Check class="h-3 w-3" />
										</span>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</Card>
	</div>
</div>
