<script lang="ts">
    import SidebarTop from './SidebarTop.svelte'
    import SidebarToolbar from './SidebarToolbar.svelte'
    import SidebarCtx from './SidebarCtx.svelte'
    import SidebarFooter from './SidebarFooter.svelte'
    interface Props {
        width: number
        onToggleCollapse: () => void
        onWidthChange: (width: number) => void
    }
    let { width, onToggleCollapse, onWidthChange }: Props = $props()
    const MIN_WIDTH = 240
    const MAX_WIDTH = 400
    let dragging = $state(false)
    function startResize() {
        dragging = true
        const move = (e: PointerEvent) => onWidthChange(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX)))
        const stop = () => {
            dragging = false
            window.removeEventListener('pointermove', move)
            window.removeEventListener('pointerup', stop)
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', stop)
    }
</script>

<aside class="glass-sidebar relative flex shrink-0 flex-col border-r border-white/50" style:width={`${width}px`}>
    <SidebarTop {onToggleCollapse} />
    <SidebarToolbar />
    <SidebarCtx />
    <SidebarFooter />
    <button
        type="button"
        aria-label="调整侧栏宽度"
        title="拖动调整宽度"
        onpointerdown={startResize}
        class={`absolute inset-y-0 right-0 z-20 w-1 cursor-col-resize ${dragging ? 'bg-brand-500' : 'hover:bg-brand-300'}`}></button>
</aside>
