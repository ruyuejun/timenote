<script lang="ts">
	import Tiptap from '@/editor/Tiptap.svelte';
	import type { Editor } from '@tiptap/core';

	// 处理内容更新回调
	const handleUpdate = (editor: Editor) => {
		const html = editor.getHTML();
		console.log('📝 当前内容 (HTML):', html);
	};

	// 初始内容（支持 HTML 格式）
	const initialContent = `
    <h1>欢迎使用 Tiptap + Svelte + TypeScript</h1>
    <p>这是一个完整的 TypeScript 示例。</p>
    <p>选中这段文字试试 <strong>气泡菜单</strong> 吧！</p>
    <ul>
      <li>列表项一</li>
      <li>列表项二</li>
    </ul>
  `;

	let num = $state(0);

	$effect(() => {
		console.log('num changed:', num);
	});
</script>

<div style="max-width: 800px; margin: 40px auto; padding: 0 20px;">
	<button
		onclick={() => {
			num++;
		}}>点击增加</button
	>
	<Tiptap content={initialContent} onUpdate={handleUpdate} />
</div>
