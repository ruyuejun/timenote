<script lang="ts">
	interface Props {
		open: boolean
		title?: string
		wide?: boolean
		onClose: () => void
		children?: import('svelte').Snippet
		footer?: import('svelte').Snippet
	}

	let { open, title = '', wide = false, onClose, children, footer }: Props = $props()
</script>

{#if open}
	<div class="modal-root">
		<button type="button" class="modal-mask" aria-label="关闭" onclick={onClose}></button>
		<div class="modal-panel" class:is-wide={wide} role="dialog" aria-modal="true">
			{#if title}
				<div class="modal-head">
					<h3>{title}</h3>
					<button type="button" class="modal-x" onclick={onClose} aria-label="关闭">×</button>
				</div>
			{/if}
			<div class="modal-body">
				{#if children}{@render children()}{/if}
			</div>
			{#if footer}
				<div class="modal-foot">{@render footer()}</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-root {
		position: fixed;
		inset: 0;
		z-index: 3000;
		display: grid;
		place-items: center;
	}
	.modal-mask {
		position: absolute;
		inset: 0;
		border: 0;
		background: rgb(15 23 42 / 0.45);
	}
	.modal-panel {
		position: relative;
		z-index: 1;
		width: min(520px, calc(100vw - 32px));
		max-height: calc(100vh - 48px);
		overflow: auto;
		background: #fff;
		border-radius: 10px;
		box-shadow: 0 16px 48px rgb(0 0 0 / 0.2);
	}
	.modal-panel.is-wide {
		width: min(960px, calc(100vw - 32px));
	}
	.modal-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid #e8eaed;
	}
	.modal-head h3 {
		margin: 0;
		font-size: 16px;
	}
	.modal-x {
		border: 0;
		background: transparent;
		font-size: 22px;
		line-height: 1;
		color: #646a73;
		cursor: pointer;
	}
	.modal-body {
		padding: 20px;
	}
	.modal-foot {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		padding: 12px 20px 16px;
		border-top: 1px solid #e8eaed;
	}
</style>
