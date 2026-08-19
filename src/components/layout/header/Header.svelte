<script lang="ts">
    import { Bell, Search, Settings, LogOut, User, Palette, Menu } from '@lucide/svelte'
    import { theme, type Theme } from '@/stores/theme.store'
    import { cn } from '$lib/clsx/clsx.lib'

    interface Props {
        onMenuClick: () => void
    }

    let { onMenuClick }: Props = $props()

    const notifications = [
        {
            id: '1',
            title: '新用户注册',
            description: '张伟 完成了账号注册',
            time: '5 分钟前',
            type: 'task' as const,
        },
        {
            id: '2',
            title: '系统更新',
            description: '后台系统已更新至 v2.4.0',
            time: '1 小时前',
            type: 'system' as const,
        },
        {
            id: '3',
            title: '异常告警',
            description: '订单服务响应超过阈值',
            time: '3 小时前',
            type: 'alert' as const,
        },
    ]

    const MAX_HISTORY = 10

    const THEME_OPTIONS = [
        { id: 'light' as Theme, label: '浅蓝主题', color: '#6366f1' },
        { id: 'pink' as Theme, label: '粉色主题', color: '#ec4899' },
    ]

    let notifOpen = $state(false)
    let userOpen = $state(false)
    let themeOpen = $state(false)
    let searchOpen = $state(false)
    let history = $state<{ label: string; path: string }[]>([])

    function closeAll() {
        notifOpen = false
        userOpen = false
        themeOpen = false
    }

    function navigate(path: string) {
        window.location.href = path
    }

    function removeHistory(path: string) {
        history = history.filter(x => x.path !== path)
    }
</script>

<svelte:window
    onkeydown={e => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault()
            searchOpen = true
        }
        if (e.key === 'Escape') {
            searchOpen = false
        }
    }} />

<header class="header-shell sticky top-0 z-30 shrink-0">
    <!-- Row 1: L3 tabs + Actions -->
    <div class="header-row1">
        <!-- Left: collapse toggle + hamburger + L3 tabs -->
        <div class="flex min-w-0 flex-1 items-center gap-1">
            <button
                type="button"
                onclick={onMenuClick}
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-white/50 lg:hidden"
                aria-label="打开导航菜单">
                <Menu class="h-5 w-5" />
            </button>
        </div>

        <!-- Right: search + theme + bell + user -->
        <div class="relative flex shrink-0 items-center gap-1">
            <button
                type="button"
                onclick={() => (searchOpen = true)}
                class="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-white/60"
                aria-label="搜索"
                title="搜索 (⌘K)">
                <Search class="h-4 w-4" />
            </button>

            <!-- Theme palette dropdown -->
            <div>
                <button
                    type="button"
                    onclick={() => {
                        themeOpen = !themeOpen
                        notifOpen = false
                        userOpen = false
                    }}
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-white/60"
                    aria-label="切换主题">
                    <Palette class="h-4 w-4" />
                </button>

                {#if themeOpen}
                    <button
                        type="button"
                        class="fixed inset-0 z-40"
                        onclick={closeAll}
                        onkeydown={e => e.key === 'Enter' && closeAll()}
                        aria-label="关闭主题选择器"></button>
                    <div
                        class="glass-strong absolute right-0 top-full mt-2 z-50 w-40 overflow-hidden rounded-2xl border-2 border-white/90 p-1.5 shadow-2xl animate-fade-in-up">
                        {#each THEME_OPTIONS as opt (opt.id)}
                            <button
                                type="button"
                                onclick={() => {
                                    theme.set(opt.id)
                                    themeOpen = false
                                }}
                                class={cn(
                                    'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12.5px] transition-colors',
                                    $theme === opt.id
                                        ? 'bg-brand-50 font-semibold text-brand-600'
                                        : 'text-ink-700 hover:bg-ink-50'
                                )}>
                                <span
                                    class="h-4 w-4 shrink-0 rounded-full border border-ink-200"
                                    style="background-color: {opt.color}"></span>
                                {opt.label}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- Notification -->
            <div>
                <button
                    type="button"
                    onclick={() => {
                        notifOpen = !notifOpen
                        userOpen = false
                        themeOpen = false
                    }}
                    class="relative flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-white/60"
                    aria-label="消息通知">
                    <Bell class="h-4 w-4" />
                    <span class="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-acc-rose ring-1 ring-white"
                    ></span>
                </button>

                {#if notifOpen}
                    <button
                        type="button"
                        class="fixed inset-0 z-40"
                        onclick={closeAll}
                        onkeydown={e => e.key === 'Enter' && closeAll()}
                        aria-label="关闭通知面板"></button>
                    <div
                        class="glass-strong absolute right-0 top-full mt-2 z-50 w-80 overflow-hidden rounded-2xl border-2 border-white/90 p-2 shadow-2xl animate-fade-in-up">
                        <div class="flex items-center justify-between px-2 py-1.5">
                            <span class="text-[13px] font-semibold text-ink-900">通知消息</span>
                            <button class="text-[11px] text-brand-600 hover:text-brand-700">全部已读</button>
                        </div>
                        <div class="max-h-72 space-y-0.5 overflow-y-auto">
                            {#each notifications as n (n.id)}
                                <div class="flex gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-ink-50">
                                    <span
                                        class={cn(
                                            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                                            n.type === 'alert'
                                                ? 'bg-acc-rose'
                                                : n.type === 'task'
                                                  ? 'bg-acc-emerald'
                                                  : 'bg-brand-400'
                                        )}></span>
                                    <div class="min-w-0 flex-1">
                                        <p class="truncate text-[12.5px] font-medium text-ink-900">{n.title}</p>
                                        <p class="truncate text-[11.5px] text-ink-500">{n.description}</p>
                                    </div>
                                    <span class="shrink-0 text-[10.5px] text-ink-400">{n.time}</span>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>

            <!-- User -->
            <div class="relative ml-0.5">
                <button
                    type="button"
                    onclick={() => {
                        userOpen = !userOpen
                        notifOpen = false
                        themeOpen = false
                    }}
                    class="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2.5 transition-colors hover:bg-white/60">
                    <span
                        class="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-brand-500 to-brand-400 text-[12px] font-bold text-white">
                        苏
                    </span>
                    <span class="hidden flex-col items-start leading-tight sm:flex">
                        <span class="text-[12.5px] font-medium text-ink-900">苏晴</span>
                        <span class="text-[10px] text-ink-400">系统管理员</span>
                    </span>
                </button>

                {#if userOpen}
                    <button
                        type="button"
                        class="fixed inset-0 z-40"
                        onclick={closeAll}
                        onkeydown={e => e.key === 'Enter' && closeAll()}
                        aria-label="关闭用户菜单"></button>
                    <div
                        class="glass-strong absolute right-0 top-full mt-2 z-50 w-35 overflow-hidden rounded-2xl border-2 border-white/90 p-1.5 px-3 shadow-2xl animate-fade-in-up">
                        <button
                            class="flex justify-center w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12.5px] text-ink-700 transition-colors hover:bg-ink-50">
                            <User class="h-3.5 w-3.5 text-ink-400" /> 个人资料
                        </button>
                        <button
                            class="flex justify-center w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12.5px] text-ink-700 transition-colors hover:bg-ink-50">
                            <Settings class="h-3.5 w-3.5 text-ink-400" /> 账号设置
                        </button>
                        <div class="my-1 h-px bg-ink-100"></div>
                        <button
                            class="flex justify-center w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12.5px] text-acc-rose transition-colors hover:bg-red-50">
                            <LogOut class="h-3.5 w-3.5" /> 退出登录
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</header>
