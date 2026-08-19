<script lang="ts">
	import type { Editor } from '@tiptap/core';
	import { Save } from '@lucide/svelte';

	const { editor, onSave }: { editor: Editor; onSave?: () => void } = $props();
</script>

{#if editor}
	<div class="toolbar-inner">
		<div class="toolbar-left">
			<button
				onclick={() => editor.chain().focus().toggleBold().run()}
				class:active={editor.isActive('bold')}
			>
				Bold
			</button>

			<button
				onclick={() => editor.chain().focus().toggleItalic().run()}
				class:active={editor.isActive('italic')}
			>
				Italic
			</button>

			<button
				onclick={() => editor.chain().focus().toggleUnderline().run()}
				class:active={editor.isActive('underline')}
			>
				Underline
			</button>

			<button onclick={() => editor.chain().focus().undo().run()}> Undo </button>

			<button onclick={() => editor.chain().focus().redo().run()}> Redo </button>
		</div>

		{#if onSave}
			<div class="toolbar-right">
				<button onclick={onSave} class="save-button" title="保存文件">
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
			padding: 4px 14px;
			border: 1px solid transparent;
			background: transparent;
			border-radius: 4px;
			cursor: pointer;
			font-size: 14px;
			font-weight: 500;
			transition: all 0.15s;

			&:hover {
				background: #e9ecef;
			}

			&.active {
				background: #0d6efd;
				color: #fff;
				border-color: #0d6efd;
			}
		}

		.save-button {
			display: flex;
			align-items: center;
			gap: 6px;
			padding: 4px 12px;
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
