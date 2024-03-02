import { kinds } from 'nostr-tools';
import { defaultRelays } from '$lib/relays';
import { derived, get, writable, type Writable } from 'svelte/store';
import { getRepostedEvent } from 'nostr-tools/nip18';
import { npubEncode } from 'nostr-tools/nip19';
import NDKSvelte from '@nostr-dev-kit/ndk-svelte';
import { NDKEvent, NDKUser, type NDKSigner } from '@nostr-dev-kit/ndk';

export const ndk = writable(
	new NDKSvelte({
		explicitRelayUrls: defaultRelays
	})
);

export let signer: Writable<NDKSigner> = writable();

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

export type Post = {
	id: string;
	author: NDKUser;
	createdAt?: number;
	communities?: (Community | Promise<Community | null>)[];
	title?: string;
	content: string;
	media?: string;
	repostedBy?: (Post | Promise<Post>)[];
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

export function getCommunityTopLevelPosts(community: Community) {
	let eventStore = get(ndk).storeSubscribe(
		{
			kinds: [kinds.ShortTextNote, kinds.LongFormArticle, kinds.Repost],
			'#a': [`${kinds.CommunityDefinition}:${community.author.pubkey}:${community.name}`],
		},
		{
			closeOnEose: true
		}
	);

	let postStore = derived(eventStore, ($eventStore) => {
		return $eventStore.flatMap((event) => {
			if (!event) {
				return [];
			} else if (event.kind !== kinds.Repost && event.tags.some((tag) => tag[0] === 'e')) {
				return [];
			}

			let post = parsePost(event);

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

export function parsePost(event: NDKEvent) {
	let post: Post = {
		id: event.id,
		author: event.author,
		content: event.content,
		createdAt: event.created_at
	};

	post.communities = getEventCommunities(event);

	if (event.kind === kinds.Repost) {
		let repostedEvent = getRepostedEvent(event);
		if (!repostedEvent) {
			return undefined;
		}

		let repostedPost: Post = {
			id: repostedEvent.id,
			author: new NDKUser({ pubkey: repostedEvent.pubkey }),
			content: repostedEvent.content,
			createdAt: repostedEvent.created_at,
			communities: [...getEventCommunities(new NDKEvent(get(ndk), repostedEvent)), ...post.communities]
		};

		repostedPost.repostedBy = [post];
		post = repostedPost;
	}

	let titleTag = event.tags.find((tag) => tag[0] === 'subject');
	post.title = titleTag ? titleTag[1] : undefined;

	return post;
}
