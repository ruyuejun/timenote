<script lang="ts">
    import { editorStore } from '@/stores/editor.store'
    import { cn } from '$lib/clsx/clsx.lib'
    import { Save } from '@lucide/svelte'
    import type { Editor as TiptapEditor } from '@tiptap/core'
    import Button from '../ui/Button.svelte'
    import Tiptap from '$lib/editor/tiptap.svelte'

    let editorState = $state({ content: '', filePath: null as string | null })
    let currentContent = $state('')
    let isSaving = $state(false)
    let saveMessage = $state('')

    editorStore.subscribe(state => {
        editorState = state
        currentContent = state.content
    })

    function handleEditorUpdate(editor: TiptapEditor) {
        currentContent = editor.getHTML()
    }

    async function handleSave() {
        if (!editorState.filePath) {
            saveMessage = '请先选择要保存的文件'
            setTimeout(() => {
                saveMessage = ''
            }, 3000)
            return
        }

        isSaving = true
        saveMessage = ''

        try {
            // 判断是本地文件还是远程文件
            if (editorState.filePath.startsWith('/remote/')) {
                // 远程文件保存逻辑（模拟）
                await new Promise(resolve => setTimeout(resolve, 500))
                saveMessage = '✓ 已保存到远程空间'
            } else {
                // 本地文件保存逻辑
                if (typeof window !== 'undefined' && window.electron) {
                    await window.electron.writeFile(editorState.filePath, currentContent)
                    saveMessage = '✓ 已保存到本地'
                }
            }

            setTimeout(() => {
                saveMessage = ''
            }, 3000)
        } catch (error) {
            console.error('保存失败:', error)
            saveMessage = '✗ 保存失败'
            setTimeout(() => {
                saveMessage = ''
            }, 3000)
        } finally {
            isSaving = false
        }
    }
</script>

<div class="flex h-full flex-col">
    <div class="mb-4 flex items-center justify-between gap-4">
        <div class="flex-1">
            {#if editorState.filePath}
                <div class="rounded-lg bg-white/50 px-4 py-2 text-sm text-ink-600">
                    正在编辑: <span class="font-medium text-ink-900">{editorState.filePath}</span>
                </div>
            {:else}
                <div class="rounded-lg bg-white/50 px-4 py-2 text-sm text-ink-500">未选择文件 - 请选择文件进行编辑</div>
            {/if}
        </div>

        <div class="flex items-center gap-3">
            {#if saveMessage}
                <span
                    class={cn(
                        'text-sm font-medium',
                        saveMessage.startsWith('✓') ? 'text-emerald-600' : 'text-rose-600'
                    )}>
                    {saveMessage}
                </span>
            {/if}
            <Button onclick={handleSave} disabled={isSaving || !editorState.filePath} size="sm">
                <Save class="h-3.5 w-3.5" strokeWidth={2} />
                {isSaving ? '保存中...' : '保存'}
            </Button>
        </div>
    </div>

    <div class="flex-1 overflow-auto">
        <Tiptap content={editorState.content} onUpdate={handleEditorUpdate} />
    </div>
</div>

<style lang="postcss">
    .flex {
        @apply flex;
    }

    .h-full {
        @apply h-full;
    }

    .flex-col {
        @apply flex-col;
    }

    .flex-1 {
        @apply flex-1;
    }

    .overflow-auto {
        @apply overflow-auto;
    }
</style>
