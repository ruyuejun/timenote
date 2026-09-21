import type { DocNode, Employee } from '../types'
import { getAncestors } from './tree'

/** 后端树节点已带当前用户对文件夹/文件的读写权限（含继承），前端按字段判断即可 */
export function canAccess(user: Employee | null, node: DocNode | null | undefined, mode: 'view' | 'edit') {
	if (!node) return false
	if (!user) return false
	if (user.role === 'admin') return true
	if (user.status !== 'active') return false
	if (mode === 'view') return node.authRead || node.authWrite
	return node.authWrite
}

export function getDeepestOperableFolders(docs: DocNode[], user: Employee) {
	if (user.role === 'admin') return ['全部目录']

	const folders = docs.filter(item => item.type === 'folder' && canAccess(user, item, 'view'))
	const accessible = folders.map(folder => ({
		id: folder.id,
		name: folder.name,
		depth: getAncestors(docs, folder.id).length,
	}))

	if (accessible.length === 0) return ['无']
	const maxDepth = Math.max(...accessible.map(item => item.depth))
	return [...new Set(accessible.filter(item => item.depth === maxDepth).map(item => item.name))]
}

export function getDocFullPath(docs: DocNode[], docId: string, rootLabel = '文档') {
	const doc = docs.find(item => item.id === docId)
	if (!doc) return rootLabel
	const chain = [...getAncestors(docs, docId).reverse(), doc]
	return `${rootLabel}/${chain.map(item => item.name).join('/')}`
}
