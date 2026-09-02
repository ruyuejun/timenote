<script lang="ts">
    import type { Editor } from "@tiptap/core";
    import {
        Bold,
        Italic,
        Underline,
        Undo2,
        Redo2,
        Save,
        ChevronDown,
        Highlighter,
        Type,
        TextAlignStart,
        TextAlignCenter,
        TextAlignEnd,
        TextAlignJustify,
    } from "@lucide/svelte";
    import {
        DEFAULT_FONT,
        FONT_FAMILIES,
        matchFontFamily,
    } from "./font-families";

    const { editor, onSave }: { editor: Editor; onSave?: () => void } =
        $props();

    const FONT_SIZES = [
        { label: "初号", value: "42pt" },
        { label: "小初", value: "36pt" },
        { label: "一号", value: "26pt" },
        { label: "小一", value: "24pt" },
        { label: "二号", value: "22pt" },
        { label: "小二", value: "18pt" },
        { label: "三号", value: "16pt" },
        { label: "小三", value: "15pt" },
        { label: "四号", value: "14pt" },
        { label: "小四", value: "12pt" },
        { label: "五号", value: "10.5pt" },
        { label: "小五", value: "9pt" },
        { label: "六号", value: "7.5pt" },
        { label: "小六", value: "6.5pt" },
        { label: "七号", value: "5.5pt" },
        { label: "八号", value: "5pt" },
    ] as const;

    const DEFAULT_SIZE = "12pt";

    const TEXT_COLORS = [
        "#000000",
        "#c0392b",
        "#d35400",
        "#f1c40f",
        "#27ae60",
        "#2980b9",
        "#8e44ad",
        "#7f8c8d",
    ];
    const HIGHLIGHT_COLORS = [
        "#ffff00",
        "#00ff00",
        "#00ffff",
        "#ff99cc",
        "#ffc000",
        "#92d050",
        "#00b0f0",
        "#d9e1f2",
    ];

    const BLOCK_STYLES = [
        { id: "paragraph", label: "正文" },
        { id: "h1", label: "标题 1", level: 1 as const },
        { id: "h2", label: "标题 2", level: 2 as const },
        { id: "h3", label: "标题 3", level: 3 as const },
        { id: "h4", label: "标题 4", level: 4 as const },
        { id: "h5", label: "标题 5", level: 5 as const },
        { id: "h6", label: "标题 6", level: 6 as const },
    ];

    const ALIGNS = [
        { value: "left" as const, label: "左对齐", Icon: TextAlignStart },
        { value: "center" as const, label: "居中对齐", Icon: TextAlignCenter },
        { value: "right" as const, label: "右对齐", Icon: TextAlignEnd },
        {
            value: "justify" as const,
            label: "两端对齐",
            Icon: TextAlignJustify,
        },
    ];

    let tick = $state(0);
    let sizeOpen = $state(false);
    let fontOpen = $state(false);
    let colorOpen = $state(false);
    let highlightOpen = $state(false);
    let blockOpen = $state(false);
    let sizeWrap = $state<HTMLDivElement | null>(null);
    let fontWrap = $state<HTMLDivElement | null>(null);
    let colorWrap = $state<HTMLDivElement | null>(null);
    let highlightWrap = $state<HTMLDivElement | null>(null);
    let blockWrap = $state<HTMLDivElement | null>(null);
    let savedFrom = 1;
    let savedTo = 1;

    function rememberSelection() {
        savedFrom = editor.state.selection.from;
        savedTo = editor.state.selection.to;
    }

    $effect(() => {
        const update = () => {
            tick += 1;
        };
        editor.on("transaction", update);
        editor.on("selectionUpdate", update);
        return () => {
            editor.off("transaction", update);
            editor.off("selectionUpdate", update);
        };
    });

    $effect(() => {
        if (
            !sizeOpen &&
            !fontOpen &&
            !colorOpen &&
            !highlightOpen &&
            !blockOpen
        )
            return;
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (
                sizeWrap?.contains(target) ||
                fontWrap?.contains(target) ||
                colorWrap?.contains(target) ||
                highlightWrap?.contains(target) ||
                blockWrap?.contains(target)
            )
                return;
            sizeOpen = false;
            fontOpen = false;
            colorOpen = false;
            highlightOpen = false;
            blockOpen = false;
        };
        window.addEventListener("pointerdown", onPointerDown);
        return () => window.removeEventListener("pointerdown", onPointerDown);
    });

    function currentFontFamily() {
        void tick;
        return (
            (editor.getAttributes("textStyle").fontFamily as
                | string
                | undefined) || DEFAULT_FONT
        );
    }

    function currentFont() {
        return matchFontFamily(currentFontFamily());
    }

    function currentFontLabel() {
        return currentFont().label;
    }

    function setFontFamily(value: string) {
        editor.chain().focus().setFontFamily(value).run();
        fontOpen = false;
    }

    function currentFontSize() {
        void tick;
        return (
            (editor.getAttributes("textStyle").fontSize as
                | string
                | undefined) || DEFAULT_SIZE
        );
    }

    function currentSizeLabel() {
        const size = currentFontSize();
        return (
            FONT_SIZES.find((item) => item.value === size)?.label ??
            size.replace("pt", "")
        );
    }

    function currentColor() {
        void tick;
        return (
            (editor.getAttributes("textStyle").color as string | undefined) ||
            "#000000"
        );
    }

    function currentHighlight() {
        void tick;
        return (
            (editor.getAttributes("textStyle").backgroundColor as
                | string
                | undefined) || ""
        );
    }

    function sizeIndex() {
        const size = currentFontSize();
        const index = FONT_SIZES.findIndex((item) => item.value === size);
        return index === -1
            ? FONT_SIZES.findIndex((item) => item.value === DEFAULT_SIZE)
            : index;
    }

    function setFontSize(value: string) {
        editor.chain().focus().setFontSize(value).run();
        sizeOpen = false;
    }

    function stepFontSize(delta: number) {
        const next =
            FONT_SIZES[
                Math.min(
                    FONT_SIZES.length - 1,
                    Math.max(0, sizeIndex() + delta),
                )
            ];
        if (next) editor.chain().focus().setFontSize(next.value).run();
    }

    function setColor(value: string, close = true) {
        editor.chain().focus().setColor(value).run();
        if (close) colorOpen = false;
    }

    function clearColor() {
        editor.chain().focus().unsetColor().run();
        colorOpen = false;
    }

    function setHighlight(value: string) {
        editor.chain().focus().setBackgroundColor(value).run();
        highlightOpen = false;
    }

    function clearHighlight() {
        editor.chain().focus().unsetBackgroundColor().run();
        highlightOpen = false;
    }

    function togglePanel(
        panel: "size" | "font" | "color" | "highlight" | "block",
    ) {
        sizeOpen = panel === "size" ? !sizeOpen : false;
        fontOpen = panel === "font" ? !fontOpen : false;
        colorOpen = panel === "color" ? !colorOpen : false;
        highlightOpen = panel === "highlight" ? !highlightOpen : false;
        blockOpen = panel === "block" ? !blockOpen : false;
    }

    function currentBlockId() {
        void tick;
        for (const level of [1, 2, 3, 4, 5, 6] as const) {
            if (editor.isActive("heading", { level })) return `h${level}`;
        }
        return "paragraph";
    }

    function currentBlockLabel() {
        return (
            BLOCK_STYLES.find((item) => item.id === currentBlockId())?.label ??
            "正文"
        );
    }

    function setBlock(id: string, level?: 1 | 2 | 3 | 4 | 5 | 6) {
        const chain = editor
            .chain()
            .setTextSelection({ from: savedFrom, to: savedTo });
        if (id === "paragraph") chain.setParagraph();
        else if (level) chain.setHeading({ level });
        chain.run();
        blockOpen = false;
    }

    function currentAlign() {
        void tick;
        if (editor.isActive({ textAlign: "justify" })) return "justify";
        if (editor.isActive({ textAlign: "center" })) return "center";
        if (editor.isActive({ textAlign: "right" })) return "right";
        if (editor.isActive({ textAlign: "left" })) return "left";
        const size = editor.state.doc.content.size;
        const pos = Math.min(Math.max(1, savedFrom), Math.max(1, size - 1));
        return (
            (editor.state.doc.resolve(pos).parent.attrs.textAlign as
                | string
                | undefined) || "left"
        );
    }

    function isAlign(value: "left" | "center" | "right" | "justify") {
        return currentAlign() === value;
    }

    function setAlign(value: "left" | "center" | "right" | "justify") {
        editor
            .chain()
            .focus()
            .setTextSelection({ from: savedFrom, to: savedTo })
            .setTextAlign(value)
            .run();
    }
</script>

{#if editor}
	<div class="toolbar-inner" role="toolbar" tabindex="-1" onpointerdown={rememberSelection}>
        <div class="toolbar-left">
            <div class="dropdown" bind:this={fontWrap}>
                <button
                    type="button"
                    class="font-trigger"
                    class:open={fontOpen}
                    style:font-family={currentFontFamily()}
                    onclick={() => togglePanel("font")}
                    data-tooltip="字体"
                    aria-label="字体"
                    aria-expanded={fontOpen}
                >
                    <span>{currentFontLabel()}</span>
                    <ChevronDown class="h-3.5 w-3.5" />
                </button>
                {#if fontOpen}
                    <div class="menu size-menu font-menu" role="listbox">
                        {#each FONT_FAMILIES as item}
                            <button
                                type="button"
                                class:active={currentFont().id === item.id}
                                style:font-family={item.css}
                                onclick={() => setFontFamily(item.css)}
                            >
                                {item.label}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>

            <div class="dropdown" bind:this={sizeWrap}>
                <button
                    type="button"
                    class="size-trigger"
                    class:open={sizeOpen}
                    onclick={() => togglePanel("size")}
                    data-tooltip="字号"
                    aria-label="字号"
                    aria-expanded={sizeOpen}
                >
                    <span>{currentSizeLabel()}</span>
                    <ChevronDown class="h-3.5 w-3.5" />
                </button>
                {#if sizeOpen}
                    <div class="menu size-menu" role="listbox">
                        {#each FONT_SIZES as item}
                            <button
                                type="button"
                                class:active={currentFontSize() === item.value}
                                onclick={() => setFontSize(item.value)}
                            >
                                {item.label}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>

            <button
                type="button"
                class="size-step"
                onclick={() => stepFontSize(-1)}
                disabled={sizeIndex() === 0}
                data-tooltip="增大字号"
                aria-label="增大字号"
            >
                <span>A<sup>+</sup></span>
            </button>

            <button
                type="button"
                class="size-step"
                onclick={() => stepFontSize(1)}
                disabled={sizeIndex() === FONT_SIZES.length - 1}
                data-tooltip="减小字号"
                aria-label="减小字号"
            >
                <span>A<sup>−</sup></span>
            </button>

            <button
                onclick={() => editor.chain().focus().toggleBold().run()}
                class:active={editor.isActive("bold")}
                data-tooltip="加粗"
                aria-label="加粗"
            >
                <Bold class="h-4 w-4" />
            </button>

            <button
                onclick={() => editor.chain().focus().toggleItalic().run()}
                class:active={editor.isActive("italic")}
                data-tooltip="斜体"
                aria-label="斜体"
            >
                <Italic class="h-4 w-4" />
            </button>

            <button
                onclick={() => editor.chain().focus().toggleUnderline().run()}
                class:active={editor.isActive("underline")}
                data-tooltip="下划线"
                aria-label="下划线"
            >
                <Underline class="h-4 w-4" />
            </button>

            <div class="dropdown" bind:this={colorWrap}>
                <button
                    type="button"
                    class="swatch-trigger"
                    class:open={colorOpen}
                    onclick={() => togglePanel("color")}
                    data-tooltip="字体颜色"
                    aria-label="字体颜色"
                    aria-expanded={colorOpen}
                >
                    <span class="letter" style:color={currentColor()}>A</span>
                    <span class="bar" style:background={currentColor()}></span>
                </button>
                {#if colorOpen}
                    <div class="menu palette">
                        <button type="button" class="clear" onclick={clearColor}
                            >自动</button
                        >
                        <div class="swatches">
                            {#each TEXT_COLORS as color}
                                <button
                                    type="button"
                                    class="swatch"
                                    class:active={currentColor().toLowerCase() ===
                                        color}
                                    style:background={color}
                                    aria-label={color}
                                    onclick={() => setColor(color)}
                                ></button>
                            {/each}
                        </div>
                        <label class="custom">
                            自定义
                            <input
                                type="color"
                                value={currentColor()}
                                oninput={(e) =>
                                    setColor(e.currentTarget.value, false)}
                            />
                        </label>
                    </div>
                {/if}
            </div>

            <div class="dropdown" bind:this={highlightWrap}>
                <button
                    type="button"
                    class="swatch-trigger"
                    class:open={highlightOpen}
                    onclick={() => togglePanel("highlight")}
                    data-tooltip="高亮"
                    aria-label="高亮"
                    aria-expanded={highlightOpen}
                >
                    <Highlighter class="h-4 w-4" />
                    <span
                        class="bar"
                        style:background={currentHighlight() || "#ffff00"}
                    ></span>
                </button>
                {#if highlightOpen}
                    <div class="menu palette">
                        <button
                            type="button"
                            class="clear"
                            onclick={clearHighlight}>无高亮</button
                        >
                        <div class="swatches">
                            {#each HIGHLIGHT_COLORS as color}
                                <button
                                    type="button"
                                    class="swatch"
                                    class:active={currentHighlight().toLowerCase() ===
                                        color}
                                    style:background={color}
                                    aria-label={color}
                                    onclick={() => setHighlight(color)}
                                ></button>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>

            <div class="divider" aria-hidden="true"></div>

            <div class="dropdown" bind:this={blockWrap}>
                <button
                    type="button"
                    class="block-trigger"
                    class:open={blockOpen}
                    onclick={() => togglePanel("block")}
                    data-tooltip="段落样式"
                    aria-label="段落样式"
                    aria-expanded={blockOpen}
                >
                    <Type class="h-4 w-4" />
                    <span>{currentBlockLabel()}</span>
                    <ChevronDown class="h-3.5 w-3.5" />
                </button>
                {#if blockOpen}
                    <div class="menu size-menu block-menu" role="listbox">
                        {#each BLOCK_STYLES as item}
                            <button
                                type="button"
                                class="block-item"
                                class:active={currentBlockId() === item.id}
                                class:h1={item.id === "h1"}
                                class:h2={item.id === "h2"}
                                class:h3={item.id === "h3"}
                                onclick={() => setBlock(item.id, item.level)}
                            >
                                {item.label}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>

            {#each ALIGNS as item}
                <button
                    type="button"
                    class:active={isAlign(item.value)}
                    onclick={() => setAlign(item.value)}
                    data-tooltip={item.label}
                    aria-label={item.label}
                >
                    <item.Icon class="h-4 w-4" />
                </button>
            {/each}

            <button
                onclick={() => editor.chain().focus().undo().run()}
                data-tooltip="撤销"
                aria-label="撤销"
            >
                <Undo2 class="h-4 w-4" />
            </button>

            <button
                onclick={() => editor.chain().focus().redo().run()}
                data-tooltip="重做"
                aria-label="重做"
            >
                <Redo2 class="h-4 w-4" />
            </button>
        </div>

        {#if onSave}
            <div class="toolbar-right">
                <button
                    onclick={onSave}
                    class="save-button"
                    data-tooltip="保存文件"
                    aria-label="保存文件"
                >
                    <Save class="h-4 w-4" />
                </button>
            </div>
        {/if}
    </div>
{/if}

<style lang="scss">
    .toolbar-inner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;

        .toolbar-left {
            display: flex;
            align-items: center;
            gap: 4px;
            flex-wrap: wrap;
        }

        .toolbar-right {
            display: flex;
            gap: 4px;
            flex-shrink: 0;
        }

        .dropdown {
            position: relative;

            &:has(.menu) > button[data-tooltip]::after {
                display: none;
            }
        }

        button {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
            border: 1px solid transparent;
            background: transparent;
            border-radius: 4px;
            cursor: pointer;
            color: #333;
            transition: all 0.15s;

            &:hover:not(:disabled) {
                background: #e9ecef;
            }

            &:disabled {
                opacity: 0.4;
                cursor: default;
            }

            &.active,
            &.open {
                background: #e9ecef;
            }

            &.active:is(
                    [aria-label="加粗"],
                    [aria-label="斜体"],
                    [aria-label="下划线"]
                ) {
                background: #0d6efd;
                color: #fff;
                border-color: #0d6efd;
            }

            &[data-tooltip]::after {
                content: attr(data-tooltip);
                position: absolute;
                top: calc(100% + 6px);
                left: 50%;
                transform: translateX(-50%);
                padding: 4px 8px;
                border-radius: 6px;
                background: #3f3f46;
                color: #fff;
                font-size: 12px;
                line-height: 1.3;
                white-space: nowrap;
                pointer-events: none;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.12s ease;
                z-index: 20;
            }

            &[data-tooltip]:hover::after {
                opacity: 1;
                visibility: visible;
            }
        }

        .divider {
            width: 1px;
            height: 18px;
            margin: 0 4px;
            background: #d1d5db;
            flex-shrink: 0;
        }

        .size-trigger {
            min-width: 58px;
            gap: 2px;
            padding: 4px 6px;
            font-size: 13px;
        }

        .font-trigger {
            min-width: 108px;
            max-width: 148px;
            gap: 2px;
            padding: 4px 6px;
            font-size: 13px;

            span {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .font-menu {
            min-width: 148px;
            max-height: 320px;
        }

        .block-trigger {
            gap: 4px;
            padding: 4px 6px;
            font-size: 13px;
            white-space: nowrap;
        }

        .block-menu {
            min-width: 120px;

            .block-item.h1 {
                font-size: 20px;
                font-weight: 700;
            }

            .block-item.h2 {
                font-size: 16px;
                font-weight: 600;
            }

            .block-item.h3 {
                font-size: 14px;
                font-weight: 600;
            }
        }

        .size-step {
            min-width: 28px;
            font-size: 13px;
            font-weight: 600;

            sup {
                font-size: 10px;
                line-height: 0;
            }
        }

        .swatch-trigger {
            flex-direction: column;
            gap: 2px;
            padding: 4px 6px 5px;
            min-width: 28px;

            .letter {
                font-size: 13px;
                font-weight: 700;
                line-height: 1;
            }

            .bar {
                display: block;
                width: 16px;
                height: 3px;
                border-radius: 1px;
            }
        }

        .menu {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            z-index: 30;
            min-width: 88px;
            padding: 4px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #fff;
            box-shadow: 0 8px 24px rgba(15, 17, 40, 0.12);
        }

        .size-menu {
            max-height: 280px;
            overflow-y: auto;

            button {
                width: 100%;
                justify-content: flex-start;
                padding: 6px 10px;
                border-radius: 4px;
                font-size: 13px;

                &.active {
                    background: #eef2ff;
                    color: #4338ca;
                }
            }
        }

        .palette {
            width: 148px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 8px;
        }

        .clear,
        .custom {
            width: 100%;
            justify-content: flex-start;
            padding: 4px 6px;
            font-size: 12px;
            color: #6b7280;
        }

        .custom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            cursor: pointer;

            input {
                width: 28px;
                height: 20px;
                padding: 0;
                border: none;
                background: none;
                cursor: pointer;
            }
        }

        .swatches {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
        }

        .swatch {
            width: 22px;
            height: 22px;
            padding: 0;
            border: 1px solid rgba(0, 0, 0, 0.12);
            border-radius: 4px;

            &.active {
                outline: 2px solid #6366f1;
                outline-offset: 1px;
            }
        }

        .save-button {
            padding: 6px 12px;
            background: #6366f1;
            color: #fff;
            border-color: #6366f1;

            &:hover {
                background: #4f46e5;
                border-color: #4f46e5;
            }
        }
    }
</style>
