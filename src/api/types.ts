export interface ApiResponse<T = unknown> {
	code: number
	msg: string
	data: T[]
	timestamp: number
	total?: number
}

export interface LoginUser {
	id: number
	account: string
	userName: string
	orgId: number
	headImg?: string | null
	headImgUrl?: string | null
	isAdmin: number
	employStatus: number
}

export interface LoginResult {
	token: string
	tokenType: string
	expiresIn: string
	fileAccessPath: string
	user: LoginUser
}

export interface UploadImageResult {
	path: string
	url: string
	originalName: string
	size: number
}

/** /docInfo/uploadMd 返回：md 已转 schema 并写入 doc_info 记录 */
export interface UploadMdResult {
	id: number
	docName: string
	schema: string
	folderId: number
	sort: number
	remark?: string | null
	path?: string | null
	pathUrl?: string | null
	originalName: string
	size: number
}

export interface SysOrgTree {
	id: number
	orgName: string
	parentId: number
	sort: number
	employeeCount: number
	children?: SysOrgTree[]
}

export interface SysUser {
	id: number
	account: string
	userName: string
	orgId: number
	headImg?: string | null
	headImgUrl?: string | null
	sex?: number | null
	roleName?: string | null
	isAdmin: number
	employStatus: number
	folderAuths?: UserFolderAuth[]
}

export interface UserFolderAuth {
	id?: number | null
	folderId: number
	folderName?: string | null
	authRead: number
	authWrite: number
	remark?: string | null
	authType: number
	inheritFromOrgId?: number | null
	inheritFromOrgName?: string | null
}

export interface SysUserDetail extends SysUser {
	folderAuths: UserFolderAuth[]
}

export interface OrgFolderAuth {
	id?: number | null
	folderId: number
	folderName?: string | null
	authRead: number
	authWrite: number
	remark?: string | null
	inherited: boolean
	inheritFromOrgId?: number | null
	inheritFromOrgName?: string | null
}

export interface FolderAuthItem {
	folderId: number
	authRead?: number
	authWrite?: number
	remark?: string
}

/** 授权类型：1 部门 2 员工 */
export const DOC_AUTH_TYPE_ORG = 1
export const DOC_AUTH_TYPE_USER = 2

/** /docFolder/auth/list 单条 */
export interface DocFolderAuth {
	id: number
	folderId: number
	authType: number
	authId: number
	authRead: number
	authWrite: number
	remark?: string | null
}

/** /docFolder/assignAuth 单项 */
export interface DocFolderAuthAssignItem {
	authType: number
	authId: number
	authRead?: number
	authWrite?: number
	remark?: string
}

export interface DocFolderFile {
	id: number
	docName: string
	/** TipTap HTML 等文档正文 */
	schema: string
	sort: number
	authRead: number
	authWrite: number
}

/** /docFolder/children 单层子项 */
export interface DocFolderChild {
	itemType: 'folder' | 'file'
	id: number
	name: string
	parentId?: number
	schema?: string | null
	sort: number
	authRead: number
	authWrite: number
}

export interface DocFolderTree {
	id: number
	docFolderName: string
	parentId: number
	sort: number
	authRead: number
	authWrite: number
	children?: DocFolderTree[]
	files?: DocFolderFile[]
}

export interface DocInfo {
	id: number
	docName: string
	schema: string
	folderId: number
	sort: number
	remark?: string | null
	createTime?: string
	updateTime?: string
}

export interface SysConfig {
	id: number
	configKey: string
	configValue?: string | null
	createTime?: string
	updateTime?: string
}

export interface SysOperLog {
	id: number
	userId?: number | null
	userName?: string | null
	module?: string | null
	title?: string | null
	method?: string | null
	path?: string | null
	requestParam?: string | null
	status: number
	errorMsg?: string | null
	ip?: string | null
	duration?: number | null
	createTime?: string
}
