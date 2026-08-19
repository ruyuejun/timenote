<script lang="ts">
    import { FilePlus2, FolderPlus } from '@lucide/svelte'
    import { tabsStore } from '@/stores/editor.store'
    import { localFilesStore } from '@/stores/localFiles.store'

    function createFile() {
        tabsStore.createNewTab()
    }

    async function createFolder() {
        if (!window.electron) return

        const folderPath = await window.electron.createDirectoryDialog()
        if (folderPath) localFilesStore.addDirectory(folderPath)
    }
</script>

<section class="startup-page" aria-labelledby="startup-title">
    <div class="startup-content">
        <p class="eyebrow">启动页</p>
        <h1 id="startup-title">开始新的工作</h1>
        <p class="description">创建文档，或建立一个文件夹来组织本地内容。</p>

        <div class="actions">
            <button type="button" class="action-button action-button-primary" onclick={createFile}>
                <FilePlus2 class="h-5 w-5" />
                <span>创建文件</span>
            </button>
            <button type="button" class="action-button" onclick={createFolder}>
                <FolderPlus class="h-5 w-5" />
                <span>创建文件夹</span>
            </button>
        </div>
    </div>
</section>

<style>
    .startup-page {
        display: grid;
        flex: 1;
        min-height: 0;
        place-items: center;
        padding: 2rem;
    }

    .startup-content {
        width: min(100%, 34rem);
        transform: translateY(-5.5rem);
        text-align: center;
    }

    .eyebrow {
        margin: 0 0 0.75rem;
        color: var(--t-brand-600, #4f46e5);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    h1 {
        margin: 0;
        color: #1e2337;
        font-size: 1.75rem;
        font-weight: 700;
        line-height: 1.25;
    }

    .description {
        margin: 0.75rem auto 1.75rem;
        color: #6b7280;
        font-size: 0.875rem;
        line-height: 1.6;
    }

    .actions {
        display: flex;
        justify-content: center;
        gap: 0.75rem;
    }

    .action-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        min-width: 9rem;
        min-height: 2.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        background: rgb(255 255 255 / 0.84);
        color: #454c6a;
        font-size: 0.875rem;
        font-weight: 600;
        transition:
            background 0.15s,
            border-color 0.15s,
            color 0.15s;
    }

    .action-button:hover {
        border-color: var(--t-brand-300, #a5b4fc);
        background: var(--t-brand-50, #eef2ff);
        color: var(--t-brand-700, #4338ca);
    }

    .action-button-primary {
        border-color: var(--t-brand-500, #6366f1);
        background: var(--t-brand-500, #6366f1);
        color: #fff;
    }

    .action-button-primary:hover {
        border-color: var(--t-brand-600, #4f46e5);
        background: var(--t-brand-600, #4f46e5);
        color: #fff;
    }

    @media (max-width: 480px) {
        .startup-page {
            padding: 1.5rem;
        }

        .actions {
            flex-direction: column;
        }

        .action-button {
            width: 100%;
        }
    }
</style>
