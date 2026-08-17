<script lang="ts">
	import Card from '@/components/ui/Card.svelte';
	import type { ComponentType } from 'svelte';

	interface Props {
		title: string;
		icon: ComponentType;
	}

	let { title, icon: Icon }: Props = $props();
</script>

<div class="space-y-5">
	<div>
		<h1 class="text-[20px] font-semibold text-ink-900">{title}</h1>
		<p class="mt-1 text-[13px] text-ink-500">此页面正在开发中</p>
	</div>

	<Card flat class="p-12">
		<div class="flex flex-col items-center justify-center text-center">
			<div
				class="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 text-white shadow-float"
			>
				<Icon class="h-10 w-10" strokeWidth={1.8} />
			</div>
			<h3 class="mt-6 text-[18px] font-semibold text-ink-900">{title}</h3>
			<p class="mt-2 max-w-md text-[13.5px] text-ink-500">
				该功能模块正在规划和开发中，敬请期待。
			</p>
			<div class="mt-8 flex gap-3">
				<a
					href="/dashboard"
					class="rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 px-4 py-2.5 text-[13px] font-medium text-white shadow-float transition-all hover:brightness-105"
				>
					返回概览
				</a>
				<a
					href="/settings"
					class="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-[13px] font-medium text-ink-700 transition-colors hover:bg-ink-50"
				>
					系统设置
				</a>
			</div>
		</div>
	</Card>
</div>
