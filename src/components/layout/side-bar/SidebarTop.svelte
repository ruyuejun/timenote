<script lang="ts">
    import { PanelLeftClose, PanelLeftOpen, Sparkles } from '@lucide/svelte'

    interface Props {
        collapsed: boolean
        onToggleCollapse: () => void
    }

    let { collapsed, onToggleCollapse }: Props = $props()
</script>

<div class="relative flex h-13 shrink-0 items-center gap-3 px-4">
    <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-brand-400">
        <Sparkles class="h-4 w-4 text-white" strokeWidth={2.2} />
    </div>
    {#if !collapsed}
        <div class="flex min-w-0 flex-1 flex-col leading-tight">
            <span class="truncate text-[13.5px] font-semibold text-ink-900">知识库</span>
            <span class="text-[10px] text-ink-600">XX 文档</span>
        </div>
    {:else}
        <div class="flex-1"></div>
    {/if}
    <button
        type="button"
        onclick={onToggleCollapse}
        class="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-white/50 lg:flex"
        aria-label={collapsed ? '展开菜单' : '折叠菜单'}
        title={collapsed ? '展开菜单' : '折叠菜单'}>
        {#if collapsed}
            <PanelLeftOpen class="h-4.5 w-4.5" strokeWidth={1.8} />
        {:else}
            <PanelLeftClose class="h-4.5 w-4.5" strokeWidth={1.8} />
        {/if}
    </button>
</div>
