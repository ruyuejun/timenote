<script lang="ts">
    import { MoreHorizontal, Star } from '@lucide/svelte'
    import { cn } from '$lib/clsx/clsx.lib'
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
    const activeCompanyObj = $derived(ALL_COMPANIES.find(c => c.id === activeCompany)!)
</script>

<div class="relative shrink-0 border-t border-white/50 px-3 py-3">
    <div class="mb-2 flex items-center justify-between pl-2">
        <p class="text-[9.5px] font-semibold uppercase tracking-widest text-ink-400">{activeCompanyObj.name}</p>
        <button
            type="button"
            onclick={() => (companyPickerOpen = !companyPickerOpen)}
            title="切换公司"
            aria-label="切换公司"
            class={cn('flex h-5 w-5 items-center justify-center rounded transition-colors', companyPickerOpen ? 'text-brand-500' : 'text-ink-400 hover:text-brand-500')}>
            <MoreHorizontal class="h-3.5 w-3.5" strokeWidth={2} />
        </button>
    </div>
    <div class="flex w-full items-center gap-1.5">
        {#each ALL_COMPANIES.slice(0, 4) as co}
            {@const isActive = co.id === activeCompany}
            {@const isDefault = co.id === defaultCompany}
            <button
                type="button"
                title={co.name}
                onclick={() => (activeCompany = co.id)}
                class={cn('relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold transition-all', isActive ? 'border-brand-400 bg-brand-50 text-brand-600 shadow-sm' : 'border-ink-200 bg-white/40 text-ink-500 hover:border-brand-300 hover:bg-white/70')}>
                {co.name.slice(0, 1)}
                {#if isDefault}
                    <span class="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-400"><Star class="h-1.5 w-1.5 text-white" strokeWidth={3} fill="currentColor" /></span>
                {/if}
            </button>
        {/each}
    </div>
    {#if companyPickerOpen}
        <div class="glass-strong absolute bottom-16 right-3 z-50 w-44 rounded-lg p-2 shadow-xl">
            <p class="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-ink-400">选择公司</p>
            <div class="space-y-0.5">
                {#each ALL_COMPANIES as co}
                    {@const isActive = co.id === activeCompany}
                    {@const isDefault = co.id === defaultCompany}
                    <div class="flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-ink-50">
                        <button type="button" onclick={() => { activeCompany = co.id; companyPickerOpen = false }} class={cn('min-w-0 flex-1 text-left text-xs', isActive ? 'font-medium text-brand-700' : 'text-ink-600')}>{co.name}</button>
                        <button type="button" title="设为默认" aria-label={`将${co.name}设为默认公司`} onclick={() => (defaultCompany = defaultCompany === co.id ? null : co.id)} class={defaultCompany === co.id ? 'text-amber-500' : 'text-ink-300 hover:text-amber-500'}>★</button>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>
