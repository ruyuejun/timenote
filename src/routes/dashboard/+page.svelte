<script lang="ts">
	import Card from '@/components/ui/Card.svelte';
	import Badge from '@/components/ui/Badge.svelte';
	import {
		Users,
		ShoppingCart,
		Wallet,
		TrendingUp,
		ArrowUpRight,
		ArrowDownRight,
		MoreHorizontal
	} from '@lucide/svelte';
	import { cn } from '@/utils/clsx';

	const stats = [
		{
			label: '总营收',
			value: '¥1,284,320',
			delta: '+12.4%',
			up: true,
			icon: Wallet,
			iconBg: 'from-brand-600 to-brand-400'
		},
		{
			label: '活跃用户',
			value: '28,492',
			delta: '+8.1%',
			up: true,
			icon: Users,
			iconBg: 'from-acc-cyan to-acc-blue'
		},
		{
			label: '订单总数',
			value: '9,128',
			delta: '-2.3%',
			up: false,
			icon: ShoppingCart,
			iconBg: 'from-acc-orange to-amber-400'
		},
		{
			label: '转化率',
			value: '4.6%',
			delta: '+0.8%',
			up: true,
			icon: TrendingUp,
			iconBg: 'from-acc-emerald to-teal-400'
		}
	];

	const recentOrders = [
		{ id: '#ORD-7281', user: '林晓雨', amount: '¥1,280', status: '已完成' as const },
		{ id: '#ORD-7280', user: '陈志远', amount: '¥3,420', status: '处理中' as const },
		{ id: '#ORD-7279', user: '王雅婷', amount: '¥860', status: '已完成' as const },
		{ id: '#ORD-7278', user: '刘思成', amount: '¥2,150', status: '已取消' as const },
		{ id: '#ORD-7277', user: '赵梦琪', amount: '¥5,600', status: '已完成' as const }
	];

	const statusTone: Record<string, 'success' | 'warning' | 'danger'> = {
		已完成: 'success',
		处理中: 'warning',
		已取消: 'danger'
	};
</script>

<div class="space-y-5">
	<div>
		<h1 class="text-[20px] font-semibold text-ink-900">数据概览</h1>
		<p class="mt-1 text-[13px] text-ink-500">欢迎回来，这是今天的业务运行状况</p>
	</div>

	<!-- Stat cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each stats as s (s.label)}
			{@const Icon = s.icon}
			<Card flat class="animate-fade-in-up p-5">
				<div class="flex items-center justify-between">
					<span class={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white', s.iconBg)}>
						<Icon class="h-5 w-5" strokeWidth={2} />
					</span>
					<span class={cn('flex items-center gap-0.5 text-[12px] font-medium', s.up ? 'text-emerald-600' : 'text-acc-rose')}>
						{#if s.up}
							<ArrowUpRight class="h-3.5 w-3.5" />
						{:else}
							<ArrowDownRight class="h-3.5 w-3.5" />
						{/if}
						{s.delta}
					</span>
				</div>
				<p class="mt-4 text-[22px] font-semibold text-ink-900">{s.value}</p>
				<p class="mt-0.5 text-[12.5px] text-ink-500">{s.label}</p>
			</Card>
		{/each}
	</div>

	<!-- Charts placeholder -->
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
		<Card flat class="p-5 lg:col-span-2">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-[14.5px] font-semibold text-ink-900">营收与成本趋势</h3>
					<p class="mt-0.5 text-[12px] text-ink-500">近 8 个月数据（单位：万元）</p>
				</div>
				<button class="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100">
					<MoreHorizontal class="h-4 w-4" />
				</button>
			</div>
			<div class="mt-4 flex h-64 items-center justify-center text-ink-400">
				[图表占位 - 可集成 Chart.js 或其他图表库]
			</div>
		</Card>

		<Card flat class="p-5">
			<h3 class="text-[14.5px] font-semibold text-ink-900">流量来源</h3>
			<p class="mt-0.5 text-[12px] text-ink-500">本月渠道占比</p>
			<div class="mt-4 flex h-44 items-center justify-center text-ink-400">
				[饼图占位]
			</div>
		</Card>
	</div>

	<!-- Latest orders -->
	<Card flat class="p-5">
		<div class="flex items-center justify-between">
			<h3 class="text-[14.5px] font-semibold text-ink-900">最新订单</h3>
			<a href="/orders" class="text-[12px] font-medium text-brand-600 hover:text-brand-700">查看全部</a>
		</div>
		<div class="mt-3 overflow-x-auto rounded-xl border border-ink-100">
			<table class="w-full min-w-[420px] text-left text-[13px]">
				<thead class="bg-ink-50/60">
					<tr class="text-[11.5px] text-ink-500 uppercase tracking-wider">
						<th class="px-4 py-3 font-semibold">订单号</th>
						<th class="px-4 py-3 font-semibold">用户</th>
						<th class="px-4 py-3 font-semibold">金额</th>
						<th class="px-4 py-3 text-right font-semibold">状态</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-ink-100 bg-white">
					{#each recentOrders as o (o.id)}
						<tr class="transition-colors hover:bg-ink-50/40">
							<td class="px-4 py-3 font-semibold text-ink-900">{o.id}</td>
							<td class="px-4 py-3 font-medium text-ink-700">{o.user}</td>
							<td class="px-4 py-3 font-medium text-ink-700">{o.amount}</td>
							<td class="px-4 py-3 text-right">
								<Badge tone={statusTone[o.status]}>{o.status}</Badge>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card>
</div>
