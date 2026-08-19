<script lang="ts">
    import RichTextEditor from '@/components/editor/RichTextEditor.svelte'
    import StartupPage from '@/views/startup/StartupPage.svelte'
    import { tabsStore, activeTab } from '@/stores/editor.store'
    import { localFilesStore } from '@/stores/localFiles.store'

    let currentTab = $state($activeTab)

    activeTab.subscribe(tab => {
        currentTab = tab
    })

    async function handleSave() {
        if (!currentTab || typeof window === 'undefined' || !window.electron) return

        try {
            const filePath = await window.electron.saveFileDialog(currentTab.fileName)

            if (filePath) {
                await window.electron.writeFile(filePath, currentTab.content)
                tabsStore.updateTabPath(currentTab.id, filePath)

                if (currentTab.isNew) {
                    localFilesStore.addStandaloneFile(filePath)
                } else {
                    const dirPath = filePath.substring(0, filePath.lastIndexOf('/'))
                    localFilesStore.addDirectory(dirPath)
                }
            }
        } catch (error) {
            console.error('保存失败:', error)
        }
    }
</script>

<div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    {#if currentTab}
        <RichTextEditor onSave={handleSave} />
    {:else}
        <StartupPage />
    {/if}
</div>
