<script lang="ts">
    import { onMount } from 'svelte'
    import { theme } from '@/stores/theme.store'
    import Sidebar from '@/components/layout/sidebar/Sidebar.svelte'
    import Content from '@/components/layout/content/Content.svelte'
    import SideRight from '@/components/layout/sideright/SideRight.svelte'
    import '../app.css'

    let { children } = $props()
    let mobileOpen = $state(false)
    let sidebarWidth = $state(260)
    let sideRightCollapsed = $state(false)
    let sideRightWidth = $state(280)
    let contentLeftDragging = $state(false)
    let contentRightDragging = $state(false)

    const SIDEBAR_MIN = 240
    const SIDEBAR_MAX = 400

    function handleSidebarResize(newWidth: number) {
        sidebarWidth = newWidth
    }

    function handleContentLeftResize(e: PointerEvent) {
        contentLeftDragging = true
        const startX = e.clientX
        const startWidth = sidebarWidth
        const move = (moveEvent: PointerEvent) => {
            const delta = moveEvent.clientX - startX
            handleSidebarResize(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, startWidth + delta)))
        }
        const stop = () => {
            contentLeftDragging = false
            window.removeEventListener('pointermove', move)
            window.removeEventListener('pointerup', stop)
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', stop)
    }

    function handleContentRightResize(e: PointerEvent) {
        contentRightDragging = true
        const startX = e.clientX
        const startWidth = sideRightWidth
        const move = (moveEvent: PointerEvent) => {
            const delta = startX - moveEvent.clientX
            const newWidth = Math.min(500, Math.max(48, startWidth + delta))
            sideRightWidth = newWidth
        }
        const stop = () => {
            contentRightDragging = false
            window.removeEventListener('pointermove', move)
            window.removeEventListener('pointerup', stop)
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', stop)
    }

    onMount(() => theme.init())
</script>

<div class="app-bg"></div>
<div class="relative z-10 flex h-screen overflow-hidden">
    <Sidebar
        width={sidebarWidth}
        onToggleCollapse={() => (sidebarWidth = SIDEBAR_MIN)}
        onWidthChange={handleSidebarResize} />

    {#if mobileOpen}
        <button
            type="button"
            class="fixed inset-0 z-30 bg-ink-900/40 backdrop-blur-sm lg:hidden"
            onclick={() => (mobileOpen = false)}
            aria-label="关闭菜单"></button>
    {/if}

    <Content
        onMenuClick={() => (mobileOpen = true)}
        onLeftResize={handleContentLeftResize}
        onRightResize={handleContentRightResize}>
        {@render children()}
    </Content>

    <SideRight
        collapsed={sideRightCollapsed}
        width={sideRightWidth}
        onToggleCollapse={() => (sideRightCollapsed = !sideRightCollapsed)}
        onWidthChange={width => (sideRightWidth = width)} />
</div>
