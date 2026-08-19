<script lang="ts">
    import { BookOpen, Cloud } from '@lucide/svelte'
    import { cn } from '$lib/clsx/clsx.lib'
    interface Props {
        activeSpace: 'local' | 'remote'
        onSpaceChange: (space: 'local' | 'remote') => void
    }
    let { activeSpace, onSpaceChange }: Props = $props()
</script>

<nav class="flex shrink-0 gap-2 border-b border-white/50 px-3 py-2" aria-label="工作空间">
    {#each [
        { id: 'local' as const, label: '本地空间', Icon: BookOpen },
        { id: 'remote' as const, label: '远程空间', Icon: Cloud },
    ] as item}
        <button
            type="button"
            title={item.label}
            aria-label={item.label}
            aria-pressed={activeSpace === item.id}
            onclick={() => onSpaceChange(item.id)}
            class={cn(
                'group relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                activeSpace === item.id
                    ? 'bg-brand-100 text-brand-600'
                    : 'text-ink-600 hover:bg-white/60 hover:text-ink-900'
            )}>
            <item.Icon class="h-4.5 w-4.5 shrink-0" strokeWidth={1.8} />
            <span class="pointer-events-none absolute left-12 z-50 hidden whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-xs font-normal text-white shadow-lg group-hover:block">
                {item.label}
            </span>
        </button>
    {/each}
</nav>
