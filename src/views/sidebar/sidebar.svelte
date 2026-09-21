<script lang="ts">
    import { canAccess, getDocFullPath } from "$lib/access";
    import { flattenOrgTree } from "$lib/mappers";
    import { dismiss, toast } from "$lib/toast";
    import { uploadMdApi } from "@/api/doc";
    import { fetchOrgTreeApi } from "@/api/org";
    import { isAuthExpiredError } from "@/api/request";
    import logo from "@/assets/logo.png";
    import {
        addDocNode,
        deleteDocNode,
        docs,
        loadDocChildren,
        loadedFolderIds,
        refreshDocTree,
        renameDocNode,
        selectedDocId,
        treeLoading,
    } from "@/stores/docs";
    import { currentOrgName } from "@/stores/org";
    import { currentUser, session } from "@/stores/session";
    import type { DocNode } from "@/types";
    import {
        Ellipsis,
        File,
        FilePlus,
        Folder,
        FolderOpen,
        FolderPlus,
        Pencil,
        Search,
        Trash2,
        Upload,
        Users,
    } from "@lucide/svelte";
    import AssignFolderAuthModal from "./assign-folder-auth-modal.svelte";

    const SIDEBAR_WIDTH_KEY = "editor-sidebar-width";
    const SIDEBAR_DEFAULT_WIDTH = 240;
    const SIDEBAR_MIN_WIDTH = 180;
    const SIDEBAR_MAX_WIDTH = 480;

    function readSidebarWidth() {
        if (typeof localStorage === "undefined") return SIDEBAR_DEFAULT_WIDTH;
        const raw = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY));
        if (!Number.isFinite(raw)) return SIDEBAR_DEFAULT_WIDTH;
        return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, raw));
    }

    let keyword = $state("");
    let expandedKeys = $state<string[]>([]);
    let sidebarWidth = $state(readSidebarWidth());
    let uploading = $state(false);
    let authFolder = $state<DocNode | null>(null);
    let nameDialog = $state<{
        title: string;
        value: string;
        onOk: (name: string) => Promise<void>;
    } | null>(null);
    let uploadInput = $state<HTMLInputElement | null>(null);
    let nameInput = $state<HTMLInputElement | null>(null);
    let uploadTargetFolderId = $state<string | null>(null);
    let uploadTargetFolderBackendId = $state<number | null>(null);
    let menuFor = $state<string | null>(null);
    let wasSearching = false;

    const isSearching = $derived(Boolean(keyword.trim()));
    const visibleDocs = $derived(
        $docs.filter((item) => canAccess($currentUser, item, "view")),
    );
    const loadedSet = $derived(new Set($loadedFolderIds));

    type TreeNode = {
        key: string;
        isLeaf: boolean;
        title: string;
        children?: TreeNode[];
    };

    const treeData = $derived.by(() => {
        const build = (parentId: string | null): TreeNode[] =>
            visibleDocs
                .filter((item) => item.parentId === parentId)
                .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name))
                .map((item) => {
                    if (item.type === "doc")
                        return { key: item.id, isLeaf: true, title: item.name };
                    const loaded = isSearching || loadedSet.has(item.id);
                    return {
                        key: item.id,
                        isLeaf: false,
                        title: item.name,
                        children: loaded ? build(item.id) : undefined,
                    };
                });
        return build(null);
    });

    $effect(() => {
        if (!$session) return;
        let cancelled = false;
        void refreshDocTree(keyword)
            .then((keys) => {
                if (cancelled || keys.length === 0) return;
                expandedKeys = Array.from(new Set([...expandedKeys, ...keys]));
            })
            .catch((error) => {
                if (isAuthExpiredError(error)) return;
                toast.error(
                    error instanceof Error ? error.message : "加载目录失败",
                );
            });
        return () => {
            cancelled = true;
        };
    });

    $effect(() => {
        if (!$session || !$currentUser) {
            currentOrgName.set("文档");
            return;
        }
        let cancelled = false;
        void fetchOrgTreeApi()
            .then((tree) => {
                if (cancelled) return;
                const departments = flattenOrgTree(tree);
                const mine = departments.find(
                    (item) => item.id === $currentUser?.deptId,
                );
                let current = mine;
                while (current?.parentId) {
                    const parent = departments.find(
                        (item) => item.id === current?.parentId,
                    );
                    if (!parent) break;
                    current = parent;
                }
                const root = departments.find((item) => item.parentId === null);
                currentOrgName.set(current?.name || root?.name || "文档");
            })
            .catch(() => {
                if (!cancelled) currentOrgName.set("文档");
            });
        return () => {
            cancelled = true;
        };
    });

    $effect(() => {
        if (isSearching) {
            expandedKeys = $docs
                .filter((item) => item.type === "folder")
                .map((item) => item.id);
        } else if (wasSearching) {
            expandedKeys = [];
        }
        wasSearching = isSearching;
    });

    function onResizeStart(event: MouseEvent) {
        event.preventDefault();
        document.body.classList.add("is-sidebar-resizing");
        const onMove = (moveEvent: MouseEvent) => {
            sidebarWidth = Math.min(
                SIDEBAR_MAX_WIDTH,
                Math.max(SIDEBAR_MIN_WIDTH, moveEvent.clientX),
            );
        };
        const onUp = (upEvent: MouseEvent) => {
            document.body.classList.remove("is-sidebar-resizing");
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            sidebarWidth = Math.min(
                SIDEBAR_MAX_WIDTH,
                Math.max(SIDEBAR_MIN_WIDTH, upEvent.clientX),
            );
            localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    }

    async function ensureFolderChildren(folderId: string) {
        if (isSearching) return;
        try {
            await loadDocChildren(folderId);
        } catch (error) {
            if (isAuthExpiredError(error)) return;
            toast.error(
                error instanceof Error ? error.message : "加载子目录失败",
            );
        }
    }

    function createNode(parentId: string | null, type: DocNode["type"]) {
        if (!$session) {
            toast.error("请先登录");
            return;
        }
        nameDialog = {
            title: type === "folder" ? "新建文件夹" : "新建文档",
            value: type === "folder" ? "新建文件夹" : "未命名文档",
            onOk: async (name) => {
                const keepExpanded = parentId
                    ? Array.from(new Set([...expandedKeys, parentId]))
                    : [...expandedKeys];
                const id = await addDocNode({ parentId, name, type });
                expandedKeys = keepExpanded;
                if (!parentId && !isSearching && keepExpanded.length > 0) {
                    await Promise.all(
                        keepExpanded.map((key) => loadDocChildren(key, true)),
                    );
                }
                if (type === "doc" && id) selectedDocId.set(id);
                toast.success("创建成功");
            },
        };
    }

    function openRename(item: DocNode) {
        if (!$session) {
            toast.error("请先登录");
            return;
        }
        if (!item.authWrite) {
            toast.error("无编辑权限，无法修改名称");
            return;
        }
        nameDialog = {
            title: item.type === "folder" ? "修改目录名称" : "修改文档名称",
            value: item.name,
            onOk: async (name) => {
                if (name === item.name) return;
                await renameDocNode({ id: item.id, name });
                toast.success("名称已更新");
            },
        };
    }

    async function confirmDelete(item: DocNode) {
        if (
            !confirm(
                item.type === "folder"
                    ? "确认删除该文件夹？会同时删除其下所有文档"
                    : "确认删除该文档？",
            )
        )
            return;
        try {
            await deleteDocNode(item.id);
            toast.success("已删除");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "删除失败");
        }
    }

    function canShowMenu(item: DocNode) {
        return item.authWrite && canAccess($currentUser, item, "edit");
    }

    function onNodeMenuClick(item: DocNode, key: string) {
        menuFor = null;
        if (key === "rename") openRename(item);
        else if (key === "add-doc") createNode(item.id, "doc");
        else if (key === "add-folder") createNode(item.id, "folder");
        else if (key === "upload-md") {
            uploadTargetFolderId = item.id;
            uploadTargetFolderBackendId = item.backendId;
            uploadInput?.click();
        } else if (key === "assign-auth") authFolder = item;
        else if (key === "delete") void confirmDelete(item);
    }

    async function onUploadMdFile(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        input.value = "";
        const folderId = uploadTargetFolderId;
        const folderBackendId = uploadTargetFolderBackendId;
        uploadTargetFolderId = null;
        uploadTargetFolderBackendId = null;
        if (!file || !folderId || folderBackendId == null) return;
        if (!/\.md$/i.test(file.name)) {
            toast.error("仅支持 .md 文件");
            return;
        }
        uploading = true;
        const loadingId = toast.loading("正在上传…");
        try {
            await uploadMdApi(folderBackendId, file);
            await refreshDocTree(isSearching ? keyword : undefined);
            if (!isSearching && expandedKeys.length > 0) {
                await Promise.all(
                    expandedKeys.map((key) => loadDocChildren(key, true)),
                );
            }
            toast.success("上传成功");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "上传失败");
        } finally {
            dismiss(loadingId);
            uploading = false;
        }
    }

    function toggleExpand(nodeId: string) {
        const opening = !expandedKeys.includes(nodeId);
        expandedKeys = opening
            ? [...expandedKeys, nodeId]
            : expandedKeys.filter((key) => key !== nodeId);
        if (opening) void ensureFolderChildren(nodeId);
    }

    function onSelect(nodeId: string) {
        const node = $docs.find((item) => item.id === nodeId);
        if (!node) return;
        if (node.type === "doc") {
            selectedDocId.set(node.id);
            return;
        }
        toggleExpand(node.id);
    }

    async function submitNameDialog() {
        if (!nameDialog) return;
        const trimmed = nameDialog.value.trim();
        if (!trimmed) {
            toast.error("名称不能为空");
            return;
        }
        try {
            await nameDialog.onOk(trimmed);
            nameDialog = null;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "操作失败");
        }
    }

    $effect(() => {
        if (!nameDialog) return
        queueMicrotask(() => nameInput?.focus())
    })
</script>

<aside class="app-sidebar" style:width={`${sidebarWidth}px`}>
    <input
        bind:this={uploadInput}
        type="file"
        accept=".md"
        hidden
        disabled={uploading}
        onchange={(e) => void onUploadMdFile(e)}
    />
    <div class="sidebar-logo">
        <span class="logo-mark" aria-hidden="true"
            ><img src={logo} alt="logo" /></span
        >
        <div class="logo-content">
            <strong class="logo-org-name" title={$currentOrgName}
                >{$currentOrgName}</strong
            >
            <span class="logo-subtitle">文档管理系统</span>
        </div>
    </div>
    <div class="sidebar-search">
        <div class="search-wrap">
            <Search size={14} />
            <input
                placeholder="搜索文件夹或文档"
                bind:value={keyword}
                disabled={!$session}
            />
        </div>
        <button
            type="button"
            title="新建根目录"
            aria-label="新建根目录"
            disabled={!$session || $currentUser?.role !== "admin"}
            onclick={() => createNode(null, "folder")}
        >
            <FolderPlus size={16} />
        </button>
    </div>
    <div class="sidebar-tree">
        {#if !$session}
            <div class="editor-empty">请先登录后查看目录</div>
        {:else if $treeLoading}
            <div class="editor-empty">加载中…</div>
        {:else}
            {#each treeData as node (node.key)}
                {@render treeItem(node, 0)}
            {/each}
        {/if}
    </div>
    <button
        type="button"
        class="sidebar-resize-handle"
        onmousedown={onResizeStart}
        aria-label="调整侧栏宽度"
    ></button>
</aside>

{#snippet treeItem(node: TreeNode, depth: number)}
    {@const item = $docs.find((doc) => doc.id === node.key)}
    {#if item}
        <div
            class="tree-row"
            class:selected={$selectedDocId === item.id}
            style:padding-left={`${8 + depth * 14}px`}
        >
            <button
                type="button"
                class="tree-main"
                onclick={() => onSelect(item.id)}
                title={getDocFullPath($docs, item.id)}
            >
                <span class="tree-icon" aria-hidden="true">
                    {#if item.type === "doc"}
                        <File size={14} />
                    {:else if expandedKeys.includes(item.id)}
                        <FolderOpen size={14} />
                    {:else}
                        <Folder size={14} />
                    {/if}
                </span>
                <span class="tree-name">{item.name}</span>
            </button>
            {#if canShowMenu(item)}
                <div class="tree-actions">
                    <button
                        type="button"
                        class="tree-action"
                        title="更多操作"
                        aria-label="更多操作"
                        onclick={(e) => {
                            e.stopPropagation();
                            menuFor = menuFor === item.id ? null : item.id;
                        }}
                    >
                        <Ellipsis size={14} />
                    </button>
                    {#if menuFor === item.id}
                        <button
                            type="button"
                            class="menu-mask"
                            aria-label="关闭"
                            onclick={() => (menuFor = null)}
                        ></button>
                        <div class="tree-menu" role="menu">
                            <button
                                type="button"
                                onclick={() => onNodeMenuClick(item, "rename")}
                            >
                                <Pencil size={14} />
                                修改名称
                            </button>
                            {#if item.type === "folder"}
                                <button
                                    type="button"
                                    onclick={() =>
                                        onNodeMenuClick(item, "add-doc")}
                                >
                                    <FilePlus size={14} />
                                    新建文档
                                </button>
                                <button
                                    type="button"
                                    onclick={() =>
                                        onNodeMenuClick(item, "add-folder")}
                                >
                                    <FolderPlus size={14} />
                                    新建文件夹
                                </button>
                                <button
                                    type="button"
                                    onclick={() =>
                                        onNodeMenuClick(item, "upload-md")}
                                >
                                    <Upload size={14} />
                                    上传文件
                                </button>
                                <button
                                    type="button"
                                    onclick={() =>
                                        onNodeMenuClick(item, "assign-auth")}
                                >
                                    <Users size={14} />
                                    分配权限
                                </button>
                            {/if}
                            <button
                                type="button"
                                class="danger"
                                onclick={() => onNodeMenuClick(item, "delete")}
                            >
                                <Trash2 size={14} />
                                删除
                            </button>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
        {#if item.type === "folder" && expandedKeys.includes(item.id) && node.children}
            {#each node.children as child (child.key)}
                {@render treeItem(child, depth + 1)}
            {/each}
        {/if}
    {/if}
{/snippet}

{#if nameDialog}
    <div class="name-dialog">
        <button
            type="button"
            class="menu-mask"
            aria-label="关闭"
            onclick={() => (nameDialog = null)}
        ></button>
        <div class="name-panel" role="dialog" aria-modal="true">
            <h3>{nameDialog.title}</h3>
            <input
                bind:this={nameInput}
                bind:value={nameDialog.value}
                onkeydown={(e) => e.key === "Enter" && void submitNameDialog()}
            />
            <div class="name-actions">
                <button type="button" onclick={() => (nameDialog = null)}
                    >取消</button
                >
                <button
                    type="button"
                    class="primary"
                    onclick={() => void submitNameDialog()}>确定</button
                >
            </div>
        </div>
    </div>
{/if}

<AssignFolderAuthModal
    folder={authFolder}
    onClose={() => (authFolder = null)}
/>

<style>
    .sidebar-search {
        display: flex;
        gap: 6px;
        padding: 8px 12px;
        align-items: center;
    }
    .search-wrap {
        position: relative;
        flex: 1;
        display: flex;
        align-items: center;
    }
    .search-wrap :global(svg) {
        position: absolute;
        left: 8px;
        color: #8f959e;
        pointer-events: none;
    }
    .sidebar-search input {
        width: 100%;
        height: 32px;
        border: 1px solid #d0d3d6;
        border-radius: 6px;
        padding: 0 8px 0 28px;
        box-sizing: border-box;
    }
    .sidebar-search > button {
        width: 32px;
        height: 32px;
        display: grid;
        place-items: center;
        border: 1px solid #d0d3d6;
        border-radius: 6px;
        background: #fff;
        cursor: pointer;
        color: #646a73;
        padding: 0;
    }
    .tree-icon {
        display: inline-flex;
        color: #8f959e;
        flex-shrink: 0;
    }
    .tree-row {
        display: flex;
        align-items: center;
        min-height: 32px;
        position: relative;
    }
    .tree-row.selected {
        background: #eef3ff;
    }
    .tree-main {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 6px;
        border: 0;
        background: transparent;
        text-align: left;
        padding: 4px 8px 4px 0;
        cursor: pointer;
        min-width: 0;
    }
    .tree-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 13px;
    }
    .tree-actions {
        position: relative;
        padding-right: 4px;
    }
    .tree-action {
        border: 0;
        background: transparent;
        cursor: pointer;
        padding: 2px 6px;
        display: inline-flex;
        color: #8f959e;
    }
    .menu-mask {
        position: fixed;
        inset: 0;
        border: 0;
        background: transparent;
        z-index: 30;
    }
    .tree-menu {
        position: absolute;
        right: 0;
        top: 100%;
        z-index: 31;
        min-width: 148px;
        background: #fff;
        border: 1px solid #e8eaed;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
        display: flex;
        flex-direction: column;
        padding: 4px;
    }
    .tree-menu button {
        border: 0;
        background: transparent;
        text-align: left;
        padding: 8px 10px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #1f2329;
    }
    .tree-menu button:hover {
        background: #f5f6f7;
    }
    .tree-menu .danger {
        color: #f04438;
    }
    .name-dialog {
        position: fixed;
        inset: 0;
        z-index: 3200;
        display: grid;
        place-items: center;
    }
    .name-panel {
        position: relative;
        z-index: 1;
        width: min(400px, calc(100vw - 32px));
        background: #fff;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 16px 48px rgb(0 0 0 / 0.2);
    }
    .name-panel h3 {
        margin: 0 0 12px;
        font-size: 16px;
    }
    .name-panel input {
        width: 100%;
        height: 36px;
        border: 1px solid #d0d3d6;
        border-radius: 6px;
        padding: 0 10px;
        box-sizing: border-box;
    }
    .name-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
    }
    .name-actions button {
        height: 32px;
        padding: 0 14px;
        border: 1px solid #d0d3d6;
        border-radius: 6px;
        background: #fff;
        cursor: pointer;
    }
    .name-actions .primary {
        border-color: #3370ff;
        background: #3370ff;
        color: #fff;
    }
</style>
