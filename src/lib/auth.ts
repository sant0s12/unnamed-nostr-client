import { persisted } from 'svelte-persisted-store';
import { get } from 'svelte/store';
import ndk from '$lib/stores/ndk';
import { NDKNip07Signer } from '@nostr-dev-kit/ndk';
import toast from 'svelte-french-toast';
import ExtensionErrorToast from '$lib/components/ExtensionErrorToast.svelte';

export function signInOut() {
	if (get(ndk).activeUser) {
		ndk.update(($ndk) => {
			$ndk.activeUser = undefined;
			signedInWithExtension.set(false);

			return $ndk;
		});
	} else {
		signInWithExtension();
	}
}

export function signInWithExtension() {
	let signer = new NDKNip07Signer();
	signer
		.user()
		.then((user) => {
			ndk.update(($ndk) => {
				$ndk.signer = signer;
				$ndk.activeUser = user;
				$ndk.activeUser.ndk = $ndk;
				$ndk.activeUser.fetchProfile().then(() => ndk.set(get(ndk)));
				$ndk.connect();

				signedInWithExtension.set(true);

				return $ndk;
			});
		})
		.catch(() => {
			toast.error(ExtensionErrorToast);
			signedInWithExtension.set(false);
		});
}

export const signedInWithExtension = persisted('signedInWithExtension', false);
