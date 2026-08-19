<script lang="ts" module>
    import { type VariantProps, tv } from 'tailwind-variants'

    export const cardVariants = tv({
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

    export type CardVariant = VariantProps<typeof cardVariants>['variant']
</script>

<script lang="ts">
    import { cn } from '$lib/utils.js'
    import type { HTMLAttributes } from 'svelte/elements'

    interface Props extends HTMLAttributes<HTMLDivElement> {
        variant?: CardVariant
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
