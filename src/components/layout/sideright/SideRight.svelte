<script lang="ts">
    import { PanelRightClose, PanelRightOpen } from '@lucide/svelte'
    interface Props {
        collapsed: boolean
        width: number
        onToggleCollapse: () => void
        onWidthChange: (width: number) => void
    }
    let { collapsed, width, onToggleCollapse, onWidthChange }: Props = $props()
    const MIN_WIDTH = 48
    const MAX_WIDTH = 500
    let dragging = $state(false)
    function startResize() {
        dragging = true
        const move = (e: PointerEvent) => {
            const rightEdge = window.innerWidth - e.clientX
            onWidthChange(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, rightEdge)))
        }
        const stop = () => {
            dragging = false
            window.removeEventListener('pointermove', move)
            window.removeEventListener('pointerup', stop)
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', stop)
    }
</script>

<aside
    class="glass-sidebar relative flex shrink-0 flex-col border-l border-white/50"
    style:width={`${collapsed ? MIN_WIDTH : width}px`}>
    <button
        type="button"
        aria-label="调整右侧栏宽度"
        title="拖动调整宽度"
        onpointerdown={startResize}
        class={`absolute inset-y-0 left-0 z-20 w-1 cursor-col-resize ${dragging ? 'bg-brand-500' : 'hover:bg-brand-300'}`}></button>

    <div class="flex h-13 items-center justify-between border-b border-white/50 px-3">
        {#if !collapsed}
            <span class="text-sm font-semibold text-ink-800">右侧栏</span>
        {/if}
        <button
            type="button"
            onclick={onToggleCollapse}
            title={collapsed ? '展开右侧栏' : '折叠右侧栏'}
            aria-label={collapsed ? '展开右侧栏' : '折叠右侧栏'}
            class="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-white/60"
            class:ml-auto={collapsed}>
            {#if collapsed}
                <PanelRightOpen class="h-4 w-4" />
            {:else}
                <PanelRightClose class="h-4 w-4" />
            {/if}
        </button>
    </div>

    {#if !collapsed}
        <div class="flex-1 overflow-auto p-4">
            <div class="rounded-lg border-2 border-dashed border-ink-200 bg-white/40 p-4 text-sm text-ink-500">
                预留区域内容
            </div>
        </div>
    {/if}
</aside>
