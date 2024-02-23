import { kinds } from "nostr-tools";
import { relayPool, relays } from "$lib/relays";
import type { Event, SubCloser } from "nostr-tools";
import { get } from "svelte/store";

export type Community = {
	id: string;
	author: string;
	name: string;
	description: string;
	image: string;
	moderators: string[];
	relays: string[];
	subscribers?: number;
	createdAt?: number;
};

export async function getTopCommunities(since: Date) {
	let communities: Map<string, number> = new Map();

	let lists = await relayPool.querySync(get(relays),
		{ kinds: [kinds.CommunitiesList], since: since.getTime() / 1000, limit: 100 });

	lists.forEach((list: Event) => {
		list.tags.forEach((tag) => {
			if (tag[0] === 'a' && tag[1].startsWith(kinds.CommunityDefinition.toString())) {
				communities.set(tag[1], (communities.get(tag[1]) || 0) + 1);
			}
		});
	});

	return [...communities.entries()].sort((a, b) => b[1] - a[1]);
}

export async function getNewCommunities(limit: number) {
	return await relayPool.querySync(get(relays),
		{ kinds: [kinds.CommunityDefinition], limit: limit })
		.then((events) => events.map(parseCommunityDefinition));
}

export async function getCommunity(author: string, name: string): Promise<Community | null> {
	let events = await relayPool.querySync(get(relays),
		{
			kinds: [kinds.CommunityDefinition],
			authors: [author],
			"#d": [name]
		});

	if (events.length === 0) {
		return null;
	}

	return parseCommunityDefinition(events[0]);
}

export function parseCommunityDefinition(event: Event): Community {
	if (event.kind !== kinds.CommunityDefinition) {
		throw new Error('Invalid event kind');
	}

	let id = event.id;
	let author = event.pubkey;
	let name = '';
	let description = '';
	let image = '';
	let moderators: string[] = [];
	let relays: string[] = [];
	let createdAt = event.created_at;

	for (const tag of event.tags) {
		switch (tag[0]) {
			case 'd':
				name = tag[1];
				break;
			case 'description':
				description = tag[1];
				break;
			case 'image':
				image = tag[1];
				break;
			case 'p':
				moderators.push(tag[1]);
				break;
			case 'relay':
				relays.push(tag[1]);
				break;
		}
	}

	const community: Community = {
		id,
		author,
		name: name,
		description,
		image,
		moderators,
		relays,
		createdAt
	};

	return community;
}

export function getCommunitySubscribers(community: Community, callback: (numSubscribers: number) => void) {
	try {
		relayPool.querySync(get(relays),
			{
				kinds: [kinds.CommunitiesList],
				"#a": [`${kinds.CommunityDefinition}:${community.author}:${community.name}`]
			}).then((events) => callback(new Set(events).size))
	} catch (e) {
		throw new Error('Failed to get community subscribers')
	}
}
