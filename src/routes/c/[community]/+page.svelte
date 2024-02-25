<script lang="ts">
	import { relays, relayPool } from '$lib/relays';
	import { page } from '$app/stores';
	import { parseCommunityDefinition, type Post } from '$lib/nostr';
	import PostCard from '$lib/components/PostCard.svelte';
	import { kinds } from 'nostr-tools';
	import { get } from 'svelte/store';
	import { Avatar, Heading, Spinner } from 'flowbite-svelte';

	let communityPromise = relayPool
		.get(get(relays), { ids: [$page.params.community] })
		.then((event) => (event ? parseCommunityDefinition(event) : Promise.reject('Event not found')));

	let posts: Post[] = [];
	let postsPromise = communityPromise.then((community) => {
		relayPool.subscribeManyEose(
			get(relays),
			[
				{
					kinds: [kinds.ShortTextNote],
					'#a': [`${kinds.CommunityDefinition}:${community.author.pubkey}:${community.name}`]
				}
			],
			{
				onevent(event) {
					if (event) {
						let titleTag = event.tags.find((tag) => tag[0] === 'subject');
						let title = titleTag ? titleTag[1] : undefined;
						posts = [
							...posts,
							{
								id: event.id,
								author: { pubkey: event.pubkey },
								title: title,
								content: event.content,
								community: community,
								createdAt: event.created_at
							}
						];
					}
				}
			}
		);
	});
</script>

{#await communityPromise}
	<Spinner />
{:then community}
	<div class="p-5 w-full rounded-md h-30 flex flex-row space-x-3 items-center dark:text-white">
		<div>
			<Avatar class="items-stretch" src={community.image} />
		</div>
		<div class="flex flex-col h-full w-full">
			<Heading tag="h3">{community.name}</Heading>
		</div>
	</div>

	<ul class="flex flex-col space-y-3 items-stretch">
		{#await postsPromise}
			<p>Posts</p>
		{/await}
		{#each posts as post}
			<li>
				<PostCard {post} />
			</li>
		{/each}
	</ul>
{/await}
