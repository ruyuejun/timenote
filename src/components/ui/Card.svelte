<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '@/utils/clsx';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		strong?: boolean;
		flat?: boolean;
		children?: import('svelte').Snippet;
	}

	let { strong, flat, class: className, children, ...rest }: Props = $props();
</script>

<div
	class={cn(
		flat ? 'card' : strong ? 'glass-strong rounded-2xl' : 'glass rounded-2xl',
		className
	)}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</div>
