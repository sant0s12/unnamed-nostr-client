import { kinds } from "nostr-tools";
import { relayPool, relays } from "$lib/stores";
import type { Event, SubCloser } from "nostr-tools";
import { get } from "svelte/store";

export function getAllCommunities(onEvent: (evt: Community) => void): SubCloser {
	try {
		return relayPool.subscribeManyEose(get(relays), [
			{
				kinds: [kinds.CommunityDefinition],
			}
		]
			, {
				async onevent(event) {
					let community = parseCommunityDefinition(event);
					community.subscribers = await getCommunitySubscribers(community);
					onEvent(community);
				},
			})
	} catch (e) {
		throw new Error('Failed to get communities: ' + e)
	}
}

export type Community = {
	id: string;
	author: string;
	name: string;
	description: string;
	image: string;
	moderators: string[];
	relays: string[];
	subscribers?: number;
};

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
	};

	return community;
}

export async function getCommunitySubscribers(community: Community) {
	try {
		let events = await relayPool.querySync(get(relays),
			{
				kinds: [kinds.CommunitiesList],
				"#a": [`${kinds.CommunityDefinition}:${community.author}:${community.name}`]
			});
		return (new Set(events)).size;;
	} catch (e) {
		throw new Error('Failed to get community subscribers')
	}
}
