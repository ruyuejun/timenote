<script lang="ts">
	import {
		Ellipsis,
		FolderPlus,
		Pencil,
		Plus,
		Trash2,
	} from '@lucide/svelte'
	import Modal from '$lib/ui/Modal.svelte'
	import { toast } from '$lib/toast'
	import {
		addDepartment,
		addEmployee,
		deleteDepartment,
		deleteEmployee,
		departments,
		employees,
		employeesTotal,
		refreshEmployees,
		refreshOrgTree,
		selectedOrg,
		setEmployeeRole,
		setEmployeeStatus,
		updateDepartment,
		updateEmployee,
	} from '@/stores/org'
	import type { Department, Employee, EmployeeGender } from '@/types'
	import AssignPermissionModal from './assign-permission-modal.svelte'

	interface Props {
		open: boolean
		onClose: () => void
	}

	let { open, onClose }: Props = $props()

	let loading = $state(false)
	let page = $state(1)
	let keyword = $state('')
	let authEmployee = $state<Employee | null>(null)
	let menuFor = $state<string | null>(null)

	let deptFormOpen = $state(false)
	let deptParentId = $state<string | null>(null)
	let deptEditing = $state<Department | null>(null)
	let deptName = $state('')

	let empFormOpen = $state(false)
	let empEditing = $state<Employee | null>(null)
	let empName = $state('')
	let empUsername = $state('')
	let empPassword = $state('')
	let empGender = $state<EmployeeGender>('male')
	let empPosition = $state('')
	let empDeptId = $state('')

	const orgId = $derived($selectedOrg?.kind === 'department' ? Number($selectedOrg.id) : undefined)
	const flatDepts = $derived(flattenDepartments($departments, null))

	function flattenDepartments(list: Department[], parentId: string | null, depth = 0): (Department & { depth: number })[] {
		return list
			.filter(item => item.parentId === parentId)
			.flatMap(item => [{ ...item, depth }, ...flattenDepartments(list, item.id, depth + 1)])
	}

	async function load() {
		loading = true
		try {
			await refreshOrgTree()
			await refreshEmployees({
				orgId,
				page,
				limit: 10,
				userName: keyword.trim() || undefined,
			})
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '加载失败')
		} finally {
			loading = false
		}
	}

	$effect(() => {
		if (!open) return
		void load()
	})

	function selectDept(id: string) {
		selectedOrg.set({ kind: 'department', id })
		page = 1
		void load()
	}

	function openAddDept(parentId: string | null) {
		menuFor = null
		deptParentId = parentId
		deptEditing = null
		deptName = ''
		deptFormOpen = true
	}

	function openEditDept(dept: Department) {
		menuFor = null
		deptEditing = dept
		deptParentId = dept.parentId
		deptName = dept.name
		deptFormOpen = true
	}

	async function removeDept(dept: Department) {
		menuFor = null
		if (!confirm(`删除部门「${dept.name}」？`)) return
		try {
			await deleteDepartment(dept.id)
			toast.success('已删除')
			await load()
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '删除失败')
		}
	}

	async function saveDept() {
		try {
			if (deptEditing) await updateDepartment({ id: deptEditing.id, name: deptName })
			else await addDepartment({ parentId: deptParentId, name: deptName })
			toast.success('已保存部门')
			deptFormOpen = false
			await load()
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '保存失败')
		}
	}

	function openAddEmp() {
		const selected = $selectedOrg
		empEditing = null
		empName = ''
		empUsername = ''
		empPassword = '123456'
		empGender = 'male'
		empPosition = ''
		empDeptId = selected?.kind === 'department' ? selected.id : $departments[0]?.id ?? ''
		empFormOpen = true
	}

	function openEditEmp(emp: Employee) {
		empEditing = emp
		empName = emp.name
		empUsername = emp.username
		empPassword = ''
		empGender = emp.gender
		empPosition = emp.position
		empDeptId = emp.deptId
		empFormOpen = true
	}

	async function saveEmp() {
		try {
			if (empEditing) {
				await updateEmployee({
					id: empEditing.id,
					deptId: empDeptId,
					name: empName,
					username: empUsername,
					gender: empGender,
					position: empPosition,
					password: empPassword || undefined,
				})
			} else {
				await addEmployee({
					deptId: empDeptId,
					name: empName,
					username: empUsername,
					password: empPassword || '123456',
					gender: empGender,
					position: empPosition,
				})
			}
			toast.success('已保存员工')
			empFormOpen = false
			await load()
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '保存失败')
		}
	}
</script>

<Modal {open} title="员工管理" wide onClose={onClose}>
	{#if loading}
		<div class="hint">加载中…</div>
	{:else}
		<div class="employee-layout">
			<aside class="dept-pane">
				<div class="pane-head">
					<strong>组织</strong>
					<button type="button" title="新建根部门" aria-label="新建根部门" onclick={() => openAddDept(null)}>
						<Plus size={14} />
						根部门
					</button>
				</div>
				{#each flatDepts as dept (dept.id)}
					<div
						class="dept-row"
						class:active={$selectedOrg?.id === dept.id}
						style:padding-left={`${8 + dept.depth * 14}px`}
					>
						<button type="button" class="dept-name" onclick={() => selectDept(dept.id)}>
							{dept.name}
						</button>
						<div class="dept-actions">
							<button
								type="button"
								class="dept-more"
								title="更多操作"
								aria-label="更多操作"
								onclick={e => {
									e.stopPropagation()
									menuFor = menuFor === dept.id ? null : dept.id
								}}
							>
								<Ellipsis size={14} />
							</button>
							{#if menuFor === dept.id}
								<button
									type="button"
									class="menu-mask"
									aria-label="关闭"
									onclick={() => (menuFor = null)}
								></button>
								<div class="dept-menu" role="menu">
									<button type="button" onclick={() => openAddDept(dept.id)}>
										<FolderPlus size={14} />
										新增
									</button>
									<button type="button" onclick={() => openEditDept(dept)}>
										<Pencil size={14} />
										重命名
									</button>
									<button type="button" class="danger" onclick={() => void removeDept(dept)}>
										<Trash2 size={14} />
										删除
									</button>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</aside>
			<section class="emp-pane">
				<div class="pane-head">
					<input placeholder="搜索姓名" bind:value={keyword} onkeydown={e => e.key === 'Enter' && void load()} />
					<button type="button" onclick={() => void load()}>搜索</button>
					<button type="button" class="primary" onclick={openAddEmp}>新建员工</button>
				</div>
				<table>
					<thead>
						<tr>
							<th>姓名</th>
							<th>账号</th>
							<th>职位</th>
							<th>角色</th>
							<th>状态</th>
							<th>操作</th>
						</tr>
					</thead>
					<tbody>
						{#each $employees as emp (emp.id)}
							<tr>
								<td>{emp.name}</td>
								<td>{emp.username}</td>
								<td>{emp.position || '—'}</td>
								<td>
									<select
										value={emp.role}
										onchange={async e => {
											try {
												await setEmployeeRole({
													id: emp.id,
													role: (e.currentTarget as HTMLSelectElement).value as 'admin' | 'member',
												})
												await load()
											} catch (error) {
												toast.error(error instanceof Error ? error.message : '更新失败')
											}
										}}
									>
										<option value="member">成员</option>
										<option value="admin">管理员</option>
									</select>
								</td>
								<td>
									<select
										value={emp.status}
										onchange={async e => {
											try {
												await setEmployeeStatus({
													id: emp.id,
													status: (e.currentTarget as HTMLSelectElement).value as 'active' | 'resigned',
												})
												await load()
											} catch (error) {
												toast.error(error instanceof Error ? error.message : '更新失败')
											}
										}}
									>
										<option value="active">在职</option>
										<option value="resigned">离职</option>
									</select>
								</td>
								<td class="ops">
									<button type="button" onclick={() => openEditEmp(emp)}>编辑</button>
									<button type="button" onclick={() => (authEmployee = emp)}>权限</button>
									<button
										type="button"
										class="danger"
										onclick={async () => {
											if (!confirm(`删除员工「${emp.name}」？`)) return
											try {
												await deleteEmployee(emp.id)
												toast.success('已删除')
												await load()
											} catch (error) {
												toast.error(error instanceof Error ? error.message : '删除失败')
											}
										}}>删除</button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<div class="pager">共 {$employeesTotal} 人 · 第 {page} 页
					<button type="button" disabled={page <= 1} onclick={() => { page -= 1; void load() }}>上一页</button>
					<button type="button" disabled={page * 10 >= $employeesTotal} onclick={() => { page += 1; void load() }}>下一页</button>
				</div>
			</section>
		</div>
	{/if}
</Modal>

<Modal open={deptFormOpen} title={deptEditing ? '修改部门' : '新建部门'} onClose={() => (deptFormOpen = false)}>
	<label class="field"><span>部门名称</span><input bind:value={deptName} /></label>
	{#snippet footer()}
		<button type="button" class="btn" onclick={() => (deptFormOpen = false)}>取消</button>
		<button type="button" class="btn primary" onclick={() => void saveDept()}>保存</button>
	{/snippet}
</Modal>

<Modal open={empFormOpen} title={empEditing ? '编辑员工' : '新建员工'} onClose={() => (empFormOpen = false)}>
	<label class="field"><span>姓名</span><input bind:value={empName} /></label>
	<label class="field"><span>账号</span><input bind:value={empUsername} /></label>
	<label class="field"><span>密码{empEditing ? '（留空不改）' : ''}</span><input type="password" bind:value={empPassword} /></label>
	<label class="field"><span>职位</span><input bind:value={empPosition} /></label>
	<label class="field">
		<span>性别</span>
		<select bind:value={empGender}><option value="male">男</option><option value="female">女</option></select>
	</label>
	<label class="field">
		<span>部门</span>
		<select bind:value={empDeptId}>
			{#each flatDepts as dept}
				<option value={dept.id}>{'　'.repeat(dept.depth)}{dept.name}</option>
			{/each}
		</select>
	</label>
	{#snippet footer()}
		<button type="button" class="btn" onclick={() => (empFormOpen = false)}>取消</button>
		<button type="button" class="btn primary" onclick={() => void saveEmp()}>保存</button>
	{/snippet}
</Modal>

<AssignPermissionModal employee={authEmployee} onClose={() => (authEmployee = null)} />

<style>
	.hint { text-align: center; color: #888; padding: 24px; }
	.employee-layout { display: grid; grid-template-columns: 240px 1fr; gap: 12px; min-height: 420px; }
	.dept-pane, .emp-pane { border: 1px solid #e8eaed; border-radius: 8px; overflow: auto; }
	.pane-head { display: flex; gap: 8px; align-items: center; padding: 10px; border-bottom: 1px solid #e8eaed; }
	.pane-head input { flex: 1; height: 30px; border: 1px solid #d0d3d6; border-radius: 6px; padding: 0 8px; }
	.pane-head > button {
		height: 28px;
		padding: 0 8px;
		border: 1px solid #d0d3d6;
		border-radius: 6px;
		background: #fff;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.dept-row {
		display: flex;
		align-items: center;
		min-height: 32px;
		position: relative;
	}
	.dept-row.active { background: #eef3ff; }
	.dept-name {
		flex: 1;
		border: 0;
		background: transparent;
		text-align: left;
		padding: 8px 4px;
		cursor: pointer;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.dept-actions {
		position: relative;
		padding-right: 4px;
		flex-shrink: 0;
	}
	.dept-more {
		border: 0;
		background: transparent;
		cursor: pointer;
		padding: 2px 6px;
		display: inline-flex;
		color: #8f959e;
		opacity: 0;
		border-radius: 4px;
	}
	.dept-row:hover .dept-more,
	.dept-row.active .dept-more,
	.dept-actions:focus-within .dept-more {
		opacity: 1;
	}
	.dept-more:hover {
		background: #f0f1f2;
		color: #3370ff;
	}
	.menu-mask {
		position: fixed;
		inset: 0;
		border: 0;
		background: transparent;
		z-index: 40;
	}
	.dept-menu {
		position: absolute;
		right: 0;
		top: 100%;
		z-index: 41;
		min-width: 128px;
		background: #fff;
		border: 1px solid #e8eaed;
		border-radius: 8px;
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
		display: flex;
		flex-direction: column;
		padding: 4px;
	}
	.dept-menu button {
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
	.dept-menu button:hover { background: #f5f6f7; }
	.dept-menu .danger { color: #f04438; }
	table { width: 100%; border-collapse: collapse; font-size: 13px; }
	th, td { border-bottom: 1px solid #e8eaed; padding: 8px; text-align: left; }
	.ops { display: flex; gap: 6px; }
	.ops button { height: 28px; padding: 0 8px; border: 1px solid #d0d3d6; border-radius: 6px; background: #fff; cursor: pointer; }
	.primary, .btn.primary { border-color: #3370ff !important; background: #3370ff !important; color: #fff !important; }
	.danger { color: #f04438; }
	.pager { display: flex; justify-content: flex-end; gap: 8px; align-items: center; padding: 10px; }
	.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
	.field input, .field select { height: 34px; border: 1px solid #d0d3d6; border-radius: 6px; padding: 0 8px; }
	.btn { height: 32px; padding: 0 14px; border: 1px solid #d0d3d6; border-radius: 6px; background: #fff; cursor: pointer; }
</style>
