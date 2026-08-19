<script lang="ts">
    import { tabsStore } from '@/stores/editor.store'
    import { remoteSpaceMockData, type RemoteFileItem } from '@/mock/sidebar.mock'
    import { ChevronDown, ChevronRight, File, FileText, Folder, FolderOpen, FolderPlus } from '@lucide/svelte'

    let directories = $state<{ path: string; name: string; expanded: boolean; children?: { name: string; path: string; isDirectory: boolean }[] }[]>([])
    let mockExpanded = $state(new Set<string>())

    function fileIcon(name: string, directory: boolean) {
        if (directory) return Folder
        return /\.(md|txt|docx?)$/i.test(name) ? FileText : File
    }

    function toggleMock(path: string) {
        mockExpanded = new Set(mockExpanded.has(path) ? [...mockExpanded].filter(item => item !== path) : [...mockExpanded, path])
    }

    function openMock(item: RemoteFileItem) {
        if (!item.isDirectory) tabsStore.openTab(item.path, `# 文件内容\n\n这是来自工作空间的文件：${item.path}`)
    }

    async function addDirectory() {
        if (window.electron) {
            const path = await window.electron.openDirectoryDialog()
            if (path && !directories.some(item => item.path === path))
                directories = [...directories, { path, name: path.split('/').pop() || path, expanded: false }]
        }
    }

    async function toggleLocal(directory: typeof directories[number]) {
        if (!directory.children && window.electron) directory.children = await window.electron.readDirectory(directory.path)
        directory.expanded = !directory.expanded
        directories = [...directories]
    }

    async function openLocal(path: string) {
        if (window.electron) {
            const content = await window.electron.readFile(path)
            tabsStore.openTab(path, content)
        }
    }
</script>

<div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div class="flex items-center justify-between border-b border-white/50 px-3 py-2">
        <span class="text-xs font-semibold text-ink-600">工作空间</span>
        <button
            type="button"
            onclick={addDirectory}
            title="添加本地目录"
            aria-label="添加本地目录"
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-white/60 hover:text-brand-600">
            <FolderPlus class="h-4 w-4" />
        </button>
    </div>
    <nav class="min-h-0 flex-1 space-y-0.5 overflow-auto p-2">
        {#each remoteSpaceMockData as item}
            {@const Icon = fileIcon(item.name, item.isDirectory)}
            <div class="space-y-0.5">
                <button
                    type="button"
                    onclick={() => (item.isDirectory ? toggleMock(item.path) : openMock(item))}
                    class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-ink-700 hover:bg-white/60">
                    {#if item.isDirectory}
                        {#if mockExpanded.has(item.path)}
                            <FolderOpen class="h-4 w-4 shrink-0 text-brand-500" />
                        {:else}
                            <Folder class="h-4 w-4 shrink-0 text-ink-400" />
                        {/if}
                    {:else}
                        <Icon class="h-4 w-4 shrink-0 text-ink-400" />
                    {/if}
                    <span class="flex-1 truncate">{item.name}</span>
                    {#if item.isDirectory}
                        {#if mockExpanded.has(item.path)}
                            <ChevronDown class="h-3.5 w-3.5 shrink-0" />
                        {:else}
                            <ChevronRight class="h-3.5 w-3.5 shrink-0" />
                        {/if}
                    {/if}
                </button>
                {#if item.isDirectory && mockExpanded.has(item.path)}
                    <div class="ml-4 space-y-0.5 border-l border-ink-200 pl-2">
                        {#each item.children ?? [] as child}
                            {@const ChildIcon = fileIcon(child.name, child.isDirectory)}
                            <button
                                type="button"
                                onclick={() => (child.isDirectory ? toggleMock(child.path) : openMock(child))}
                                class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-ink-600 hover:bg-white/60">
                                <ChildIcon class="h-3.5 w-3.5 shrink-0 text-ink-400" />
                                <span class="truncate">{child.name}</span>
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}

        {#if directories.length > 0}
            <div class="my-2 border-t border-ink-200 pt-2"></div>
            {#each directories as directory}
                <div class="space-y-0.5">
                    <button
                        type="button"
                        onclick={() => toggleLocal(directory)}
                        class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-ink-700 hover:bg-white/60">
                        {#if directory.expanded}
                            <FolderOpen class="h-4 w-4 shrink-0 text-brand-500" />
                        {:else}
                            <Folder class="h-4 w-4 shrink-0 text-ink-400" />
                        {/if}
                        <span class="flex-1 truncate">{directory.name}</span>
                        {#if directory.expanded}
                            <ChevronDown class="h-3.5 w-3.5 shrink-0" />
                        {:else}
                            <ChevronRight class="h-3.5 w-3.5 shrink-0" />
                        {/if}
                    </button>
                    {#if directory.expanded}
                        <div class="ml-4 space-y-0.5 border-l border-ink-200 pl-2">
                            {#each directory.children ?? [] as item}
                                {@const Icon = fileIcon(item.name, item.isDirectory)}
                                <button
                                    type="button"
                                    onclick={() => !item.isDirectory && openLocal(item.path)}
                                    class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-ink-600 hover:bg-white/60">
                                    <Icon class="h-3.5 w-3.5 shrink-0 text-ink-400" />
                                    <span class="truncate">{item.name}</span>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        {/if}
    </nav>
</div>
