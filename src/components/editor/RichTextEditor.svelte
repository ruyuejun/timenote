<script lang="ts">
    import Tiptap from '@/editor/Tiptap.svelte'
    import type { Editor as TiptapEditor } from '@tiptap/core'

    interface Props {
        content?: string
        onUpdate?: (editor: TiptapEditor) => void
    }

    let { content = '<p>选择一个文件开始编辑...</p>', onUpdate }: Props = $props()
</script>

<div class="rich-text-editor-container">
    <Tiptap {content} {onUpdate} />
</div>

<style lang="scss">
    .rich-text-editor-container {
        width: 100%;
        height: 100%;
        padding: 24px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
</style>
