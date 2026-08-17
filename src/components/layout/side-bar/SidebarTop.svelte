<script lang="ts">
    import { Sparkles } from '@lucide/svelte'

    interface Props {
        collapsed: boolean
    }

    let { collapsed }: Props = $props()
</script>

<div class="relative flex h-13 shrink-0 items-center gap-3 px-4">
    <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-brand-400">
        <Sparkles class="h-4 w-4 text-white" strokeWidth={2.2} />
    </div>
    {#if !collapsed}
        <div class="flex min-w-0 flex-col leading-tight">
            <span class="truncate text-[13.5px] font-semibold text-ink-900">知识库</span>
            <span class="text-[10px] text-ink-600">XX 文档</span>
        </div>
    {/if}
</div>
