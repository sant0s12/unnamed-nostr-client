import { kinds } from 'nostr-tools';
import { relayPool, readRelays } from '$lib/relays';
import type { Event } from 'nostr-tools';
import { get } from 'svelte/store';
import { isValid } from 'nostr-tools/nip05';
import { getRepostedEvent } from 'nostr-tools/nip18';
import { npubEncode } from 'nostr-tools/nip19';

export type Community = {
	id: string;
	author: User;
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
	author: User;
	createdAt: number;
	communities?: (Community | Promise<Community | null>)[];
	title?: string;
	content: string;
	media?: string;
	repostedBy?: (Post | Promise<Post>)[];
};

export type User = {
	pubkey: string;
	name?: string;
	nip05?: string;
	verified?: boolean;
	about?: string;
	picture?: string;
	meta?: Event;
};

export async function getTopCommunities(since: Date, limit?: number) {
	let communities: Map<string, number> = new Map();

	let lists = await relayPool.querySync(get(readRelays), {
		kinds: [kinds.CommunitiesList],
		since: since.getTime() / 1000,
		limit: limit
	});

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
	let events = await relayPool.querySync(get(readRelays), {
		kinds: [kinds.CommunityDefinition],
		limit: limit
	});
	return events.map(parseCommunityDefinition);
}

export async function getCommunity(author: User, name: string): Promise<Community | null> {
	let events = await relayPool.querySync(get(readRelays), {
		kinds: [kinds.CommunityDefinition],
		authors: [author.pubkey],
		'#d': [name]
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
		author: { pubkey: author },
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
		relayPool
			.querySync(get(readRelays), {
				kinds: [kinds.CommunitiesList],
				'#a': [`${kinds.CommunityDefinition}:${community.author}:${community.name}`]
			})
			.then((events) => callback(new Set(events).size));
	} catch (e) {
		throw new Error('Failed to get community subscribers');
	}
}

export async function getUserMetadata(user: User) {
	let event = await relayPool.get(get(readRelays), {
		kinds: [kinds.Metadata],
		authors: [user.pubkey]
	});

	if (!event) {
		return user;
	}

	user.meta = event;

	return parseUserMetadata(event);
}

export async function parseUserMetadata(event: Event) {
	if (event.kind !== kinds.Metadata) {
		throw new Error('Invalid event kind');
	}

	let user: User = {
		pubkey: event.pubkey
	};

	let content = JSON.parse(event.content);
	user.name = content.name;
	user.nip05 = content.nip05;
	user.about = content.about;
	user.picture = content.picture;

	if (user.nip05) {
		user.verified = await isValid(event.pubkey, user.nip05);
	}

	return user;
}

// TODO: Remove multiple reactions from the same user
export async function getPostReactions(post: Post) {
	let events = await relayPool.querySync(get(readRelays), {
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

export function getCommunityTopLevelPosts(community: Community, callback: (posts: Post) => void) {
	relayPool.subscribeManyEose(
		get(readRelays),
		[
			{
				kinds: [kinds.ShortTextNote, kinds.LongFormArticle, kinds.Repost],
				'#a': [`${kinds.CommunityDefinition}:${community.author.pubkey}:${community.name}`]
			}
		],
		{
			onevent(event) {
				if (!event) {
					return;
				} else if (event.kind !== kinds.Repost && event.tags.some((tag) => tag[0] === 'e')) {
					return;
				}

				let post = parsePost(event);
				if (post) {
					callback(post);
				}
			}
		}
	);
}

export function npubEncodeShort(pubkey: string) {
	let npub = npubEncode(pubkey);
	return npub.slice(0, 8) + '...' + npub.slice(-8);
}

export function getEventCommunities(event: Event) {
	let communities: Promise<Community | null>[] = [];
	for (const tag of event.tags) {
		if (tag[0] === 'a' && tag[1].split(':')[0] === kinds.CommunityDefinition.toString()) {
			communities.push(getCommunity({ pubkey: tag[1].split(':')[1] }, tag[1].split(':')[2]));
		}
	}

	return communities;
}

export function parsePost(event: Event) {
	let post: Post = {
		id: event.id,
		author: { pubkey: event.pubkey },
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
			author: { pubkey: repostedEvent.pubkey },
			content: repostedEvent.content,
			createdAt: repostedEvent.created_at,
			communities: [
				...getEventCommunities(repostedEvent),
				...getEventCommunities(repostedEvent),
				...post.communities,
				...post.communities
			]
		};

		repostedPost.repostedBy = [post];
		post = repostedPost;
	}

	let titleTag = event.tags.find((tag) => tag[0] === 'subject');
	post.title = titleTag ? titleTag[1] : undefined;

	return post;
}
