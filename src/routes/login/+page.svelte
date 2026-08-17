<script lang="ts">
	import { goto } from '$app/navigation';
	import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from '@lucide/svelte';
	import Button from '@/components/ui/Button.svelte';

	let showPassword = $state(false);
	let loading = $state(false);

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		setTimeout(() => goto('/dashboard'), 500);
	}
</script>

<div class="relative flex min-h-screen items-center justify-center px-4 py-10 bg-[#f4f6fb]">
	<div class="app-bg"></div>

	<div class="grid w-full max-w-4xl overflow-hidden rounded-[28px] shadow-glass-lg lg:grid-cols-2">
		<!-- Left showcase panel -->
		<div class="glass-sidebar relative hidden flex-col justify-between p-10 lg:flex">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 shadow-float">
					<Sparkles class="h-5 w-5 text-white" strokeWidth={2.2} />
				</div>
				<div class="leading-tight">
					<p class="text-[15px] font-semibold text-white">Nova Console</p>
					<p class="text-[11px] text-white/45">企业管理后台</p>
				</div>
			</div>

			<div>
				<h2 class="text-[26px] font-semibold leading-snug text-white">
					沉浸式驾舱设计语言<br />为企业管理系统而来
				</h2>
				<p class="mt-3 max-w-sm text-[13px] leading-relaxed text-white/50">
					清爽白底、彩色图标背景、精准的信息层级——让复杂的后台管理拥有一流的驾驶感。
				</p>
			</div>

			<div class="flex gap-6">
				{#each [['12.8k', '活跃用户'], ['99.9%', '系统可用性'], ['24/7', '实时监控']] as [v, l]}
					<div>
						<p class="text-[22px] font-semibold text-white">{v}</p>
						<p class="text-[11px] text-white/40">{l}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Right login form -->
		<div class="glass-strong flex flex-col justify-center p-8 sm:p-12">
			<div class="mb-8 flex items-center gap-3 lg:hidden">
				<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 shadow-float">
					<Sparkles class="h-5 w-5 text-white" strokeWidth={2.2} />
				</div>
				<p class="text-[15px] font-semibold text-ink-900">Nova Console</p>
			</div>

			<h1 class="text-[22px] font-semibold text-ink-900">欢迎回来</h1>
			<p class="mt-1.5 text-[13px] text-ink-500">登录以继续访问企业管理后台</p>

			<form class="mt-7 space-y-4" onsubmit={handleSubmit}>
				<div>
					<label class="mb-1.5 block text-[12.5px] font-medium text-ink-700">邮箱账号</label>
					<div class="glass flex items-center gap-2.5 rounded-xl px-3.5 py-2.5">
						<Mail class="h-4 w-4 shrink-0 text-ink-300" />
						<input
							type="email"
							required
							value="admin@nova-console.com"
							class="w-full bg-transparent text-[13.5px] text-ink-900 outline-none placeholder:text-ink-300"
						/>
					</div>
				</div>

				<div>
					<label class="mb-1.5 block text-[12.5px] font-medium text-ink-700">登录密码</label>
					<div class="glass flex items-center gap-2.5 rounded-xl px-3.5 py-2.5">
						<Lock class="h-4 w-4 shrink-0 text-ink-300" />
						<input
							type={showPassword ? 'text' : 'password'}
							required
							value="••••••••"
							class="w-full bg-transparent text-[13.5px] text-ink-900 outline-none"
						/>
						<button
							type="button"
							onclick={() => (showPassword = !showPassword)}
							class="shrink-0 text-ink-300 hover:text-ink-500"
						>
							{#if showPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</button>
					</div>
				</div>

				<div class="flex items-center justify-between text-[12.5px]">
					<label class="flex items-center gap-2 text-ink-500">
						<input type="checkbox" checked class="h-3.5 w-3.5 rounded accent-brand-500" />
						记住我
					</label>
					<a href="#" class="font-medium text-brand-600 hover:text-brand-700">忘记密码？</a>
				</div>

				<Button type="submit" disabled={loading} class="w-full">
					{#snippet children()}
						{loading ? '登录中...' : '登 录'}
						{#if !loading}
							<ArrowRight class="h-4 w-4" />
						{/if}
					{/snippet}
				</Button>
			</form>

			<p class="mt-7 text-center text-[12px] text-ink-300">演示环境 · 直接点击登录即可进入系统</p>
		</div>
	</div>
</div>
