<script lang="ts">
    import { PanelLeftClose, Sparkles } from '@lucide/svelte'
    interface Props {
        onToggleCollapse: () => void
    }
    let { onToggleCollapse }: Props = $props()
</script>

<div class="flex h-13 shrink-0 items-center gap-2 border-b border-white/50 px-3">
    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-brand-400">
        <Sparkles class="h-4 w-4 text-white" strokeWidth={2.2} />
    </div>
    <span class="min-w-0 flex-1 truncate text-sm font-semibold text-ink-900">知识库</span>
    <button
        type="button"
        onclick={onToggleCollapse}
        title="折叠侧栏"
        aria-label="折叠侧栏"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-white/60">
        <PanelLeftClose class="h-4.5 w-4.5" />
    </button>
</div>
