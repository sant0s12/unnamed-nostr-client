import { kinds } from 'nostr-tools';
import { relayPool, relays } from '$lib/relays';
import type { Event } from 'nostr-tools';
import { get } from 'svelte/store';
import { isValid } from 'nostr-tools/nip05';
import { getRepostedEvent } from 'nostr-tools/nip18';

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
	community?: Community;
	title?: string;
	content: string;
	media?: string;
	createdAt: number;
	repost?: Post;
};

export type User = {
	pubkey: string;
	name?: string;
	nip05?: string;
	verified?: boolean;
	about?: string;
	picture?: string;
};

export async function getTopCommunities(since: Date, limit?: number) {
	let communities: Map<string, number> = new Map();

	let lists = await relayPool.querySync(get(relays), {
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
	let events = await relayPool.querySync(get(relays), {
		kinds: [kinds.CommunityDefinition],
		limit: limit
	});
	return events.map(parseCommunityDefinition);
}

export async function getCommunity(author: User, name: string): Promise<Community | null> {
	let events = await relayPool.querySync(get(relays), {
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
			.querySync(get(relays), {
				kinds: [kinds.CommunitiesList],
				'#a': [`${kinds.CommunityDefinition}:${community.author}:${community.name}`]
			})
			.then((events) => callback(new Set(events).size));
	} catch (e) {
		throw new Error('Failed to get community subscribers');
	}
}

export async function getUserMetadata(user: User) {
	let event = await relayPool.get(get(relays), {
		kinds: [kinds.Metadata],
		authors: [user.pubkey]
	});

	if (!event) {
		return user;
	}

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

export async function getPostReactions(post: Post) {
	let events = await relayPool.querySync(get(relays), {
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
		get(relays),
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

				let post: Post = {
					id: event.id,
					author: { pubkey: event.pubkey },
					content: '',
					community: community,
					createdAt: event.created_at
				};

				if (event.kind === kinds.Repost) {
					let repostedEvent = getRepostedEvent(event);
					if (!repostedEvent) {
						return;
					}

					post.content = "Repost";
					post.repost = {
						id: repostedEvent.id,
						author: { pubkey: repostedEvent.pubkey },
						content: repostedEvent.content,
						createdAt: repostedEvent.created_at
					};

				} else {
					let titleTag = event.tags.find((tag) => tag[0] === 'subject');
					post.title = titleTag ? titleTag[1] : undefined;
					post.content = event.content;
				}

				callback(post);
			}
		}
	);
}
