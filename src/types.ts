export type NodeType = 'folder' | 'doc'
export type EmployeeStatus = 'active' | 'resigned'
export type EmployeeRole = 'admin' | 'member'
export type EmployeeGender = 'male' | 'female'

/** 侧栏/编辑器用的统一节点（来自目录树扁平化） */
export interface DocNode {
	id: string
	/** 后端数字主键 */
	backendId: number
	parentId: string | null
	name: string
	type: NodeType
	/** 文档正文（仅 doc，对应后端 schema） */
	schema?: string | null
	authRead: boolean
	authWrite: boolean
	sort: number
}

export interface Department {
	id: string
	parentId: string | null
	name: string
	employeeCount?: number
	sort?: number
}

export interface Employee {
	id: string
	deptId: string
	name: string
	gender: EmployeeGender
	position: string
	username: string
	avatar: string
	/** 头像相对路径，提交资料用 */
	headImg?: string
	role: EmployeeRole
	status: EmployeeStatus
	/** 文档文件夹权限（列表接口返回） */
	folderAuths?: Array<{
		folderId: number
		folderName?: string | null
		authRead: boolean
		authWrite: boolean
	}>
}

export type OrgTarget = { kind: 'department'; id: string } | { kind: 'employee'; id: string }

export interface SessionState {
	token: string
	fileAccessPath: string
	user: Employee
}

export interface FolderAuthDraft {
	folderId: number
	folderName?: string
	authRead: boolean
	authWrite: boolean
	inherited?: boolean
}
