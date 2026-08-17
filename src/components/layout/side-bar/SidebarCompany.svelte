<script lang="ts">
    import { MoreHorizontal, Star } from '@lucide/svelte'
    import { cn } from '@/utils/clsx'

    interface Props {
        collapsed: boolean
        onNavigate?: () => void
    }

    let { collapsed }: Props = $props()

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

    const activeCompanyObj = $derived(ALL_COMPANIES.find(c => c.id === activeCompany)!)

    const orderedCompanies = $derived.by(() => {
        if (!defaultCompany || defaultCompany === activeCompany) return ALL_COMPANIES
        const rest = ALL_COMPANIES.filter(c => c.id !== defaultCompany)
        return [ALL_COMPANIES.find(c => c.id === defaultCompany)!, ...rest]
    })

    const visibleCompanies = $derived(orderedCompanies.slice(0, 4))
    const hiddenCompanies = $derived(orderedCompanies.slice(4))

    function setDefaultCompany(companyId: string) {
        defaultCompany = companyId
        companyPickerOpen = false
    }

    function clearDefaultCompany() {
        defaultCompany = null
        companyPickerOpen = false
    }
</script>

<div
    class={cn(
        'relative shrink-0 border-t border-white/40 py-3',
        collapsed ? 'flex flex-col items-center gap-2 px-2' : 'px-3'
    )}>
    {#if !collapsed}
        <!-- Label row -->
        <div class="mb-2 flex items-center justify-between pl-2 pr-0">
            <p class="text-[9.5px] font-semibold uppercase tracking-widest text-ink-400">切换公司</p>
            <div class="relative">
                <button
                    type="button"
                    onclick={() => (companyPickerOpen = !companyPickerOpen)}
                    title="设为默认公司"
                    aria-label="设为默认公司"
                    class={cn(
                        'flex h-5 w-5 items-center justify-center rounded transition-colors',
                        companyPickerOpen ? 'text-brand-500' : 'text-ink-400 hover:text-brand-500',
                        defaultCompany && 'text-amber-500 hover:text-amber-600'
                    )}>
                    <Star class="h-3.5 w-3.5" strokeWidth={2} fill={defaultCompany ? 'currentColor' : 'none'} />
                </button>

                {#if companyPickerOpen}
                    <div
                        class="absolute bottom-7 right-0 z-50 w-44 rounded-lg border border-ink-200 bg-white shadow-lg">
                        <div class="p-2">
                            <p class="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                                选择默认公司
                            </p>
                            <div class="space-y-0.5">
                                {#each ALL_COMPANIES as co (co.id)}
                                    {@const isDefault = co.id === defaultCompany}
                                    <button
                                        type="button"
                                        onclick={() => setDefaultCompany(co.id)}
                                        class={cn(
                                            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] transition-colors',
                                            isDefault
                                                ? 'bg-amber-50 text-amber-700 font-medium'
                                                : 'text-ink-600 hover:bg-ink-50'
                                        )}>
                                        <span
                                            class="flex h-5 w-5 items-center justify-center rounded border text-[10px] font-bold"
                                            class:border-amber-400={isDefault}
                                            class:bg-amber-50={isDefault}
                                            class:text-amber-600={isDefault}
                                            class:border-ink-200={!isDefault}
                                            class:bg-ink-50={!isDefault}
                                            class:text-ink-500={!isDefault}>
                                            {co.name.slice(0, 1)}
                                        </span>
                                        <span class="flex-1">{co.name}</span>
                                        {#if isDefault}
                                            <Star class="h-3 w-3 text-amber-500" strokeWidth={2} fill="currentColor" />
                                        {/if}
                                    </button>
                                {/each}
                            </div>
                            {#if defaultCompany}
                                <div class="mt-2 border-t border-ink-100 pt-2">
                                    <button
                                        type="button"
                                        onclick={clearDefaultCompany}
                                        class="w-full rounded-md px-2 py-1.5 text-[11px] text-ink-500 hover:bg-ink-50 hover:text-ink-700">
                                        清除默认公司
                                    </button>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Company chips -->
        <div class="flex w-full items-center gap-1.5">
            {#each visibleCompanies as co (co.id)}
                {@const isActive = co.id === activeCompany}
                {@const isDefault = co.id === defaultCompany}
                <button
                    type="button"
                    title={co.name}
                    onclick={() => (activeCompany = co.id)}
                    class={cn(
                        'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold transition-all duration-150',
                        isActive
                            ? 'border-brand-400 bg-brand-50 text-brand-600 shadow-sm'
                            : 'border-ink-200 bg-white/40 text-ink-500 hover:border-brand-300 hover:bg-white/70 hover:text-brand-500'
                    )}>
                    {co.name.slice(0, 1)}
                    {#if isDefault}
                        <span
                            class="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-400">
                            <Star class="h-1.5 w-1.5 text-white" strokeWidth={3} fill="currentColor" />
                        </span>
                    {/if}
                </button>
            {/each}

            <div class="flex-1"></div>

            {#if hiddenCompanies.length > 0}
                <div class="relative">
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

                    {#if moreCompaniesOpen}
                        <div
                            class="absolute bottom-7 right-0 z-50 w-40 rounded-lg border border-ink-200 bg-white shadow-lg">
                            <div class="p-2">
                                <p class="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                                    更多公司
                                </p>
                                <div class="space-y-0.5">
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
                                                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] transition-colors',
                                                isActive
                                                    ? 'bg-brand-50 text-brand-700 font-medium'
                                                    : 'text-ink-600 hover:bg-ink-50'
                                            )}>
                                            <span
                                                class="flex h-5 w-5 items-center justify-center rounded border text-[10px] font-bold"
                                                class:border-brand-400={isActive}
                                                class:bg-brand-50={isActive}
                                                class:text-brand-600={isActive}
                                                class:border-ink-200={!isActive}
                                                class:bg-ink-50={!isActive}
                                                class:text-ink-500={!isActive}>
                                                {co.name.slice(0, 1)}
                                            </span>
                                            <span class="flex-1">{co.name}</span>
                                            {#if isDefault}
                                                <Star
                                                    class="h-3 w-3 text-amber-500"
                                                    strokeWidth={2}
                                                    fill="currentColor" />
                                            {/if}
                                        </button>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {/if}
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
                class="relative flex h-9 w-9 items-center justify-center rounded-lg border border-brand-400 bg-brand-50 text-[13px] font-bold text-brand-600 shadow-sm">
                {activeCompanyObj.name.slice(0, 1)}
                {#if activeCompanyObj.id === defaultCompany}
                    <span
                        class="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-amber-400">
                        <Star class="h-2 w-2 text-white" strokeWidth={3} fill="currentColor" />
                    </span>
                {/if}
            </button>
            <div class="relative">
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

                {#if companyPickerOpen}
                    <div
                        class="absolute bottom-12 left-12 z-50 w-44 rounded-lg border border-ink-200 bg-white shadow-lg">
                        <div class="p-2">
                            <p class="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                                全部公司
                            </p>
                            <div class="space-y-0.5">
                                {#each ALL_COMPANIES as co (co.id)}
                                    {@const isActive = co.id === activeCompany}
                                    {@const isDefault = co.id === defaultCompany}
                                    <button
                                        type="button"
                                        onclick={() => {
                                            activeCompany = co.id
                                            companyPickerOpen = false
                                        }}
                                        class={cn(
                                            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] transition-colors',
                                            isActive
                                                ? 'bg-brand-50 text-brand-700 font-medium'
                                                : 'text-ink-600 hover:bg-ink-50'
                                        )}>
                                        <span
                                            class="flex h-5 w-5 items-center justify-center rounded border text-[10px] font-bold"
                                            class:border-brand-400={isActive}
                                            class:bg-brand-50={isActive}
                                            class:text-brand-600={isActive}
                                            class:border-ink-200={!isActive}
                                            class:bg-ink-50={!isActive}
                                            class:text-ink-500={!isActive}>
                                            {co.name.slice(0, 1)}
                                        </span>
                                        <span class="flex-1">{co.name}</span>
                                        {#if isDefault}
                                            <Star class="h-3 w-3 text-amber-500" strokeWidth={2} fill="currentColor" />
                                        {/if}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>
