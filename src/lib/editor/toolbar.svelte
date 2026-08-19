<script lang="ts">
	import type { Editor } from '@tiptap/core';

	const { editor }: { editor: Editor } = $props();
</script>

{#if editor}
	<div class="toolbar-inner">
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
{/if}

<style lang="scss">
	.toolbar-inner {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;

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
	}
</style>
