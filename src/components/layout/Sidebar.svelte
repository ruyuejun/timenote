<script lang="ts">
    import { page } from '$app/stores'
    import { Sparkles, MoreHorizontal, Check, Star } from '@lucide/svelte'
    import { navGroups, findActiveL2 } from '@/config/nav'
    import { cn } from '@/utils/clsx'

    interface Props {
        mobileOpen: boolean
        collapsed: boolean
        onNavigate?: () => void
    }

    let { mobileOpen, collapsed, onNavigate }: Props = $props()

    const ALL_COMPANIES = [
        { id: 'nova', name: '诺华科技' },
        { id: 'vertex', name: '顶点互联' },
        { id: 'fusion', name: '聚力数字' },
        { id: 'aether', name: '以太云智' },
        { id: 'prisma', name: '棱镜数据' },
        { id: 'zenith', name: '天顶系统' },
    ]

    let activeCompany = $state('nova')
    let defaultCompany = $state<string | null>(null)
    let companyPickerOpen = $state(false)
    let moreCompaniesOpen = $state(false)

    const activeL2 = $derived(findActiveL2($page.url.pathname))
    const activeCompanyObj = $derived(ALL_COMPANIES.find(c => c.id === activeCompany)!)

    const orderedCompanies = $derived.by(() => {
        if (!defaultCompany || defaultCompany === activeCompany) return ALL_COMPANIES
        const rest = ALL_COMPANIES.filter(c => c.id !== defaultCompany)
        return [ALL_COMPANIES.find(c => c.id === defaultCompany)!, ...rest]
    })

    const visibleCompanies = $derived(orderedCompanies.slice(0, 4))
    const hiddenCompanies = $derived(orderedCompanies.slice(4))
</script>

<aside
    class={cn(
        'glass-sidebar sidebar-transition relative z-40 flex shrink-0 flex-col',
        'fixed inset-y-0 left-0 lg:sticky lg:top-0 lg:h-screen',
        collapsed ? 'w-14' : 'w-[220px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    )}>
    <!-- Logo -->
    <div class="relative flex h-[52px] shrink-0 items-center gap-3 px-4">
        <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-400">
            <Sparkles class="h-4 w-4 text-white" strokeWidth={2.2} />
        </div>
        {#if !collapsed}
            <div class="flex min-w-0 flex-col leading-tight">
                <span class="truncate text-[13.5px] font-semibold text-ink-900">Nova Console</span>
                <span class="text-[10px] text-ink-600">XX 文档</span>
            </div>
        {/if}
    </div>

    <!-- Nav groups -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden py-4">
        {#each navGroups as group (group.groupKey)}
            <div class="mb-5 px-3">
                {#if !collapsed}
                    <p class={cn('mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest', group.labelColor)}>
                        {group.groupLabel}
                    </p>
                {/if}

                <div class="space-y-0.5">
                    {#each group.items as item (item.key)}
                        {@const Icon = item.icon}
                        {@const targetPath = item.children ? item.children[0].path : (item.path ?? `/${item.key}`)}
                        {@const isActiveL2 = activeL2?.key === item.key}

                        {#if collapsed}
                            <a
                                href={targetPath}
                                onclick={onNavigate}
                                title={item.label}
                                class={cn(
                                    'group relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150',
                                    isActiveL2
                                        ? 'bg-white/50 text-brand-600'
                                        : 'text-ink-600 hover:bg-white/30 hover:text-ink-900'
                                )}>
                                {#if isActiveL2}
                                    <span class="nav-item-active-bar"></span>
                                {/if}
                                <Icon
                                    class={cn(
                                        'h-[18px] w-[18px]',
                                        isActiveL2 ? 'text-brand-500' : 'text-ink-500 group-hover:text-ink-700'
                                    )}
                                    strokeWidth={1.6} />
                                <span
                                    class="pointer-events-none absolute left-12 z-50 hidden whitespace-nowrap rounded-lg bg-ink-900/90 px-2.5 py-1.5 text-[11.5px] font-medium text-white shadow-lg group-hover:block">
                                    {item.label}
                                </span>
                            </a>
                        {:else}
                            <a
                                href={targetPath}
                                onclick={onNavigate}
                                title={item.label}
                                class={cn(
                                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                                    isActiveL2
                                        ? 'bg-white/50 text-brand-600'
                                        : 'text-ink-600 hover:bg-white/30 hover:text-ink-900'
                                )}>
                                {#if isActiveL2}
                                    <span class="nav-item-active-bar"></span>
                                {/if}
                                <Icon
                                    class={cn(
                                        'h-[18px] w-[18px] shrink-0',
                                        isActiveL2 ? 'text-brand-500' : 'text-ink-500 group-hover:text-ink-700'
                                    )}
                                    strokeWidth={1.6} />
                                <span class="flex-1 truncate">{item.label}</span>
                            </a>
                        {/if}
                    {/each}
                </div>
            </div>
        {/each}
    </nav>

    <!-- Company switcher -->
    <div
        class={cn(
            'shrink-0 border-t border-white/40 py-3',
            collapsed ? 'flex flex-col items-center gap-2 px-2' : 'px-3'
        )}>
        {#if !collapsed}
            <!-- Label row -->
            <div class="mb-2 flex items-center justify-between pl-2 pr-0">
                <p class="text-[9.5px] font-semibold uppercase tracking-widest text-ink-400">切换公司</p>
                <div>
                    <button
                        type="button"
                        onclick={() => (companyPickerOpen = !companyPickerOpen)}
                        title="设为默认公司"
                        aria-label="设为默认公司"
                        class={cn(
                            'flex h-5 w-5 items-center justify-center rounded transition-colors',
                            companyPickerOpen ? 'text-brand-500' : 'text-ink-400 hover:text-brand-500'
                        )}>
                        <Star class="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                </div>
            </div>

            <!-- Company chips -->
            <div class="flex w-full items-center gap-1.5 overflow-hidden">
                {#each visibleCompanies as co (co.id)}
                    {@const isActive = co.id === activeCompany}
                    <button
                        type="button"
                        title={co.name}
                        onclick={() => (activeCompany = co.id)}
                        class={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold transition-all duration-150',
                            isActive
                                ? 'border-brand-400 bg-brand-50 text-brand-600 shadow-sm'
                                : 'border-ink-200 bg-white/40 text-ink-500 hover:border-brand-300 hover:bg-white/70 hover:text-brand-500'
                        )}>
                        {co.name.slice(0, 1)}
                    </button>
                {/each}

                <div class="flex-1"></div>

                {#if hiddenCompanies.length > 0}
                    <div>
                        <button
                            type="button"
                            onclick={() => (moreCompaniesOpen = !moreCompaniesOpen)}
                            title="更多公司"
                            aria-label="更多公司"
                            class={cn(
                                'flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors',
                                moreCompaniesOpen ? 'text-brand-500' : 'text-ink-400 hover:text-brand-500'
                            )}>
                            <MoreHorizontal class="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                    </div>
                {/if}
            </div>
        {:else}
            <!-- Collapsed view -->
            <div class="flex flex-col items-center gap-2">
                <button
                    type="button"
                    title={activeCompanyObj.name}
                    onclick={() => (activeCompany = activeCompanyObj.id)}
                    class="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-400 bg-brand-50 text-[13px] font-bold text-brand-600 shadow-sm">
                    {activeCompanyObj.name.slice(0, 1)}
                </button>
                <div>
                    <button
                        type="button"
                        onclick={() => (companyPickerOpen = !companyPickerOpen)}
                        title="全部公司"
                        aria-label="全部公司列表"
                        class={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg border border-dashed transition-colors',
                            companyPickerOpen
                                ? 'border-brand-400 text-brand-500'
                                : 'border-ink-300 text-ink-500 hover:border-brand-300 hover:text-brand-500'
                        )}>
                        <MoreHorizontal class="h-4 w-4" />
                    </button>
                </div>
            </div>
        {/if}
    </div>
</aside>

<!-- Company Picker Flyout -->
{#if companyPickerOpen}
    <button
        type="button"
        class="fixed inset-0 z-40"
        onclick={() => (companyPickerOpen = false)}
        onkeydown={e => e.key === 'Enter' && (companyPickerOpen = false)}
        aria-label="关闭公司选择器"></button>
    <div
        class={cn(
            'glass-strong fixed bottom-[72px] z-50 w-52 overflow-hidden rounded-2xl border-2 border-white/90 p-1.5 shadow-2xl animate-fade-in-up',
            collapsed ? 'left-14' : 'left-[220px]'
        )}>
        <button
            type="button"
            onclick={() => {
                defaultCompany = activeCompany
                companyPickerOpen = false
            }}
            class="mb-1 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12px] text-brand-500 transition-colors hover:bg-brand-50">
            <Star class="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
            {defaultCompany === activeCompany ? '已设为默认公司' : '设为默认公司'}
        </button>
        <div class="border-t border-black/5"></div>
        <p class="mt-1 px-2.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
            全部公司 · {orderedCompanies.length}
        </p>
        <div class="max-h-64 space-y-0.5 overflow-y-auto py-1">
            {#each orderedCompanies as co (co.id)}
                {@const isActive = co.id === activeCompany}
                {@const isDefault = co.id === defaultCompany}
                <button
                    type="button"
                    onclick={() => {
                        activeCompany = co.id
                        companyPickerOpen = false
                    }}
                    class={cn(
                        'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[12.5px] transition-colors',
                        isActive ? 'bg-brand-50 font-semibold text-brand-600' : 'text-ink-700 hover:bg-ink-50'
                    )}>
                    <span
                        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-100 text-[11px] font-bold text-brand-600">
                        {co.name.slice(0, 1)}
                    </span>
                    <span class="flex-1 truncate">{co.name}</span>
                    {#if isDefault}
                        <span class="shrink-0 rounded bg-brand-100 px-1 py-0.5 text-[9px] font-medium text-brand-600">
                            默认
                        </span>
                    {/if}
                    {#if isActive}
                        <Check class="h-3.5 w-3.5 shrink-0 text-brand-500" />
                    {/if}
                </button>
            {/each}
        </div>
    </div>
{/if}

<!-- More Companies Flyout -->
{#if moreCompaniesOpen}
    <button
        type="button"
        class="fixed inset-0 z-40"
        onclick={() => (moreCompaniesOpen = false)}
        onkeydown={e => e.key === 'Enter' && (moreCompaniesOpen = false)}
        aria-label="关闭更多公司列表"></button>
    <div
        class={cn(
            'glass-strong fixed bottom-[40px] z-50 w-52 overflow-hidden rounded-2xl border-2 border-white/90 p-1.5 shadow-2xl animate-fade-in-up',
            collapsed ? 'left-14' : 'left-[220px]'
        )}>
        <p class="px-2.5 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
            更多公司 · {hiddenCompanies.length}
        </p>
        <div class="max-h-64 space-y-0.5 overflow-y-auto py-1">
            {#each hiddenCompanies as co (co.id)}
                {@const isActive = co.id === activeCompany}
                {@const isDefault = co.id === defaultCompany}
                <button
                    type="button"
                    onclick={() => {
                        activeCompany = co.id
                        moreCompaniesOpen = false
                    }}
                    class={cn(
                        'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[12.5px] transition-colors',
                        isActive ? 'bg-brand-50 font-semibold text-brand-600' : 'text-ink-700 hover:bg-ink-50'
                    )}>
                    <span
                        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-100 text-[11px] font-bold text-brand-600">
                        {co.name.slice(0, 1)}
                    </span>
                    <span class="flex-1 truncate">{co.name}</span>
                    {#if isDefault}
                        <span class="shrink-0 rounded bg-brand-100 px-1 py-0.5 text-[9px] font-medium text-brand-600">
                            默认
                        </span>
                    {/if}
                    {#if isActive}
                        <Check class="h-3.5 w-3.5 shrink-0 text-brand-500" />
                    {/if}
                </button>
            {/each}
        </div>
    </div>
{/if}
