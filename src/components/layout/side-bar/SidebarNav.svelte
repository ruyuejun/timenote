<script lang="ts">
    import { cn } from '$lib/clsx/clsx.lib'
    import { editorStore } from '@/stores/editor.store'
    import { remoteSpaceMockData, type RemoteFileItem } from '@/mock/sidebar.mock'
    import {
        BookText,
        Cloud,
        FolderPlus,
        ChevronDown,
        ChevronRight,
        Folder,
        FolderOpen,
        FileText,
        FileSpreadsheet,
        Presentation,
        File,
    } from '@lucide/svelte'

    interface Props {
        mobileOpen: boolean
        collapsed: boolean
        onNavigate?: () => void
    }

    interface FileSystemItem {
        name: string
        path: string
        isDirectory: boolean
        size: number
        modified: number
    }

    interface DirectoryNode {
        path: string
        name: string
        expanded: boolean
        children?: FileSystemItem[]
        childrenLoaded: boolean
    }

    let { mobileOpen, collapsed, onNavigate }: Props = $props()

    let localSpaceExpanded = $state(true)
    let directories = $state<Map<string, DirectoryNode>>(new Map())
    let expandedFolders = $state<Set<string>>(new Set())

    // 远程空间相关状态
    let remoteSpaceExpanded = $state(true)
    let remoteData = $state<RemoteFileItem[]>(remoteSpaceMockData)
    let remoteExpandedFolders = $state<Set<string>>(new Set())

    function toggleLocalSpace() {
        localSpaceExpanded = !localSpaceExpanded
    }

    function toggleRemoteSpace() {
        remoteSpaceExpanded = !remoteSpaceExpanded
    }

    function toggleRemoteFolder(folderPath: string) {
        if (remoteExpandedFolders.has(folderPath)) {
            remoteExpandedFolders.delete(folderPath)
        } else {
            remoteExpandedFolders.add(folderPath)
        }
        remoteExpandedFolders = new Set(remoteExpandedFolders)
    }

    function handleRemoteFileClick(filePath: string) {
        // 模拟读取远程文件内容
        const mockContent = `# 远程文件内容\n\n这是来自远程空间的文件：${filePath}\n\n文件路径：${filePath}\n\n这里是模拟的文件内容。`
        editorStore.setFile(filePath, mockContent)
    }

    async function handleAddDirectory() {
        if (typeof window !== 'undefined' && window.electron) {
            const dirPath = await window.electron.openDirectoryDialog()
            if (dirPath && !directories.has(dirPath)) {
                const name = getDirectoryName(dirPath)
                directories.set(dirPath, {
                    path: dirPath,
                    name,
                    expanded: false,
                    childrenLoaded: false,
                })
                directories = new Map(directories)
            }
        }
    }

    async function toggleDirectory(dirPath: string) {
        const dir = directories.get(dirPath)
        if (!dir) return

        const newExpanded = !dir.expanded
        let children = dir.children
        let childrenLoaded = dir.childrenLoaded

        if (newExpanded && !childrenLoaded) {
            const items = await window.electron.readDirectory(dirPath)
            children = items
            childrenLoaded = true
        }

        directories.set(dirPath, {
            ...dir,
            expanded: newExpanded,
            children,
            childrenLoaded,
        })
        directories = new Map(directories)
    }

    async function toggleFolder(folderPath: string) {
        if (expandedFolders.has(folderPath)) {
            expandedFolders.delete(folderPath)
        } else {
            expandedFolders.add(folderPath)
        }
        expandedFolders = new Set(expandedFolders)
    }

    async function loadFolderContents(folderPath: string): Promise<FileSystemItem[]> {
        if (typeof window !== 'undefined' && window.electron) {
            return await window.electron.readDirectory(folderPath)
        }
        return []
    }

    async function handleFileClick(filePath: string) {
        if (typeof window !== 'undefined' && window.electron) {
            try {
                const content = await window.electron.readFile(filePath)
                editorStore.setFile(filePath, content)
            } catch (error) {
                console.error('Error reading file:', error)
            }
        }
    }

    function getDirectoryName(path: string): string {
        return path.split('/').pop() || path.split('\\').pop() || path
    }

    function getFileIcon(filename: string, isDirectory: boolean) {
        if (isDirectory) {
            return Folder
        }

        const ext = filename.split('.').pop()?.toLowerCase()

        switch (ext) {
            case 'md':
            case 'txt':
            case 'doc':
            case 'docx':
                return FileText
            case 'xls':
            case 'xlsx':
            case 'csv':
                return FileSpreadsheet
            case 'ppt':
            case 'pptx':
                return Presentation
            default:
                return File
        }
    }

    interface FolderState {
        expanded: boolean
        children?: FileSystemItem[]
        loaded: boolean
    }

    let folderStates = $state<Map<string, FolderState>>(new Map())

    async function toggleNestedFolder(folderPath: string) {
        const state = folderStates.get(folderPath) || { expanded: false, loaded: false }

        const newExpanded = !state.expanded
        let children = state.children
        let loaded = state.loaded

        if (newExpanded && !loaded) {
            children = await loadFolderContents(folderPath)
            loaded = true
        }

        folderStates.set(folderPath, {
            expanded: newExpanded,
            children,
            loaded,
        })
        folderStates = new Map(folderStates)
    }
</script>

<!-- Nav groups -->
<nav class="flex-1 overflow-y-auto overflow-x-hidden py-4">
    <div class="mb-5 px-3">
        {#if !collapsed}
            <p class={cn('mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest', 'text-brand-400')}>
                工作空间
            </p>
        {/if}

        <div class="space-y-0.5">
            {#if collapsed}
                <button
                    onclick={onNavigate}
                    title={'本地空间'}
                    class={cn(
                        'group relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150'
                    )}>
                    <BookText class={cn('h-4.5 w-4.5')} strokeWidth={1.6} />
                    <span
                        class="pointer-events-none absolute left-12 z-50 hidden whitespace-nowrap rounded-lg bg-ink-900/90 px-2.5 py-1.5 text-[11.5px] font-medium text-white shadow-lg group-hover:block">
                        {'本地空间'}
                    </span>
                </button>
            {:else}
                <div class="space-y-1">
                    <div
                        class={cn(
                            'group relative flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                            'text-ink-600 hover:bg-white/30'
                        )}>
                        <BookText class={cn('h-4.5 w-4.5 shrink-0', 'text-ink-500')} strokeWidth={1.6} />
                        <span class="flex-1 truncate">{'本地空间'}</span>
                        <button
                            onclick={handleAddDirectory}
                            title="添加本地目录"
                            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-white/50 hover:text-ink-700">
                            <FolderPlus class="h-4 w-4" strokeWidth={1.8} />
                        </button>
                        <button
                            onclick={toggleLocalSpace}
                            title={localSpaceExpanded ? '收起' : '展开'}
                            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-white/50 hover:text-ink-700">
                            {#if localSpaceExpanded}
                                <ChevronDown class="h-4 w-4" strokeWidth={1.8} />
                            {:else}
                                <ChevronRight class="h-4 w-4" strokeWidth={1.8} />
                            {/if}
                        </button>
                    </div>

                    {#if localSpaceExpanded && directories.size > 0}
                        <div class="ml-3 space-y-0.5 border-l border-ink-200 pl-3">
                            {#each Array.from(directories.values()) as directory}
                                <div class="space-y-0.5">
                                    <button
                                        onclick={() => toggleDirectory(directory.path)}
                                        class={cn(
                                            'group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] transition-all duration-150',
                                            'text-ink-600 hover:bg-white/30 hover:text-ink-900'
                                        )}>
                                        {#if directory.expanded}
                                            <FolderOpen
                                                class={cn('h-4 w-4 shrink-0', 'text-ink-400 group-hover:text-ink-600')}
                                                strokeWidth={1.6} />
                                        {:else}
                                            <Folder
                                                class={cn('h-4 w-4 shrink-0', 'text-ink-400 group-hover:text-ink-600')}
                                                strokeWidth={1.6} />
                                        {/if}
                                        <span class="flex-1 truncate text-left">{directory.name}</span>
                                        {#if directory.expanded}
                                            <ChevronDown class="h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={2} />
                                        {:else}
                                            <ChevronRight class="h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={2} />
                                        {/if}
                                    </button>

                                    {#if directory.expanded && directory.children}
                                        <div class="ml-4 space-y-0.5 border-l border-ink-200 pl-2">
                                            {#each directory.children as item}
                                                {#if item.isDirectory}
                                                    {@const folderState = folderStates.get(item.path) || {
                                                        expanded: false,
                                                        loaded: false,
                                                    }}
                                                    <div class="space-y-0.5">
                                                        <button
                                                            onclick={() => toggleNestedFolder(item.path)}
                                                            class={cn(
                                                                'group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] transition-all duration-150',
                                                                'text-ink-600 hover:bg-white/30 hover:text-ink-900'
                                                            )}>
                                                            {#if folderState.expanded}
                                                                <FolderOpen
                                                                    class={cn(
                                                                        'h-3.5 w-3.5 shrink-0',
                                                                        'text-ink-400 group-hover:text-ink-600'
                                                                    )}
                                                                    strokeWidth={1.6} />
                                                            {:else}
                                                                <Folder
                                                                    class={cn(
                                                                        'h-3.5 w-3.5 shrink-0',
                                                                        'text-ink-400 group-hover:text-ink-600'
                                                                    )}
                                                                    strokeWidth={1.6} />
                                                            {/if}
                                                            <span class="flex-1 truncate text-left">{item.name}</span>
                                                            {#if folderState.expanded}
                                                                <ChevronDown
                                                                    class="h-3 w-3 shrink-0 text-ink-400"
                                                                    strokeWidth={2} />
                                                            {:else}
                                                                <ChevronRight
                                                                    class="h-3 w-3 shrink-0 text-ink-400"
                                                                    strokeWidth={2} />
                                                            {/if}
                                                        </button>

                                                        {#if folderState.expanded && folderState.children}
                                                            <div class="ml-4 space-y-0.5 border-l border-ink-200 pl-2">
                                                                {#each folderState.children as subItem}
                                                                    {#if subItem.isDirectory}
                                                                        {@const subFolderState = folderStates.get(
                                                                            subItem.path
                                                                        ) || { expanded: false, loaded: false }}
                                                                        <div class="space-y-0.5">
                                                                            <button
                                                                                onclick={() =>
                                                                                    toggleNestedFolder(subItem.path)}
                                                                                class={cn(
                                                                                    'group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11.5px] transition-all duration-150',
                                                                                    'text-ink-600 hover:bg-white/30 hover:text-ink-900'
                                                                                )}>
                                                                                {#if subFolderState.expanded}
                                                                                    <FolderOpen
                                                                                        class={cn(
                                                                                            'h-3 w-3 shrink-0',
                                                                                            'text-ink-400 group-hover:text-ink-600'
                                                                                        )}
                                                                                        strokeWidth={1.6} />
                                                                                {:else}
                                                                                    <Folder
                                                                                        class={cn(
                                                                                            'h-3 w-3 shrink-0',
                                                                                            'text-ink-400 group-hover:text-ink-600'
                                                                                        )}
                                                                                        strokeWidth={1.6} />
                                                                                {/if}
                                                                                <span class="flex-1 truncate text-left"
                                                                                    >{subItem.name}</span>
                                                                                {#if subFolderState.expanded}
                                                                                    <ChevronDown
                                                                                        class="h-3 w-3 shrink-0 text-ink-400"
                                                                                        strokeWidth={2} />
                                                                                {:else}
                                                                                    <ChevronRight
                                                                                        class="h-3 w-3 shrink-0 text-ink-400"
                                                                                        strokeWidth={2} />
                                                                                {/if}
                                                                            </button>

                                                                            {#if subFolderState.expanded && subFolderState.children}
                                                                                <div
                                                                                    class="ml-4 space-y-0.5 border-l border-ink-200 pl-2">
                                                                                    {#each subFolderState.children as deepItem}
                                                                                        {@const IconComponent =
                                                                                            getFileIcon(
                                                                                                deepItem.name,
                                                                                                deepItem.isDirectory
                                                                                            )}
                                                                                        <button
                                                                                            onclick={() =>
                                                                                                !deepItem.isDirectory &&
                                                                                                handleFileClick(
                                                                                                    deepItem.path
                                                                                                )}
                                                                                            class={cn(
                                                                                                'group flex w-full items-center gap-2 rounded-lg px-2 py-1 text-[11px] transition-all duration-150',
                                                                                                'text-ink-600 hover:bg-white/30 hover:text-ink-900'
                                                                                            )}>
                                                                                            <IconComponent
                                                                                                class={cn(
                                                                                                    'h-3 w-3 shrink-0',
                                                                                                    'text-ink-400 group-hover:text-ink-600'
                                                                                                )}
                                                                                                strokeWidth={1.6} />
                                                                                            <span
                                                                                                class="flex-1 truncate text-left"
                                                                                                >{deepItem.name}</span>
                                                                                        </button>
                                                                                    {/each}
                                                                                </div>
                                                                            {/if}
                                                                        </div>
                                                                    {:else}
                                                                        {@const IconComponent = getFileIcon(
                                                                            subItem.name,
                                                                            subItem.isDirectory
                                                                        )}
                                                                        <button
                                                                            onclick={() =>
                                                                                handleFileClick(subItem.path)}
                                                                            class={cn(
                                                                                'group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11.5px] transition-all duration-150',
                                                                                'text-ink-600 hover:bg-white/30 hover:text-ink-900'
                                                                            )}>
                                                                            <IconComponent
                                                                                class={cn(
                                                                                    'h-3 w-3 shrink-0',
                                                                                    'text-ink-400 group-hover:text-ink-600'
                                                                                )}
                                                                                strokeWidth={1.6} />
                                                                            <span class="flex-1 truncate text-left"
                                                                                >{subItem.name}</span>
                                                                        </button>
                                                                    {/if}
                                                                {/each}
                                                            </div>
                                                        {/if}
                                                    </div>
                                                {:else}
                                                    {@const IconComponent = getFileIcon(item.name, item.isDirectory)}
                                                    <button
                                                        onclick={() => handleFileClick(item.path)}
                                                        class={cn(
                                                            'group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] transition-all duration-150',
                                                            'text-ink-600 hover:bg-white/30 hover:text-ink-900'
                                                        )}>
                                                        <IconComponent
                                                            class={cn(
                                                                'h-3.5 w-3.5 shrink-0',
                                                                'text-ink-400 group-hover:text-ink-600'
                                                            )}
                                                            strokeWidth={1.6} />
                                                        <span class="flex-1 truncate text-left">{item.name}</span>
                                                    </button>
                                                {/if}
                                            {/each}
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/if}
        </div>

        <!-- 远程空间 -->
        <div class="mt-2 space-y-0.5">
            {#if collapsed}
                <button
                    onclick={onNavigate}
                    title={'远程空间'}
                    class={cn(
                        'group relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150'
                    )}>
                    <Cloud class={cn('h-4.5 w-4.5')} strokeWidth={1.6} />
                    <span
                        class="pointer-events-none absolute left-12 z-50 hidden whitespace-nowrap rounded-lg bg-ink-900/90 px-2.5 py-1.5 text-[11.5px] font-medium text-white shadow-lg group-hover:block">
                        {'远程空间'}
                    </span>
                </button>
            {:else}
                <div class="space-y-1">
                    <div
                        class={cn(
                            'group relative flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                            'text-ink-600 hover:bg-white/30'
                        )}>
                        <Cloud class={cn('h-4.5 w-4.5 shrink-0', 'text-ink-500')} strokeWidth={1.6} />
                        <span class="flex-1 truncate">{'远程空间'}</span>
                        <button
                            onclick={toggleRemoteSpace}
                            title={remoteSpaceExpanded ? '收起' : '展开'}
                            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-white/50 hover:text-ink-700">
                            {#if remoteSpaceExpanded}
                                <ChevronDown class="h-4 w-4" strokeWidth={1.8} />
                            {:else}
                                <ChevronRight class="h-4 w-4" strokeWidth={1.8} />
                            {/if}
                        </button>
                    </div>

                    {#if remoteSpaceExpanded && remoteData.length > 0}
                        <div class="ml-3 space-y-0.5 border-l border-ink-200 pl-3">
                            {#each remoteData as item}
                                {#if item.isDirectory}
                                    {@const isExpanded = remoteExpandedFolders.has(item.path)}
                                    <div class="space-y-0.5">
                                        <button
                                            onclick={() => toggleRemoteFolder(item.path)}
                                            class={cn(
                                                'group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] transition-all duration-150',
                                                'text-ink-600 hover:bg-white/30 hover:text-ink-900'
                                            )}>
                                            {#if isExpanded}
                                                <FolderOpen
                                                    class={cn(
                                                        'h-4 w-4 shrink-0',
                                                        'text-ink-400 group-hover:text-ink-600'
                                                    )}
                                                    strokeWidth={1.6} />
                                            {:else}
                                                <Folder
                                                    class={cn(
                                                        'h-4 w-4 shrink-0',
                                                        'text-ink-400 group-hover:text-ink-600'
                                                    )}
                                                    strokeWidth={1.6} />
                                            {/if}
                                            <span class="flex-1 truncate text-left">{item.name}</span>
                                            {#if isExpanded}
                                                <ChevronDown
                                                    class="h-3.5 w-3.5 shrink-0 text-ink-400"
                                                    strokeWidth={2} />
                                            {:else}
                                                <ChevronRight
                                                    class="h-3.5 w-3.5 shrink-0 text-ink-400"
                                                    strokeWidth={2} />
                                            {/if}
                                        </button>

                                        {#if isExpanded && item.children}
                                            <div class="ml-4 space-y-0.5 border-l border-ink-200 pl-2">
                                                {#each item.children as subItem}
                                                    {#if subItem.isDirectory}
                                                        {@const subIsExpanded = remoteExpandedFolders.has(subItem.path)}
                                                        <div class="space-y-0.5">
                                                            <button
                                                                onclick={() => toggleRemoteFolder(subItem.path)}
                                                                class={cn(
                                                                    'group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] transition-all duration-150',
                                                                    'text-ink-600 hover:bg-white/30 hover:text-ink-900'
                                                                )}>
                                                                {#if subIsExpanded}
                                                                    <FolderOpen
                                                                        class={cn(
                                                                            'h-3.5 w-3.5 shrink-0',
                                                                            'text-ink-400 group-hover:text-ink-600'
                                                                        )}
                                                                        strokeWidth={1.6} />
                                                                {:else}
                                                                    <Folder
                                                                        class={cn(
                                                                            'h-3.5 w-3.5 shrink-0',
                                                                            'text-ink-400 group-hover:text-ink-600'
                                                                        )}
                                                                        strokeWidth={1.6} />
                                                                {/if}
                                                                <span class="flex-1 truncate text-left"
                                                                    >{subItem.name}</span>
                                                                {#if subIsExpanded}
                                                                    <ChevronDown
                                                                        class="h-3 w-3 shrink-0 text-ink-400"
                                                                        strokeWidth={2} />
                                                                {:else}
                                                                    <ChevronRight
                                                                        class="h-3 w-3 shrink-0 text-ink-400"
                                                                        strokeWidth={2} />
                                                                {/if}
                                                            </button>

                                                            {#if subIsExpanded && subItem.children}
                                                                <div
                                                                    class="ml-4 space-y-0.5 border-l border-ink-200 pl-2">
                                                                    {#each subItem.children as deepItem}
                                                                        {@const IconComponent = getFileIcon(
                                                                            deepItem.name,
                                                                            deepItem.isDirectory
                                                                        )}
                                                                        <button
                                                                            onclick={() =>
                                                                                !deepItem.isDirectory &&
                                                                                handleRemoteFileClick(deepItem.path)}
                                                                            class={cn(
                                                                                'group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11.5px] transition-all duration-150',
                                                                                'text-ink-600 hover:bg-white/30 hover:text-ink-900'
                                                                            )}>
                                                                            <IconComponent
                                                                                class={cn(
                                                                                    'h-3 w-3 shrink-0',
                                                                                    'text-ink-400 group-hover:text-ink-600'
                                                                                )}
                                                                                strokeWidth={1.6} />
                                                                            <span class="flex-1 truncate text-left"
                                                                                >{deepItem.name}</span>
                                                                        </button>
                                                                    {/each}
                                                                </div>
                                                            {/if}
                                                        </div>
                                                    {:else}
                                                        {@const IconComponent = getFileIcon(
                                                            subItem.name,
                                                            subItem.isDirectory
                                                        )}
                                                        <button
                                                            onclick={() => handleRemoteFileClick(subItem.path)}
                                                            class={cn(
                                                                'group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] transition-all duration-150',
                                                                'text-ink-600 hover:bg-white/30 hover:text-ink-900'
                                                            )}>
                                                            <IconComponent
                                                                class={cn(
                                                                    'h-3.5 w-3.5 shrink-0',
                                                                    'text-ink-400 group-hover:text-ink-600'
                                                                )}
                                                                strokeWidth={1.6} />
                                                            <span class="flex-1 truncate text-left"
                                                                >{subItem.name}</span>
                                                        </button>
                                                    {/if}
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>
                                {:else}
                                    {@const IconComponent = getFileIcon(item.name, item.isDirectory)}
                                    <button
                                        onclick={() => handleRemoteFileClick(item.path)}
                                        class={cn(
                                            'group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] transition-all duration-150',
                                            'text-ink-600 hover:bg-white/30 hover:text-ink-900'
                                        )}>
                                        <IconComponent
                                            class={cn('h-4 w-4 shrink-0', 'text-ink-400 group-hover:text-ink-600')}
                                            strokeWidth={1.6} />
                                        <span class="flex-1 truncate text-left">{item.name}</span>
                                    </button>
                                {/if}
                            {/each}
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</nav>
