import { writable, derived } from 'svelte/store'

export interface Tab {
    id: string
    filePath: string
    fileName: string
    content: string
    isDirty: boolean
    isNew?: boolean
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
        createNewTab: (content: string = '<p></p>') => {
            const newTab: Tab = {
                id: crypto.randomUUID(),
                filePath: '',
                fileName: '新文档.md',
                content,
                isDirty: true,
                isNew: true
            }

            update(state => ({
                tabs: [...state.tabs, newTab],
                activeTabId: newTab.id
            }))

            return newTab.id
        },
        updateTabPath: (tabId: string, filePath: string) => {
            const fileName = filePath.split('/').pop() || filePath
            update(state => ({
                ...state,
                tabs: state.tabs.map(tab =>
                    tab.id === tabId ? { ...tab, filePath, fileName, isDirty: false, isNew: false } : tab
                )
            }))
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
