<script lang="ts">
    import { editorStore } from '@/stores/editor'
    import Tiptap from '@/editor/Tiptap.svelte'

    let editorState = $state({ content: '', filePath: null as string | null })

    editorStore.subscribe((state) => {
        editorState = state
    })
</script>

<div class="flex h-full flex-col">
    {#if editorState.filePath}
        <div class="mb-4 rounded-lg bg-white/50 px-4 py-2 text-sm text-ink-600">
            正在编辑: <span class="font-medium text-ink-900">{editorState.filePath}</span>
        </div>
    {/if}
    
    <div class="flex-1 overflow-auto">
        <Tiptap content={editorState.content} />
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
