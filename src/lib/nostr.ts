import NDK, { NDKUser, NDKEvent, type NostrEvent } from '@nostr-dev-kit/ndk';
import { get, writable, type Readable, type Writable } from 'svelte/store';
import ndk from './stores/ndk';
import { kinds } from 'nostr-tools';
import { derived } from 'svelte/store';
import { npubEncode } from 'nostr-tools/nip19';
import type { NDKEventStore } from '@nostr-dev-kit/ndk-svelte';

export type Community = {
	id: string;
	author: NDKUser;
	name: string;
	description: string;
	image: string;
	moderators: string[];
	relays: string[];
	subscribers?: number;
	createdAt?: number;
};

export async function getTopCommunities(since: Date, limit?: number) {
	let communities: Map<string, number> = new Map();

	let lists = await get(ndk).fetchEvents({
		kinds: [kinds.CommunitiesList],
		since: since.getTime() / 1000,
		limit: limit
	});

	lists.forEach((list: NDKEvent) => {
		list.tags.forEach((tag) => {
			if (tag[0] === 'a' && tag[1].startsWith(kinds.CommunityDefinition.toString())) {
				communities.set(tag[1], (communities.get(tag[1]) || 0) + 1);
			}
		});
	});

	return [...communities.entries()].sort((a, b) => b[1] - a[1]);
}

export async function getNewCommunities(limit: number) {
	let events = await get(ndk).fetchEvents({
		kinds: [kinds.CommunityDefinition as number],
		limit: limit
	});

	let res: Community[] = [];
	events.forEach((e) => res.push(parseCommunityDefinition(e)));

	return res;
}

export async function getCommunity(author: NDKUser, name: string): Promise<Community | null> {
	let event = await get(ndk).fetchEvent({
		kinds: [kinds.CommunityDefinition as number],
		authors: [author.pubkey],
		'#d': [name]
	});

	return event === null ? event : parseCommunityDefinition(event);
}

export function parseCommunityDefinition(event: NDKEvent): Community {
	if (event.kind !== kinds.CommunityDefinition) {
		throw new Error('Invalid event kind');
	}

	let id = event.id;
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
		author: new NDKUser({ pubkey: event.pubkey }),
		name: name,
		description,
		image,
		moderators,
		relays,
		createdAt
	};

	return community;
}

export function getCommunitySubscribers(
	community: Community,
	callback: (numSubscribers: number) => void
) {
	try {
		get(ndk)
			.fetchEvents({
				kinds: [kinds.CommunitiesList],
				'#a': [`${kinds.CommunityDefinition}:${community.author}:${community.name}`]
			})
			.then((events) => callback(new Set(events).size));
	} catch (e) {
		throw new Error('Failed to get community subscribers');
	}
}

// TODO: Remove multiple reactions from the same user
export async function getPostReactions(post: Post) {
	let events = await get(ndk).fetchEvents({
		kinds: [kinds.Reaction],
		'#e': [post.id],
		'#p': [post.author.pubkey]
	});

	let reactions: Map<string, number> = new Map();

	events.forEach((event) => {
		reactions.set(event.content, (reactions.get(event.content) || 0) + 1);
	});

	return reactions;
}

export async function getEventReactions(event: NDKEvent) {
	let events = await get(ndk).fetchEvents({
		kinds: [kinds.Reaction],
		'#e': [event.id],
		'#p': [event.author.pubkey]
	});

	let reactions: Map<string, number> = new Map();

	events.forEach((event) => {
		reactions.set(event.content, (reactions.get(event.content) || 0) + 1);
	});

	return reactions;
}

export class Post extends NDKEvent {
	sortValue: Writable<number>;
	title?: string;
	communities?: (Community | Promise<Community | null>)[];

	constructor(ndk: NDK | undefined, rawEvent?: NostrEvent) {
		super(ndk, rawEvent);

		this.sortValue = writable(0);
		this.title = this.tags.find((tag) => tag[0] === 'subject')?.at(1);
		getEventCommunities(this).forEach((communityProise) =>
			communityProise.then((community) => {
				if (community) {
					this.communities = this.communities ? [...this.communities, community] : [community];
				}
			})
		);
		getPostReactions(this).then((reactions) => {
			this.sortValue.set(reactions.get('+') || 0);
		});
	}

	static from(event: NDKEvent) {
		return new Post(event.ndk, event.rawEvent());
	}
}

function sortEventStore<T extends NDKEvent>(
	eventStore: NDKEventStore<T>,
	scoreFn: (event: T) => number | Promise<number>
) {
	let scoreMap = writable(new Map<NDKEvent, number>());

	let postStore = derived([eventStore, scoreMap], ([$eventStore, $scoreMap]) => {
		$eventStore.forEach((event) => {
			if (!$scoreMap.has(event)) {
				$scoreMap.set(event, 0);

				let score = scoreFn(event);
				if (score instanceof Promise) {
					score.then((score) => {
						scoreMap.update(($scoreMap) => $scoreMap.set(event, score));
					});
				} else {
					scoreMap.update(($scoreMap) => $scoreMap.set(event, score as number));
				}
			}
		});

		return $eventStore
			.filter((e) => $scoreMap.has(e))
			.sort((a, b) => ($scoreMap.get(b) as number) - ($scoreMap.get(a) as number));
	});

	return postStore;
}

export function getTopPosts(community: Community) {
	let eventStore = get(ndk).storeSubscribe(
		{
			kinds: [kinds.ShortTextNote, kinds.LongFormArticle, kinds.Repost],
			'#a': [`${kinds.CommunityDefinition}:${community.author.pubkey}:${community.name}`]
		},
		{
			closeOnEose: true
		}
	);

	return sortEventStore(eventStore, (event) =>
		getEventReactions(event).then((reactions) => reactions.get('+') || 0)
	);
}

export function getCommunityTopLevelPosts(community: Community) {
	let eventStore = get(ndk).storeSubscribe(
		{
			kinds: [kinds.ShortTextNote, kinds.LongFormArticle, kinds.Repost],
			'#a': [`${kinds.CommunityDefinition}:${community.author.pubkey}:${community.name}`]
		},
		{
			closeOnEose: true
		},
		Post
	);

	let postStore = derived(eventStore, ($eventStore) => {
		return $eventStore.flatMap((post) => {
			if (!post) {
				return [];
			} else if (post.kind !== kinds.Repost && post.tags.some((tag) => tag[0] === 'e')) {
				return [];
			}

			if (!post) {
				return [];
			} else {
				return post;
			}
		});
	});

	return postStore;
}

export function npubEncodeShort(pubkey: string) {
	let npub = npubEncode(pubkey);
	return npub.slice(0, 8) + '...' + npub.slice(-8);
}

export function getEventCommunities(event: NDKEvent) {
	let communities: Promise<Community | null>[] = [];
	for (const tag of event.tags) {
		if (tag[0] === 'a' && tag[1].split(':')[0] === kinds.CommunityDefinition.toString()) {
			let author = new NDKUser({ pubkey: tag[1].split(':')[1] });
			communities.push(getCommunity(author, tag[1].split(':')[2]));
		}
	}

	return communities;
}
