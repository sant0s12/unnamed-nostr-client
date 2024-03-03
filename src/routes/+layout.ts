import { signInWithExtension, signedInWithExtension } from '$lib/auth';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';
import ndk from '$lib/stores/ndk';

export const ssr = false;

export const load: LayoutLoad = async ({ fetch }) => {
	localStorage.debug = 'ndk:*';

	await get(ndk).connect();
	if (get(signedInWithExtension)) {
		signInWithExtension();
	}
};
