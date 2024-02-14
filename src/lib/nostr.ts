import { Relay, kinds } from "nostr-tools";
import type { Event, Subscription } from "nostr-tools";

export function getAllCommunities(relay: Relay, onEvent: (evt: Community) => void): Subscription {
	let res: Community[] = [];
	try {
		const sub = relay.subscribe([
			{
				kinds: [kinds.CommunityDefinition],
			},
		], {
			onevent(event) { onEvent(parseCommunityDefinition(event)) },
			oneose() {
				sub.close()
			}
		})

		return sub;
	} catch (e) {
		throw new Error('Failed to get communities')
	}
}

export type Community = {
	id: string;
	description: string;
	image: string;
	moderators: string[];
	relays: string[];
};

export function parseCommunityDefinition(event: Event): Community {
	if (event.kind !== kinds.CommunityDefinition) {
		throw new Error('Invalid event kind');
	}

	let id = '';
	let description = '';
	let image = '';
	let moderators: string[] = [];
	let relays: string[] = [];

	for (const tag of event.tags) {
		switch (tag[0]) {
			case 'd':
				id = tag[1];
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
		description,
		image,
		moderators,
		relays,
	};

	return community;
}
