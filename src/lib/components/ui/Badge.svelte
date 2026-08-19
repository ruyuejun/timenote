<script lang="ts" module>
    import { type VariantProps, tv } from 'tailwind-variants'

    export const badgeVariants = tv({
        base: 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium transition-colors',
        variants: {
            tone: {
                success: 'bg-emerald-100 text-emerald-700',
                warning: 'bg-amber-100 text-amber-700',
                danger: 'bg-rose-100 text-rose-600',
                info: 'bg-brand-100 text-brand-700',
                neutral: 'bg-ink-100 text-ink-600',
            },
        },
        defaultVariants: {
            tone: 'neutral',
        },
    })

    export type BadgeTone = VariantProps<typeof badgeVariants>['tone']
</script>

<script lang="ts">
    import { cn } from '$lib/utils.js'
    import type { HTMLAttributes } from 'svelte/elements'

    interface Props extends HTMLAttributes<HTMLSpanElement> {
        tone?: BadgeTone
        children?: import('svelte').Snippet
    }

    let { tone = 'neutral', class: className, children, ...rest }: Props = $props()
</script>

<span class={cn(badgeVariants({ tone }), className)} {...rest}>
    {#if children}
        {@render children()}
    {/if}
</span>
