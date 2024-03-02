import { writable, type Writable } from 'svelte/store';
import NDKSvelte from '@nostr-dev-kit/ndk-svelte';
import { type NDKSigner } from '@nostr-dev-kit/ndk';

let defaultRelays = ["wss://nos.lol"];

const ndk = writable(
	new NDKSvelte({
		explicitRelayUrls: defaultRelays,
	})
);

export let signer: Writable<NDKSigner> = writable();

export default ndk;
