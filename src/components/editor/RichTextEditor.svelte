<script lang="ts">
    import { activeTab, tabsStore } from '@/stores/editor.store'
    import type { Editor as TiptapEditor } from '@tiptap/core'
    import Tiptap from '$lib/editor/tiptap.svelte'

    interface Props {
        onSave?: () => void
    }

    let { onSave }: Props = $props()

    let currentTab = $state($activeTab)
    let currentContent = $state('')

    activeTab.subscribe(tab => {
        currentTab = tab
        currentContent = tab?.content || ''
    })

    function handleEditorUpdate(editor: TiptapEditor) {
        const newContent = editor.getHTML()
        currentContent = newContent
        if (currentTab) {
            tabsStore.updateTabContent(currentTab.id, newContent)
        }
    }
</script>

<div class="editor-container">
    {#if currentTab}
        <div class="editor-content">
            {#key currentTab.id}
                <Tiptap content={currentTab.content} onUpdate={handleEditorUpdate} {onSave} />
            {/key}
        </div>
    {:else}
        <div class="empty-editor">
            <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-ink-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="mt-4 text-sm text-ink-400">从左侧选择文件开始编辑</p>
            </div>
        </div>
    {/if}
</div>

<style>
    .editor-container {
        display: flex;
        flex: 1 1 0;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
    }

    .editor-content {
        flex: 1 1 0;
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .empty-editor {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
        border-radius: 0.5rem;
        border: 2px dashed rgb(229 231 235);
        background: rgb(255 255 255 / 0.3);
    }
</style>
