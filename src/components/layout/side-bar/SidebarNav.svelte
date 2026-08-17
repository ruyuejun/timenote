<script lang="ts">
    import { cn } from '@/utils/clsx'
    import { Icon } from '@lucide/svelte'

    interface Props {
        mobileOpen: boolean
        collapsed: boolean
        onNavigate?: () => void
    }

    let { mobileOpen, collapsed, onNavigate }: Props = $props()
</script>

<!-- Nav groups -->
<nav class="flex-1 overflow-y-auto overflow-x-hidden py-4">
    <div class="mb-5 px-3">
        {#if !collapsed}
            <p class={cn('mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest', 'text-brand-400')}>
                工作空间
            </p>
        {/if}

        <div class="space-y-0.5">
            {#if collapsed}
                <button
                    onclick={onNavigate}
                    title={'本地空间'}
                    class={cn(
                        'group relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150'
                    )}>
                    <Icon class={cn('h-4.5 w-4.5')} strokeWidth={1.6} />
                    <span
                        class="pointer-events-none absolute left-12 z-50 hidden whitespace-nowrap rounded-lg bg-ink-900/90 px-2.5 py-1.5 text-[11.5px] font-medium text-white shadow-lg group-hover:block">
                        {'本地空间'}
                    </span>
                </button>
            {:else}
                <button
                    onclick={onNavigate}
                    title={'本地空间'}
                    class={cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                        'text-ink-600 hover:bg-white/30 hover:text-ink-900'
                    )}>
                    <Icon
                        class={cn('h-4.5 w-4.5 shrink-0', 'text-ink-500 group-hover:text-ink-700')}
                        strokeWidth={1.6} />
                    <span class="flex-1 truncate">{'本地空间'}</span>
                </button>
            {/if}
        </div>
    </div>
</nav>
