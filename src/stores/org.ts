import { derived, get, writable } from 'svelte/store'

import { createOrgApi, deleteOrgApi, fetchOrgTreeApi, updateOrgApi } from '@/api/org'
import { createUserApi, deleteUserApi, fetchUserPageApi, updateUserApi } from '@/api/user'
import { flattenOrgTree, genderToSex, mapSysUser } from '$lib/mappers'
import type { Department, Employee, EmployeeGender, EmployeeRole, EmployeeStatus, OrgTarget } from '@/types'
import { requireAdmin, session } from './session'

export const selectedOrg = writable<OrgTarget | null>(null)
export const departments = writable<Department[]>([])
export const employees = writable<Employee[]>([])
export const employeesTotal = writable(0)
export const currentOrgName = writable('文档')

export const selectedOrgName = derived([selectedOrg, departments], ([$org, $departments]) => {
	if ($org?.kind !== 'department') return ''
	return $departments.find(item => item.id === $org.id)?.name ?? ''
})

export async function refreshOrgTree() {
	const tree = await fetchOrgTreeApi()
	const list = flattenOrgTree(tree)
	departments.set(list)
	if (list[0]) {
		selectedOrg.update(current => current ?? { kind: 'department', id: list[0].id })
	}
}

export async function refreshEmployees(payload?: {
	orgId?: number
	page?: number
	limit?: number
	userName?: string
	account?: string
}) {
	const { list, total } = await fetchUserPageApi({
		page: payload?.page ?? 1,
		limit: payload?.limit ?? 10,
		orgId: payload?.orgId,
		userName: payload?.userName,
		account: payload?.account,
	})
	employees.set(list.map(mapSysUser))
	employeesTotal.set(total)
}

export async function addDepartment(payload: { parentId: string | null; name: string }) {
	requireAdmin()
	const trimmed = payload.name.trim()
	if (!trimmed) throw new Error('部门名称不能为空')
	if (trimmed.length > 20) throw new Error('部门名称最多20个字')
	const created = await createOrgApi({
		orgName: trimmed,
		parentId: payload.parentId ? Number(payload.parentId) : 0,
	})
	await refreshOrgTree()
	if (created?.id) selectedOrg.set({ kind: 'department', id: String(created.id) })
}

export async function updateDepartment(payload: { id: string; name: string }) {
	requireAdmin()
	const trimmed = payload.name.trim()
	if (!trimmed) throw new Error('部门名称不能为空')
	if (trimmed.length > 20) throw new Error('部门名称最多20个字')
	await updateOrgApi({ id: Number(payload.id), orgName: trimmed })
	await refreshOrgTree()
	selectedOrg.set({ kind: 'department', id: payload.id })
	const updated = get(departments).find(item => item.id === payload.id)
	if (updated?.parentId === null) currentOrgName.set(trimmed)
}

export async function deleteDepartment(id: string) {
	requireAdmin()
	await deleteOrgApi(Number(id))
	await refreshOrgTree()
	selectedOrg.set({ kind: 'department', id: get(departments)[0]?.id ?? '0' })
}

export async function addEmployee(payload: {
	deptId: string
	name: string
	gender: EmployeeGender
	position: string
	username: string
	password: string
}) {
	requireAdmin()
	await createUserApi({
		account: payload.username,
		userName: payload.name,
		orgId: Number(payload.deptId),
		sex: genderToSex(payload.gender),
		roleName: payload.position,
		password: payload.password || '123456',
	})
	await refreshOrgTree()
	const org = get(selectedOrg)
	const orgId = org?.kind === 'department' ? Number(org.id) : Number(payload.deptId)
	await refreshEmployees({ orgId })
}

export async function deleteEmployee(id: string) {
	requireAdmin()
	await deleteUserApi(Number(id))
	const org = get(selectedOrg)
	const orgId =
		org?.kind === 'department'
			? Number(org.id)
			: Number(get(employees).find(item => item.id === id)?.deptId || 0) || undefined
	await refreshOrgTree()
	await refreshEmployees({ orgId })
	if (get(session)?.user.id === id) session.set(null)
}

export async function updateEmployee(payload: {
	id: string
	deptId: string
	name: string
	gender: EmployeeGender
	position: string
	username: string
	password?: string
}) {
	requireAdmin()
	const password = payload.password?.trim()
	await updateUserApi({
		id: Number(payload.id),
		account: payload.username,
		userName: payload.name,
		orgId: Number(payload.deptId),
		sex: genderToSex(payload.gender),
		roleName: payload.position,
		...(password ? { password } : {}),
	})
	const org = get(selectedOrg)
	const orgId = org?.kind === 'department' ? Number(org.id) : Number(payload.deptId)
	await refreshOrgTree()
	await refreshEmployees({ orgId })
}

export async function setEmployeeRole(payload: { id: string; role: EmployeeRole }) {
	requireAdmin()
	const emp = get(employees).find(item => item.id === payload.id)
	await updateUserApi({
		id: Number(payload.id),
		isAdmin: payload.role === 'admin' ? 1 : 0,
	})
	const org = get(selectedOrg)
	const orgId = org?.kind === 'department' ? Number(org.id) : emp ? Number(emp.deptId) : undefined
	await refreshEmployees({ orgId, limit: 10 })
}

export async function setEmployeeStatus(payload: { id: string; status: EmployeeStatus }) {
	requireAdmin()
	const emp = get(employees).find(item => item.id === payload.id)
	await updateUserApi({
		id: Number(payload.id),
		employStatus: payload.status === 'active' ? 1 : 0,
	})
	const org = get(selectedOrg)
	const orgId = org?.kind === 'department' ? Number(org.id) : emp ? Number(emp.deptId) : undefined
	await refreshEmployees({ orgId })
	if (payload.status === 'resigned' && get(session)?.user.id === payload.id) session.set(null)
}
