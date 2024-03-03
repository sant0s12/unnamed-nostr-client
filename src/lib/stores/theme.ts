import { browser } from '$app/environment';
import toast from 'svelte-french-toast';
import { persisted } from 'svelte-persisted-store';
import type { Writable } from 'svelte/store';

let theme = persisted('theme', 'light') as Writable<'light' | 'dark' | 'system'>;

if (browser) {
	theme.subscribe(($theme) => {
		if ($theme === 'system') {
			if (window.matchMedia) {
				if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
					$theme = 'dark';
				} else {
					$theme = 'light';
				}
			} else {
				toast.error('Failed to read system theme, defaulting to light');
				$theme = 'light';
			}
		}

		switch ($theme) {
			case 'light':
				document.documentElement.classList.remove('dark');
				break;
			case 'dark':
				document.documentElement.classList.add('dark');
				break;
		}
	});

	if (window.matchMedia) {
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			theme.set(e.matches ? 'dark' : 'light');
		});
	}
}

export default theme;
