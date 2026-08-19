<script lang="ts">
    import { BookOpen } from '@lucide/svelte'
</script>

<nav class="flex shrink-0 gap-2 border-b border-white/50 px-3 py-2" aria-label="工作空间">
    <button
        type="button"
        title="工作空间"
        aria-label="工作空间"
        aria-pressed={true}
        class="group relative flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600 transition-colors">
        <BookOpen class="h-4.5 w-4.5 shrink-0" strokeWidth={1.8} />
        <span class="pointer-events-none absolute left-12 z-50 hidden whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-xs font-normal text-white shadow-lg group-hover:block">
            工作空间
        </span>
    </button>
</nav>
