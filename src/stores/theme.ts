import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'pink';

function createThemeStore() {
	const { subscribe, set } = writable<Theme>('light');

	return {
		subscribe,
		set: (theme: Theme) => {
			set(theme);
			if (browser) {
				document.documentElement.setAttribute('data-theme', theme);
				localStorage.setItem('theme', theme);
			}
		},
		init: () => {
			if (browser) {
				const saved = localStorage.getItem('theme') as Theme | null;
				const initial = saved || 'light';
				document.documentElement.setAttribute('data-theme', initial);
				set(initial);
			}
		}
	};
}

export const theme = createThemeStore();
