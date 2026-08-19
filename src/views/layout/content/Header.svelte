<script lang="ts">
    import { X, FileText } from '@lucide/svelte'
    import { tabsStore, type Tab } from '@/stores/editor.store'
    import { cn } from '$lib/clsx/clsx.lib'

    let tabs = $state<Tab[]>([])
    let activeTabId = $state<string | null>(null)

    tabsStore.subscribe(state => {
        tabs = state.tabs
        activeTabId = state.activeTabId
    })

    function handleTabClick(tabId: string) {
        tabsStore.setActiveTab(tabId)
    }

    function handleCloseTab(event: MouseEvent, tabId: string) {
        event.stopPropagation()
        tabsStore.closeTab(tabId)
    }
</script>

<header class="tabs-header">
    {#if tabs.length > 0}
        <div class="tabs-container">
            {#each tabs as tab (tab.id)}
                <div class={cn('tab', activeTabId === tab.id && 'tab-active')} title={tab.filePath}>
                    <button type="button" onclick={() => handleTabClick(tab.id)} class="tab-button">
                        <FileText class="h-3.5 w-3.5 shrink-0" />
                        <span class="tab-name">{tab.fileName}</span>
                        {#if tab.isDirty}
                            <span class="dirty-indicator"></span>
                        {/if}
                    </button>
                    <button
                        type="button"
                        onclick={e => handleCloseTab(e, tab.id)}
                        class="tab-close"
                        aria-label="关闭标签">
                        <X class="h-3 w-3" />
                    </button>
                </div>
            {/each}
        </div>
    {:else}
        <div class="empty-state">
            <FileText class="h-4 w-4 text-ink-300" />
            <span class="text-xs text-ink-400">未打开文件</span>
        </div>
    {/if}
</header>

<style>
    .tabs-header {
        position: sticky;
        top: 0;
        z-index: 30;
        display: flex;
        flex-shrink: 0;
        align-items: center;
        border-bottom: 1px solid rgb(229 231 235 / 0.5);
        background: rgb(255 255 255 / 0.4);
        backdrop-filter: blur(4px);
        min-height: 40px;
    }

    .tabs-container {
        display: flex;
        flex: 1;
        align-items: center;
        gap: 0.125rem;
        overflow-x: auto;
        padding: 0 0.5rem;
        scrollbar-width: thin;
        scrollbar-color: #e5e7eb transparent;
    }

    .tabs-container::-webkit-scrollbar {
        height: 4px;
    }

    .tabs-container::-webkit-scrollbar-track {
        background: transparent;
    }

    .tabs-container::-webkit-scrollbar-thumb {
        background: #e5e7eb;
        border-radius: 2px;
    }

    .tab {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem 0.375rem 0 0;
        border: 1px solid transparent;
        font-size: 0.75rem;
        line-height: 1rem;
        transition: all 0.15s;
        min-width: 120px;
        max-width: 200px;
    }

    .tab-button {
        display: flex;
        flex: 1;
        align-items: center;
        gap: 0.5rem;
        color: rgb(90 96 117);
        min-width: 0;
    }

    .tab-button:hover {
        color: rgb(30 35 55);
    }

    .tab-active {
        background: rgb(255 255 255 / 0.9);
        color: rgb(30 35 55);
        border-color: rgb(229 231 235 / 0.5);
        border-bottom-color: rgb(255 255 255 / 0.9);
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }

    .tab-active .tab-button {
        color: rgb(30 35 55);
    }

    .tab-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .dirty-indicator {
        height: 0.375rem;
        width: 0.375rem;
        border-radius: 9999px;
        background-color: rgb(99 102 241);
    }

    .tab-close {
        display: flex;
        height: 1rem;
        width: 1rem;
        align-items: center;
        justify-content: center;
        border-radius: 0.25rem;
        color: rgb(156 163 175);
        opacity: 0;
        transition: opacity 0.15s;
    }

    .tab-close:hover {
        background: rgb(243 244 246);
        color: rgb(69 76 106);
    }

    .tab:hover .tab-close {
        opacity: 1;
    }

    .tab-active .tab-close {
        opacity: 0.6;
    }

    .empty-state {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.5rem 0;
    }
</style>
