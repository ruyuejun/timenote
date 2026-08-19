<script lang="ts">
    import { onMount, onDestroy } from 'svelte'
    import { Editor, type Editor as TiptapEditor } from '@tiptap/core'
    import { StarterKit } from '@tiptap/starter-kit'
    import { BubbleMenu } from '@tiptap/extension-bubble-menu'
    import Underline from '@tiptap/extension-underline'
    import Toolbar from './toolbar.svelte'

    // ---------- 组件 Props ----------
    const {
        content = '<p>Hello TypeScript with Tiptap! 👋</p>',
        onUpdate,
        onSave,
    }: { content?: string; onUpdate?: (editor: TiptapEditor) => void; onSave?: () => void } = $props()

    let editor = $state<TiptapEditor | null>(null)
    let editorElement = $state<HTMLElement | null>(null)
    let bubbleMenuElement = $state<HTMLElement | null>(null)

    // ---------- 生命周期 ----------
    onMount(() => {
        if (!editorElement) return

        editor = new Editor({
            element: editorElement,
            extensions: [
                StarterKit,
                Underline, // 启用下划线
                BubbleMenu.configure({
                    element: bubbleMenuElement,
                    shouldShow: ({ from, to }: { state: any; from: number; to: number }) => {
                        // 只在有文字选中时显示
                        return from !== to
                    },
                } as any),
            ],
            content: content,
            onUpdate: ({ editor }) => {
                if (onUpdate) {
                    onUpdate(editor)
                }
            },
        })

        return () => {
            editor?.destroy()
            editor = null
        }
    })

    onDestroy(() => {
        editor?.destroy()
        editor = null
    })

    // 监听 content 变化，更新编辑器内容
    $effect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    })

    // ---------- 辅助方法 ----------
    const toggleBold = () => {
        editor?.chain().focus().toggleBold().run()
    }

    const toggleItalic = () => {
        editor?.chain().focus().toggleItalic().run()
    }

    const toggleUnderline = () => {
        editor?.chain().focus().toggleUnderline().run()
    }

    const toggleHeading = (level: 1 | 2) => {
        editor?.chain().focus().toggleHeading({ level }).run()
    }
</script>

<!-- ---------- 模板 ---------- -->
<div class="editor-wrapper">
    {#if editor}
        <div class="toolbar-sticky">
            <Toolbar {editor} {onSave} />
        </div>
    {/if}

    <!-- 滚动容器，固定高度 -->
    <div class="editor-scroll-container">
        <!-- 编辑器挂载点 -->
        <div bind:this={editorElement} class="editor-mount"></div>
    </div>

    <!-- 气泡菜单 -->
    <div bind:this={bubbleMenuElement} class="bubble-menu">
        <button onclick={toggleBold} class:active={editor?.isActive('bold') ?? false}> B </button>
        <button onclick={toggleItalic} class:active={editor?.isActive('italic') ?? false}> I </button>
        <button onclick={toggleUnderline} class:active={editor?.isActive('underline') ?? false}> U </button>
    </div>
</div>

<style lang="scss">
    @use 'sass:color';

    $primary-color: #0d6efd;
    $border-color: #ccc;
    $bg-light: #f8f9fa;
    $text-color: #333;
    $radius: 6px;

    .editor-wrapper {
        font-family: system-ui, sans-serif;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        flex: 1 1 0;
        min-height: 0;
        overflow: hidden;
    }

    // 使用 :global 块包裹所有需要全局生效的样式
    :global {
        .ProseMirror {
            border: 1px solid $border-color;
            padding: 12px 16px;
            flex: 1;
            border-radius: $radius;
            outline: none;
            background: #fff;
            transition: border-color 0.2s;

            &:focus {
                border-color: $primary-color;
                box-shadow: 0 0 0 3px rgba($primary-color, 0.15);
            }

            h1 {
                font-size: 1.8rem;
                font-weight: 700;
                margin: 0.5em 0;
            }

            h2 {
                font-size: 1.4rem;
                font-weight: 600;
                margin: 0.5em 0;
            }

            p {
                margin: 0.5em 0;
                line-height: 1.6;
            }
        }
    }

    .editor-wrapper {
        .toolbar-sticky {
            position: sticky;
            top: 0;
            z-index: 1;
            flex-shrink: 0; /* 防止被压缩 */
            display: flex;
            gap: 4px;
            margin-bottom: 8px;
            padding: 6px 10px;
            border: 1px solid $border-color;
            border-radius: $radius;
            background: $bg-light;
            flex-wrap: wrap;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .editor-scroll-container {
            min-height: 0;
            height: 100%;
            overflow-x: hidden;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
        }

        .editor-mount {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .bubble-menu {
            position: absolute;
            display: flex;
            gap: 2px;
            background: #fff;
            border: 1px solid $border-color;
            border-radius: 8px;
            padding: 4px 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);

            /* 默认隐藏，防止启动时显示 */
            visibility: hidden;
            opacity: 0;
            pointer-events: none;

            button {
                padding: 4px 10px;
                font-size: 14px;
            }
        }
    }

    /* Tiptap 控制显示时的样式 */
    :global(.bubble-menu[style*='visibility: visible']),
    :global(.bubble-menu[data-tippy-root]) {
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
    }
</style>
