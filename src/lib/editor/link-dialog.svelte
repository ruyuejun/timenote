<script lang="ts">
    const {
        open = false,
        text = "",
        href = "",
        onConfirm,
        onCancel,
    }: {
        open?: boolean;
        text?: string;
        href?: string;
        onConfirm: (text: string, href: string) => void;
        onCancel: () => void;
    } = $props();

    let textValue = $state("");
    let hrefValue = $state("");
    let textInput = $state<HTMLInputElement | null>(null);

    $effect(() => {
        if (!open) return;
        textValue = text;
        hrefValue = href;
        queueMicrotask(() => textInput?.focus());
    });

    function submit(event: SubmitEvent) {
        event.preventDefault();
        const nextText = textValue.trim();
        const nextHref = hrefValue.trim();
        if (!nextText || !nextHref) return;
        onConfirm(nextText, nextHref);
    }

    function onKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") onCancel();
    }
</script>

{#if open}
	<div class="fixed inset-0 z-[200] flex items-center justify-center p-4">
		<button
			type="button"
			class="absolute inset-0 bg-black/35"
			aria-label="关闭弹层"
			onclick={onCancel}
		></button>
		<div
			class="relative z-10 w-full max-w-[440px] rounded-xl bg-white p-5 shadow-xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="link-dialog-title"
			tabindex="-1"
			onkeydown={onKeydown}
		>
            <div class="mb-3 flex items-center justify-between">
                <h2
                    id="link-dialog-title"
                    class="text-lg font-semibold text-ink-900"
                >
                    超链接
                </h2>
                <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                    aria-label="关闭"
                    onclick={onCancel}
                >
                    ×
                </button>
            </div>
            <div class="mb-4 h-px bg-ink-200"></div>
            <form class="flex flex-col gap-4" onsubmit={submit}>
                <label class="flex items-center gap-3">
                    <span class="w-12 shrink-0 text-sm text-ink-800"
                        ><span class="mr-0.5 text-acc-rose">*</span>文本</span
                    >
                    <input
                        bind:this={textInput}
                        class="h-9 min-w-0 flex-1 rounded-md border border-ink-300 px-3 text-sm text-ink-800 outline-none placeholder:text-ink-400 focus:border-brand-500"
                        placeholder="请输入文本"
                        bind:value={textValue}
                    />
                </label>
                <label class="flex items-center gap-3">
                    <span class="w-12 shrink-0 text-sm text-ink-800"
                        ><span class="mr-0.5 text-acc-rose">*</span>链接</span
                    >
                    <input
                        class="h-9 min-w-0 flex-1 rounded-md border border-ink-300 px-3 text-sm text-ink-800 outline-none placeholder:text-ink-400 focus:border-brand-500"
                        placeholder="请输入链接"
                        bind:value={hrefValue}
                    />
                </label>
                <div class="mt-1 flex justify-end gap-2">
                    <button
                        type="button"
                        class="h-9 rounded-md border border-ink-300 px-4 text-sm text-ink-700 hover:bg-ink-50"
                        onclick={onCancel}
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        class="h-9 rounded-md bg-brand-500 px-4 text-sm text-white hover:bg-brand-600"
                    >
                        确定
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
