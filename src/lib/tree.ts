export interface TreeLike {
	id: string
	parentId: string | null
}

export function getChildren<T extends TreeLike>(items: T[], parentId: string | null) {
	return items.filter(item => item.parentId === parentId)
}

export function getAncestors<T extends TreeLike>(items: T[], id: string) {
	const map = new Map(items.map(item => [item.id, item]))
	const ancestors: T[] = []
	let current = map.get(id)
	while (current?.parentId) {
		const parent = map.get(current.parentId)
		if (!parent) break
		ancestors.push(parent)
		current = parent
	}
	return ancestors
}

export function getDescendantIds<T extends TreeLike>(items: T[], id: string) {
	const ids = new Set<string>([id])
	const walk = (parentId: string) => {
		for (const item of items) {
			if (item.parentId === parentId) {
				ids.add(item.id)
				walk(item.id)
			}
		}
	}
	walk(id)
	return ids
}

export function matchesWithAncestors<T extends TreeLike & { name: string }>(items: T[], keyword: string) {
	const q = keyword.trim().toLowerCase()
	if (!q) return new Set(items.map(item => item.id))
	const matched = items.filter(item => item.name.toLowerCase().includes(q))
	const visible = new Set<string>()
	for (const item of matched) {
		visible.add(item.id)
		for (const ancestor of getAncestors(items, item.id)) {
			visible.add(ancestor.id)
		}
	}
	return visible
}
