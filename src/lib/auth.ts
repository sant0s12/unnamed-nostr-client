import { browser } from '$app/environment';
import { persisted } from 'svelte-persisted-store';
import type { EventTemplate, VerifiedEvent } from 'nostr-tools';
import { writable } from 'svelte/store';
import { getUserMetadata, type User } from '$lib/nostr';
import { getUserRelays } from './relays';

declare global {
	interface Window {
		nostr: {
			getPublicKey: () => Promise<string>;
			signEvent: (event: EventTemplate) => Promise<VerifiedEvent>;
		};
	}
}

export async function loginWithExtension() {
	if (browser && window.hasOwnProperty('nostr')) {
		let pubkey = await window.nostr.getPublicKey();
		if (pubkey) {
			let user = { pubkey };
			await getUserRelays(user);
			loggedInUser.set(await getUserMetadata(user));
			loggedInWithExtension.set(true);
		}
	} else {
		return new Error('No extension found');
	}
}

export const loggedInWithExtension = persisted('loggedInWithExtension', false);

export const loggedInUser = writable<User | null>(null)
