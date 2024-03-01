import { SimplePool, kinds } from 'nostr-tools';
import { get, writable } from 'svelte/store';
import _ from 'lodash';
import type { User } from './nostr';

export const defaultRelays = ['wss://nos.lol'];

export const readRelays = writable(defaultRelays as string[]);
export const writeRelays = writable(defaultRelays as string[]);

let nostrWatchOnline: string[] = [];

export async function setRandomRelay() {
	try {
		if (nostrWatchOnline.length === 0) {
			nostrWatchOnline = await fetch('https://api.nostr.watch/v1/online').then((res) => res.json());

			if (nostrWatchOnline.length === 0) {
				throw new Error('No online relays');
			}
		}

		readRelays.set(_.sampleSize(nostrWatchOnline, 1));
	} catch (e) {
		console.error('Failed to fetch online relays', e);
	}
}

export async function getUserRelays(user: User) {
	let relayListEvent = await relayPool.get(get(readRelays), {
		authors: [user.pubkey],
		kinds: [kinds.RelayList]
	});

	if (relayListEvent) {
		let newReadRelays = [];
		let newWriteRelays = [];

		for (const tag of relayListEvent.tags.filter((tag) => tag.length > 1 && tag[0] === 'r')) {
			if (tag.length == 2) {
				newReadRelays.push(tag[1]);
				newWriteRelays.push(tag[1]);
			} else if (tag[2] === 'read') {
				newReadRelays.push(tag[1]);
			} else if (tag[2] === 'write') {
				newWriteRelays.push(tag[1]);
			}
		}

		if (newReadRelays.length > 0) {
			readRelays.set(newReadRelays);
		}

		if (newWriteRelays.length > 0) {
			writeRelays.set(newWriteRelays);
		}

		console.log('Relays updated', newReadRelays, newWriteRelays);
		return true;
	} else {
		console.error('Failed to get user relay list');
		return false;
	}
}

export const relayPool = new SimplePool();
