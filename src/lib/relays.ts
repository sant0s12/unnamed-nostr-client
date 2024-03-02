import {  writable } from 'svelte/store';
import _ from 'lodash';

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
