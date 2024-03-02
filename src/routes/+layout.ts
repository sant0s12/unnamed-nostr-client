import { loggedInWithExtension, loginWithExtension } from '$lib/auth';
import {  setRandomRelay } from '$lib/relays';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';
import { ndk } from '$lib/nostr';

export const ssr = false;

export const load: LayoutLoad = async ({ fetch }) => {
	localStorage.debug = 'ndk:*';

	await get(ndk).connect();
	loginWithExtension();
};
