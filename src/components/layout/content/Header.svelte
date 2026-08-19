<script lang="ts">
    import { Bell, LogOut, Menu, Palette, Search, Settings, User } from '@lucide/svelte'
    import { theme, type Theme } from '@/stores/theme.store'
    import { cn } from '$lib/clsx/clsx.lib'
    interface Props { onMenuClick: () => void }
    let { onMenuClick }: Props = $props()
    const THEME_OPTIONS = [{ id: 'light' as Theme, label: '浅蓝主题', color: '#6366f1' }, { id: 'pink' as Theme, label: '粉色主题', color: '#ec4899' }]
    let themeOpen = $state(false)
    let userOpen = $state(false)
    let notifOpen = $state(false)
    let searchOpen = $state(false)
    function closeAll() { themeOpen = false; userOpen = false; notifOpen = false }
</script>

<header class="header-shell sticky top-0 z-30 shrink-0"><div class="header-row1">
    <button type="button" onclick={onMenuClick} class="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-white/60 lg:hidden" aria-label="打开导航菜单"><Menu class="h-5 w-5" /></button>
    <div class="ml-auto flex items-center gap-1">
        <button type="button" onclick={() => (searchOpen = true)} title="搜索 (⌘K)" aria-label="搜索" class="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-white/60"><Search class="h-4 w-4" /></button>
        <button type="button" onclick={() => { themeOpen = !themeOpen; userOpen = false }} aria-label="切换主题" class="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-white/60"><Palette class="h-4 w-4" /></button>
        <button type="button" onclick={() => { notifOpen = !notifOpen; userOpen = false }} aria-label="消息通知" class="relative flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-white/60"><Bell class="h-4 w-4" /><span class="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-acc-rose" /></button>
        <div class="relative"><button type="button" onclick={() => { userOpen = !userOpen; themeOpen = false; notifOpen = false }} class="flex items-center gap-2 rounded-lg p-1 hover:bg-white/60"><span class="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">苏</span><span class="hidden text-left leading-tight sm:block"><span class="block text-xs font-medium text-ink-900">苏晴</span><span class="block text-[10px] text-ink-400">系统管理员</span></span></button>{#if userOpen}<div class="glass-strong absolute right-0 top-full z-50 mt-2 w-36 rounded-lg p-1.5"><button class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-ink-700 hover:bg-ink-50"><User class="h-3.5 w-3.5" />个人资料</button><button class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-ink-700 hover:bg-ink-50"><Settings class="h-3.5 w-3.5" />账号设置</button><button class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-rose-600 hover:bg-rose-50"><LogOut class="h-3.5 w-3.5" />退出登录</button></div>{/if}</div>
    </div>
</div></header>
{#if themeOpen}<div class="glass-strong absolute right-20 top-12 z-50 w-40 rounded-lg p-2">{#each THEME_OPTIONS as option}<button type="button" onclick={() => { theme.set(option.id); closeAll() }} class={cn('flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs', $theme === option.id ? 'bg-brand-50 text-brand-600' : 'text-ink-700 hover:bg-ink-50')}><span class="h-3 w-3 rounded-full" style={`background:${option.color}`}></span>{option.label}</button>{/each}</div>{/if}
{#if notifOpen}<div class="glass-strong absolute right-12 top-12 z-50 w-56 rounded-lg p-3 text-xs text-ink-600">暂无新通知</div>{/if}
{#if searchOpen}<div class="fixed inset-0 z-50 flex items-start justify-center bg-ink-900/20 pt-24" role="presentation" onclick={() => (searchOpen = false)}><div class="glass-strong w-96 rounded-xl p-4" role="dialog" aria-label="搜索" onclick={event => event.stopPropagation()}><input autofocus placeholder="搜索文件或内容" class="w-full rounded-lg border border-ink-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-brand-400" /></div></div>{/if}
