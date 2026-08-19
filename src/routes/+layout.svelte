<script lang="ts">
    import { onMount } from 'svelte'
    import { theme } from '@/stores/theme.store'
    import Sidebar from '@/components/layout/side-bar/Sidebar.svelte'
    import Header from '@/components/layout/header/Header.svelte'
    import '../app.css'

    let { children } = $props()

    let mobileOpen = $state(false)
    let collapsed = $state(false)

    onMount(() => {
        theme.init()
    })
</script>

<div class="app-bg"></div>

<div class="relative z-10 flex min-h-screen">
    <Sidebar
        {mobileOpen}
        {collapsed}
        onNavigate={() => (mobileOpen = false)}
        onToggleCollapse={() => (collapsed = !collapsed)} />

    {#if mobileOpen}
        <button
            type="button"
            class="fixed inset-0 z-30 bg-ink-900/40 backdrop-blur-sm lg:hidden"
            onclick={() => (mobileOpen = false)}
            onkeydown={e => e.key === 'Enter' && (mobileOpen = false)}
            aria-label="关闭菜单"></button>
    {/if}

    <div class="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => (mobileOpen = true)} />

        <main class="flex-1 px-6 py-5">
            {@render children()}
        </main>
    </div>
</div>
