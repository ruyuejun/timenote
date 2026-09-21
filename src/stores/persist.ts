import { writable, type Writable } from 'svelte/store'

export function persisted<T>(key: string, initial: T): Writable<T> {
	let start = initial
	if (typeof localStorage !== 'undefined') {
		try {
			const raw = localStorage.getItem(key)
			if (raw != null) start = JSON.parse(raw) as T
		} catch {
			start = initial
		}
	}

	const store = writable(start)
	store.subscribe(value => {
		if (typeof localStorage === 'undefined') return
		try {
			if (value == null) localStorage.removeItem(key)
			else localStorage.setItem(key, JSON.stringify(value))
		} catch {
			/* ignore quota */
		}
	})
	return store
}
