<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '@/utils/clsx';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md';
		children?: import('svelte').Snippet;
	}

	let { variant = 'primary', size = 'md', class: className, children, ...rest }: Props = $props();

	const variants: Record<string, string> = {
		primary:
			'bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-float hover:brightness-105',
		secondary: 'glass text-ink-800 hover:bg-white/80',
		ghost: 'text-ink-700 hover:bg-ink-100',
		danger: 'bg-acc-rose text-white shadow-float hover:brightness-105'
	};

	const sizes: Record<string, string> = {
		sm: 'h-8 px-3 text-[12.5px] rounded-lg',
		md: 'h-9 px-4 text-[13px] rounded-xl'
	};
</script>

<button
	class={cn(
		'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50',
		variants[variant],
		sizes[size],
		className
	)}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</button>
