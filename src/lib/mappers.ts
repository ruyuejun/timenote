import type { DocFolderChild, DocFolderTree, LoginUser, SysOrgTree, SysUser } from '../api/types'
import type { Department, DocNode, Employee, EmployeeGender } from '../types'

export function mapLoginUser(user: LoginUser): Employee {
	return {
		id: String(user.id),
		deptId: String(user.orgId || 0),
		name: user.userName,
		gender: 'male',
		position: '',
		username: user.account,
		avatar: user.headImgUrl || '',
		headImg: user.headImg || '',
		role: user.isAdmin === 1 ? 'admin' : 'member',
		status: user.employStatus === 1 ? 'active' : 'resigned',
	}
}

export function mapSysUser(user: SysUser): Employee {
	return {
		id: String(user.id),
		deptId: String(user.orgId || 0),
		name: user.userName,
		gender: user.sex === 0 ? 'female' : 'male',
		position: user.roleName || '',
		username: user.account,
		avatar: user.headImgUrl || '',
		headImg: user.headImg || '',
		role: user.isAdmin === 1 ? 'admin' : 'member',
		status: user.employStatus === 1 ? 'active' : 'resigned',
		// Number()：兼容接口里 0/1 与布尔混用
		folderAuths: (user.folderAuths ?? []).map(item => ({
			folderId: item.folderId,
			folderName: item.folderName,
			authRead: Number(item.authRead) === 1,
			authWrite: Number(item.authWrite) === 1,
		})),
	}
}

export function genderToSex(gender: EmployeeGender) {
	return gender === 'female' ? 0 : 1
}

export function flattenOrgTree(nodes: SysOrgTree[]): Department[] {
	const list: Department[] = []
	const walk = (items: SysOrgTree[]) => {
		for (const node of items) {
			list.push({
				id: String(node.id),
				parentId: node.parentId && node.parentId !== 0 ? String(node.parentId) : null,
				name: node.orgName,
				employeeCount: node.employeeCount,
				sort: node.sort,
			})
			if (node.children?.length) walk(node.children)
		}
	}
	walk(nodes)
	return list
}

/** 前端节点 id：文件夹 / 文件后端 id 可能相同，必须加前缀区分 */
export function toFolderNodeId(backendId: number) {
	return `folder:${backendId}`
}

export function toDocNodeId(backendId: number) {
	return `doc:${backendId}`
}

export function parseNodeId(id: string): { kind: 'folder' | 'doc'; backendId: number } | null {
	const matched = /^(folder|doc):(\d+)$/.exec(id)
	if (!matched) return null
	return {
		kind: matched[1] as 'folder' | 'doc',
		backendId: Number(matched[2]),
	}
}

/** /docFolder/children 单层映射 */
export function mapDocChildren(items: DocFolderChild[], parentFrontendId: string | null): DocNode[] {
	return items.map(item => {
		if (item.itemType === 'folder') {
			return {
				id: toFolderNodeId(item.id),
				backendId: item.id,
				parentId: parentFrontendId,
				name: item.name,
				type: 'folder' as const,
				authRead: item.authRead === 1,
				authWrite: item.authWrite === 1,
				sort: item.sort,
			}
		}
		return {
			id: toDocNodeId(item.id),
			backendId: item.id,
			parentId: parentFrontendId,
			name: item.name,
			type: 'doc' as const,
			schema: item.schema,
			authRead: item.authRead === 1,
			authWrite: item.authWrite === 1,
			sort: item.sort,
		}
	})
}

/** 替换某父节点下一层子树（含子节点的已加载后代） */
export function replaceDocChildren(docs: DocNode[], parentId: string | null, children: DocNode[]): DocNode[] {
	const removeIds = new Set<string>()
	const collect = (pid: string | null) => {
		for (const item of docs) {
			if (item.parentId === pid) {
				removeIds.add(item.id)
				if (item.type === 'folder') collect(item.id)
			}
		}
	}
	collect(parentId)
	return [...docs.filter(item => !removeIds.has(item.id)), ...children]
}

/**
 * /docFolder/tree：
 * - children：子文件夹
 * - files：当前文件夹下的文件（含 schema 正文）
 */
export function flattenDocTree(nodes: DocFolderTree[]): DocNode[] {
	const list: DocNode[] = []

	const walk = (folders: DocFolderTree[]) => {
		for (const folder of folders) {
			const folderId = toFolderNodeId(folder.id)
			list.push({
				id: folderId,
				backendId: folder.id,
				parentId:
					folder.parentId && folder.parentId !== 0
						? toFolderNodeId(folder.parentId)
						: null,
				name: folder.docFolderName,
				type: 'folder',
				authRead: folder.authRead === 1,
				authWrite: folder.authWrite === 1,
				sort: folder.sort,
			})

			for (const file of folder.files ?? []) {
				list.push({
					id: toDocNodeId(file.id),
					backendId: file.id,
					parentId: folderId,
					name: file.docName,
					type: 'doc',
					schema: file.schema,
					authRead: file.authRead === 1,
					authWrite: file.authWrite === 1,
					sort: file.sort,
				})
			}

			if (folder.children?.length) walk(folder.children)
		}
	}

	walk(nodes)
	return list
}

export function emptyDocHtml(title: string) {
	return `<p>${escapeHtml(title)}</p>`
}

function escapeHtml(value: string) {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
