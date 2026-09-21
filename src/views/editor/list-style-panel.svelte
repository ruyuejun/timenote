<script lang="ts">
	import type { Editor } from '@tiptap/core'
	import {
		applyBulletListStyle,
		applyOrderedListStyle,
		BULLET_LIST_STYLES,
		currentBulletStyle,
		currentOrderedStyle,
		ORDERED_LIST_STYLES,
	} from '$lib/editor-lists'

	interface Props {
		editor: Editor
		kind: 'ordered' | 'bullet'
	}

	let { editor, kind }: Props = $props()
	let tick = $state(0)

	$effect(() => {
		const update = () => {
			tick += 1
		}
		editor.on('transaction', update)
		return () => editor.off('transaction', update)
	})

	const isOrdered = $derived(kind === 'ordered')
	const options = $derived(isOrdered ? ORDERED_LIST_STYLES : BULLET_LIST_STYLES)
	const current = $derived.by(() => {
		tick
		return isOrdered ? currentOrderedStyle(editor) : currentBulletStyle(editor)
	})
</script>

<div class="list-style-panel">
	<div class="list-style-title">{isOrdered ? '编号' : '预设样式'}</div>
	<div class="list-style-grid" class:is-ol={isOrdered} class:is-ul={!isOrdered}>
		{#each options as option (option.key)}
			<button
				type="button"
				class="list-style-tile"
				class:is-active={current === option.key}
				onclick={() =>
					isOrdered
						? applyOrderedListStyle(editor, option.key)
						: applyBulletListStyle(editor, option.key)}
			>
				{#if option.key === 'none'}
					<span class="list-style-none">无</span>
				{:else}
					<span class="list-style-preview">
						{#each option.preview as mark, index}
							<span class="list-style-row">
								<em>{mark}</em>
								<i></i>
							</span>
						{/each}
					</span>
				{/if}
			</button>
		{/each}
	</div>
</div>
