<script lang="ts">
	import { canAccess } from '$lib/access'
	import { currentUser, focusMode } from '@/stores/session'
	import { selectedDoc } from '@/stores/docs'
	import AppHeader from './app-header.svelte'
	import DocEditor from './editor/doc-editor.svelte'
	import Sidebar from './sidebar/sidebar.svelte'

	const doc = $derived($selectedDoc)
	const user = $derived($currentUser)
	const canEdit = $derived(Boolean(doc && canAccess(user, doc, 'edit')))
	const canView = $derived(Boolean(doc && canAccess(user, doc, 'view')))
</script>

<div class="app-shell" class:is-focus-mode={$focusMode}>
	<Sidebar />
	<section class="app-main">
		<AppHeader />
		<div class="app-content">
			{#if doc?.type === 'doc' && canView}
				{#key doc.id}
					<DocEditor {doc} {canEdit} />
				{/key}
			{:else}
				<div class="editor-empty">
					{doc && !canView
						? '没有该文档的查看权限'
						: '在左侧选择一篇文档，或在文件夹上点击 + 新建文档'}
				</div>
			{/if}
		</div>
	</section>
</div>
