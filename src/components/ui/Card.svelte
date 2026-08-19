<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements'
    import { cn } from '@/utils/clsx.util'
    import { tv, type VariantProps } from 'tailwind-variants'

    const cardVariants = tv({
        base: 'rounded-2xl',
        variants: {
            variant: {
                default: 'glass',
                strong: 'glass-strong',
                flat: 'card',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    })

    interface Props extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
        strong?: boolean
        flat?: boolean
        children?: import('svelte').Snippet
    }

    let { strong, flat, variant, class: className, children, ...rest }: Props = $props()

    // 兼容旧的 props - 使用 $derived 使其响应式
    const computedVariant = $derived(flat ? 'flat' : strong ? 'strong' : variant || 'default')
</script>

<div class={cn(cardVariants({ variant: computedVariant }), className)} {...rest}>
    {#if children}
        {@render children()}
    {/if}
</div>
