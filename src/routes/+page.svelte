<script lang="ts">
    import { onMount } from 'svelte'
    import RichTextEditor from '@/components/editor/RichTextEditor.svelte'
    import StartupPage from '@/views/startup/StartupPage.svelte'
    import { activeTab } from '@/stores/editor.store'
    import { isSaveHotkey, saveActiveDocument } from '$lib/editor/save-document'

    let currentTab = $state($activeTab)

    activeTab.subscribe(tab => {
        currentTab = tab
    })

    onMount(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (!isSaveHotkey(event)) return
            event.preventDefault()
            void saveActiveDocument()
        }
        window.addEventListener('keydown', onKeyDown, true)
        return () => window.removeEventListener('keydown', onKeyDown, true)
    })
</script>

<div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    {#if currentTab}
        <RichTextEditor onSave={saveActiveDocument} />
    {:else}
        <StartupPage />
    {/if}
</div>
