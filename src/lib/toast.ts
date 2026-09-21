import { writable } from 'svelte/store'

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastItem {
	id: number
	kind: ToastKind
	text: string
}

const toasts = writable<ToastItem[]>([])
let seq = 1
const hideTimers = new Map<number, ReturnType<typeof setTimeout>>()

function push(kind: ToastKind, text: string, duration = 2400) {
	const id = seq++
	toasts.update(list => [...list, { id, kind, text }])
	if (duration > 0) {
		hideTimers.set(
			id,
			setTimeout(() => dismiss(id), duration),
		)
	}
	return id
}

export function dismiss(id: number) {
	const timer = hideTimers.get(id)
	if (timer) clearTimeout(timer)
	hideTimers.delete(id)
	toasts.update(list => list.filter(item => item.id !== id))
}

export const toast = {
	subscribe: toasts.subscribe,
	success: (text: string) => push('success', text),
	error: (text: string) => push('error', text),
	info: (text: string) => push('info', text),
	loading: (text: string) => push('info', text, 0),
}
