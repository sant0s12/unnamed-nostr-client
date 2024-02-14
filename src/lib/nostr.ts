import { Relay, kinds } from "nostr-tools";
import type { Event } from "nostr-tools";

export async function getAllCommunities(relay: Relay): Promise<Community[]> {
	return new Promise((resolve, reject) => {
		let res: Community[] = [];
		try {
			const sub = relay.subscribe([
				{
					kinds: [kinds.CommunityDefinition],
					limit: 10,
				},
			], {
				onevent(event) {
					res.push(parseCommunityDefinition(event))
				},
				oneose() {
					sub.close()
					resolve(res)
				}
			})
		} catch (e) {
			reject(e)
		}
	});
}

type Community = {
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

	console.log(community);

	return community;
}
