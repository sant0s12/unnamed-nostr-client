import { writable, type Writable } from 'svelte/store';
import NDKSvelte from '@nostr-dev-kit/ndk-svelte';
import { type NDKSigner } from '@nostr-dev-kit/ndk';
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie';
import { browser } from '$app/environment';

const clientName = 'unnamed-nostr-client';

let defaultRelays = ['wss://nos.lol'];

let ndkSvelte = new NDKSvelte({ explicitRelayUrls: defaultRelays, clientName });

if (browser) {
	ndkSvelte.cacheAdapter = new NDKCacheAdapterDexie();
}

const ndk = writable(ndkSvelte);

export let signer: Writable<NDKSigner> = writable();

export default ndk;
