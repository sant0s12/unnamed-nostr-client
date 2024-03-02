import { persisted } from 'svelte-persisted-store';
import { get } from 'svelte/store';
import { ndk, signer } from '$lib/nostr';
import { NDKNip07Signer } from '@nostr-dev-kit/ndk';

export function loginWithExtension() {
	signer.set(new NDKNip07Signer());
	get(signer)
		.user()
		.then((user) => {
			ndk.update(($ndk) => {
				$ndk.signer = get(signer);
				$ndk.activeUser = user;
				$ndk.activeUser.ndk = $ndk;
				$ndk.activeUser.fetchProfile().then(() => ndk.set(get(ndk)));
				$ndk.connect();
				return $ndk;
			});
		});
}

export const loggedInWithExtension = persisted('loggedInWithExtension', false);
