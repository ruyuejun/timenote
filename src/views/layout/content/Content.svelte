<script lang="ts">
    import Header from './Header.svelte'
    import type { Snippet } from 'svelte'

    interface Props {
        onMenuClick: () => void
        onLeftResize: (e: PointerEvent) => void
        onRightResize: (e: PointerEvent) => void
        children?: Snippet
    }
    let { onLeftResize, onRightResize, children }: Props = $props()
</script>

<div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
    <button
        type="button"
        aria-label="调整左侧宽度"
        title="拖动调整左侧宽度"
        onpointerdown={onLeftResize}
        class="absolute inset-y-0 left-0 z-20 w-1 cursor-col-resize hover:bg-brand-300"></button>
    <button
        type="button"
        aria-label="调整右侧宽度"
        title="拖动调整右侧宽度"
        onpointerdown={onRightResize}
        class="absolute inset-y-0 right-0 z-20 w-1 cursor-col-resize hover:bg-brand-300"></button>

    <Header />

    <main class="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-5">
        {@render children?.()}
    </main>
</div>
