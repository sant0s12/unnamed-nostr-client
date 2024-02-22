import { SimplePool } from 'nostr-tools';
import { writable } from 'svelte/store';

export const relays = writable(["wss://nos.lol", "wss://relay.nostr.band"] as string[]);

export const relayPool = new SimplePool();
