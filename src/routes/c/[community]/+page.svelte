<script lang="ts">
	import { relays, relayPool } from '$lib/stores';
	import { page } from '$app/stores';
	import { getCommunitySubscribers, parseCommunityDefinition } from '$lib/nostr';
	import Spinner from '$lib/components/Spinner.svelte';
	import { Avatar } from '@skeletonlabs/skeleton';
	import Post from '$lib/components/Post.svelte';
	import { kinds } from 'nostr-tools';

	let communityPromise = relayPool
		.get($relays, { ids: [$page.params.community] })
		.then((event) => (event ? parseCommunityDefinition(event) : Promise.reject('Event not found')));

	let subscribersPromise = communityPromise.then((community) => getCommunitySubscribers(community));

	type Post = {
		id: string;
		title: string;
		content: string;
		media?: string;
	};

	let posts: Post[] = [];
	let postsPromise = communityPromise.then((community) => {
		relayPool.subscribeManyEose(
			$relays,
			[
				{
					kinds: [kinds.ShortTextNote],
					'#a': [`${kinds.CommunityDefinition}:${community.author}:${community.name}`]
				}
			],
			{
				onevent(event) {
					if (event) {
						let titleTag = event.tags.find((tag) => tag[0] === 'subject');
						let title = titleTag ? titleTag[1] : 'No title';
						posts = [
							...posts,
							{
								id: event.id,
								title: title,
								content: event.content
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
	<div class="bg-surface-500 p-5 w-full rounded-md h-30 flex flex-row space-x-3 items-center">
		<div>
			<Avatar class="items-stretch" src={community.image} placeholder={community.name} />
		</div>
		<div class="flex flex-col h-full w-full">
			<h2 class="h2">{community.name}</h2>
			{#await subscribersPromise then subscribers}
				<p>{subscribers} subscribers</p>
			{/await}
		</div>
	</div>

	<ul class="flex flex-col divide-y divide-surface-500">
		{#await postsPromise}
			<p>Posts</p>
		{/await}
		{#each posts as post}
			<li>
				<Post title={post.title} content={post.content} />
			</li>
		{/each}
	</ul>
{/await}
