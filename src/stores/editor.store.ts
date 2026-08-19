import { writable, derived } from 'svelte/store'

export interface Tab {
    id: string
    filePath: string
    fileName: string
    content: string
    isDirty: boolean
}

interface TabsState {
    tabs: Tab[]
    activeTabId: string | null
}

function createTabsStore() {
    const { subscribe, set, update } = writable<TabsState>({
        tabs: [],
        activeTabId: null
    })

    return {
        subscribe,
        openTab: (filePath: string, content: string) => {
            update(state => {
                const existingTab = state.tabs.find(tab => tab.filePath === filePath)
                if (existingTab) {
                    return { ...state, activeTabId: existingTab.id }
                }

                const fileName = filePath.split('/').pop() || filePath
                const newTab: Tab = {
                    id: crypto.randomUUID(),
                    filePath,
                    fileName,
                    content,
                    isDirty: false
                }

                return {
                    tabs: [...state.tabs, newTab],
                    activeTabId: newTab.id
                }
            })
        },
        closeTab: (tabId: string) => {
            update(state => {
                const newTabs = state.tabs.filter(tab => tab.id !== tabId)
                let newActiveId = state.activeTabId

                if (state.activeTabId === tabId && newTabs.length > 0) {
                    const closedIndex = state.tabs.findIndex(tab => tab.id === tabId)
                    const nextIndex = Math.min(closedIndex, newTabs.length - 1)
                    newActiveId = newTabs[nextIndex]?.id || null
                } else if (newTabs.length === 0) {
                    newActiveId = null
                }

                return { tabs: newTabs, activeTabId: newActiveId }
            })
        },
        setActiveTab: (tabId: string) => {
            update(state => ({ ...state, activeTabId: tabId }))
        },
        updateTabContent: (tabId: string, content: string) => {
            update(state => ({
                ...state,
                tabs: state.tabs.map(tab =>
                    tab.id === tabId ? { ...tab, content, isDirty: true } : tab
                )
            }))
        },
        markTabSaved: (tabId: string) => {
            update(state => ({
                ...state,
                tabs: state.tabs.map(tab =>
                    tab.id === tabId ? { ...tab, isDirty: false } : tab
                )
            }))
        }
    }
}

export const tabsStore = createTabsStore()

export const activeTab = derived(tabsStore, $tabs => 
    $tabs.tabs.find(tab => tab.id === $tabs.activeTabId) || null
)
