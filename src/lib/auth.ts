import { browser } from "$app/environment";
import type { EventTemplate, VerifiedEvent } from "nostr-tools";

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
		return await window.nostr.getPublicKey();
	} else {
		return new Error('No extension found');
	}
}
