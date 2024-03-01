import { loggedInWithExtension, loginWithExtension } from '$lib/auth';
import { getUserRelays, setRandomRelay } from '$lib/relays';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load: LayoutLoad = async ({ fetch }) => {
	loginWithExtension();
};
