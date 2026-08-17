<script lang="ts">
    import { cn } from '@/utils/clsx'
    import SidebarTop from './SidebarTop.svelte'
    import SidebarNav from './SidebarNav.svelte'
    import SidebarCompany from './SidebarCompany.svelte'

    interface Props {
        mobileOpen: boolean
        collapsed: boolean
        onNavigate: () => void
    }

    let { mobileOpen, collapsed, onNavigate }: Props = $props()
</script>

<aside
    class={cn(
        'glass-sidebar sidebar-transition relative z-40 flex shrink-0 flex-col',
        'fixed inset-y-0 left-0 lg:sticky lg:top-0 lg:h-screen',
        collapsed ? 'w-14' : 'w-55',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    )}>
    <SidebarTop {collapsed} />
    <SidebarNav {mobileOpen} {collapsed} />
    <SidebarCompany {collapsed} />
</aside>
