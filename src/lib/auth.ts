import { browser } from '$app/environment';
import { persisted } from 'svelte-persisted-store';
import type { EventTemplate, VerifiedEvent } from 'nostr-tools';
import { writable } from 'svelte/store';
import { getUserMetadata, type User } from '$lib/nostr';
import { getUserRelays, setRandomRelays } from './relays';

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
		if (!pubkey) {
			throw new Error('Failed to get user pubkey');
		}

		let user = { pubkey };

		let found = false;
		let tries = 5;
		for (let i = 0; i < 5; i++) {
			if (await getUserRelays(user)) {
				found = true;
				break;
			} else {
				await setRandomRelays();
			}
		}

		if (!found) {
			throw new Error(`Failed to get user relays after ${tries} tries`);
		}

		loggedInUser.set(await getUserMetadata(user));
		loggedInWithExtension.set(true);

		console.log("Successfully logged in");

		return loggedInUser;
	} else {
		throw new Error('No extension found');
	}
}

export const loggedInWithExtension = persisted('loggedInWithExtension', false);

export const loggedInUser = writable<User | null>(null);
