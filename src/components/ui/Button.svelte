<script lang="ts">
    import type { HTMLButtonAttributes } from 'svelte/elements'
    import { cn } from '@/utils/clsx.util'
    import { tv, type VariantProps } from 'tailwind-variants'

    const buttonVariants = tv({
        base: 'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50',
        variants: {
            variant: {
                primary: 'bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-float hover:brightness-105',
                secondary: 'glass text-ink-800 hover:bg-white/80',
                ghost: 'text-ink-700 hover:bg-ink-100',
                danger: 'bg-acc-rose text-white shadow-float hover:brightness-105',
            },
            size: {
                sm: 'h-8 px-3 text-[12.5px] rounded-lg',
                md: 'h-9 px-4 text-[13px] rounded-xl',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    })

    interface Props extends HTMLButtonAttributes, VariantProps<typeof buttonVariants> {
        children?: import('svelte').Snippet
    }

    let { variant, size, class: className, children, ...rest }: Props = $props()
</script>

<button class={cn(buttonVariants({ variant, size }), className)} {...rest}>
    {#if children}
        {@render children()}
    {/if}
</button>
