<script lang="ts">
	import { dismiss, toast } from '$lib/toast'
</script>

<div class="toast-host" aria-live="polite">
	{#each $toast as item (item.id)}
		<button type="button" class="toast-item toast-{item.kind}" onclick={() => dismiss(item.id)}>
			{item.text}
		</button>
	{/each}
</div>

<style>
	.toast-host {
		position: fixed;
		top: 20px;
		left: 50%;
		z-index: 4000;
		display: flex;
		flex-direction: column;
		gap: 8px;
		transform: translateX(-50%);
		pointer-events: none;
	}
	.toast-item {
		pointer-events: auto;
		min-width: 180px;
		max-width: 420px;
		padding: 10px 16px;
		border: 0;
		border-radius: 8px;
		color: #fff;
		font-size: 13px;
		line-height: 1.5;
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.16);
		cursor: pointer;
	}
	.toast-success {
		background: #17b26a;
	}
	.toast-error {
		background: #f04438;
	}
	.toast-info {
		background: #3370ff;
	}
</style>
