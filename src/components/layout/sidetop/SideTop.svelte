<script lang="ts">
    import { PanelLeftClose, PanelLeftOpen, Sparkles } from '@lucide/svelte'
    interface Props { collapsed: boolean; onToggleCollapse: () => void }
    let { collapsed, onToggleCollapse }: Props = $props()
</script>

<header class="flex h-13 shrink-0 items-center gap-2 border-b border-white/50 px-3">
    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-brand-400"><Sparkles class="h-4 w-4 text-white" strokeWidth={2.2} /></div>
    <span class="min-w-0 flex-1 truncate text-sm font-semibold text-ink-900">知识库</span>
    <button type="button" onclick={onToggleCollapse} title={collapsed ? '展开空间内容' : '折叠空间内容'} aria-label={collapsed ? '展开空间内容' : '折叠空间内容'} class="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-white/60">
        {#if collapsed}<PanelLeftOpen class="h-4.5 w-4.5" />{:else}<PanelLeftClose class="h-4.5 w-4.5" />{/if}
    </button>
</header>
