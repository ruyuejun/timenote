<script lang="ts">
	import type { Editor } from '@tiptap/core';
	import { Bold, Italic, Underline, Undo2, Redo2, Save } from '@lucide/svelte';

	const { editor, onSave }: { editor: Editor; onSave?: () => void } = $props();
</script>

{#if editor}
	<div class="toolbar-inner">
		<div class="toolbar-left">
			<button
				onclick={() => editor.chain().focus().toggleBold().run()}
				class:active={editor.isActive('bold')}
				data-tooltip="加粗"
				aria-label="加粗"
			>
				<Bold class="h-4 w-4" />
			</button>

			<button
				onclick={() => editor.chain().focus().toggleItalic().run()}
				class:active={editor.isActive('italic')}
				data-tooltip="斜体"
				aria-label="斜体"
			>
				<Italic class="h-4 w-4" />
			</button>

			<button
				onclick={() => editor.chain().focus().toggleUnderline().run()}
				class:active={editor.isActive('underline')}
				data-tooltip="下划线"
				aria-label="下划线"
			>
				<Underline class="h-4 w-4" />
			</button>

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
				<button onclick={onSave} class="save-button" data-tooltip="保存文件" aria-label="保存文件">
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
		width: 100%;

		.toolbar-left {
			display: flex;
			gap: 4px;
			flex-wrap: wrap;
		}

		.toolbar-right {
			display: flex;
			gap: 4px;
			flex-shrink: 0;
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

			&:hover {
				background: #e9ecef;
			}

			&.active {
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
