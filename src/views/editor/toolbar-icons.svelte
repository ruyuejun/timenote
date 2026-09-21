<!-- 字体相关字形图标（与 editor-web 一致） -->
<script lang="ts">
	interface Props {
		kind: 'increase' | 'decrease' | 'sup' | 'sub' | 'color'
		color?: string
	}

	let { kind, color = '#1f2329' }: Props = $props()
</script>

{#if kind === 'increase'}
	<span class="toolbar-letter-icon">A<sup>+</sup></span>
{:else if kind === 'decrease'}
	<span class="toolbar-letter-icon">A<sup>−</sup></span>
{:else if kind === 'sup'}
	<span class="toolbar-letter-icon">x<sup>2</sup></span>
{:else if kind === 'sub'}
	<span class="toolbar-letter-icon">x<sub>2</sub></span>
{:else}
	<span class="toolbar-font-color-icon">
		<span>A</span>
		<i style:background={color}></i>
	</span>
{/if}

<style>
	.toolbar-letter-icon {
		display: inline-flex;
		align-items: baseline;
		font-size: 13px;
		font-weight: 600;
		line-height: 1;
	}
	.toolbar-letter-icon :global(sup),
	.toolbar-letter-icon :global(sub) {
		font-size: 0.7em;
	}
	.toolbar-font-color-icon {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		line-height: 1;
		font-weight: 700;
		font-size: 13px;
	}
	.toolbar-font-color-icon i {
		display: block;
		width: 14px;
		height: 3px;
		margin-top: 1px;
		border-radius: 1px;
	}
</style>
