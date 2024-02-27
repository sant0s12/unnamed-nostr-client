<script lang="ts">
	import { relays, relayPool } from '$lib/relays';
	import { page } from '$app/stores';
	import { parseCommunityDefinition, getCommunityTopLevelPosts, type Post } from '$lib/nostr';
	import PostCard from '$lib/components/PostCard.svelte';
	import { get } from 'svelte/store';
	import { Heading, Spinner } from 'flowbite-svelte';
	import Avatar from '$lib/components/Avatar.svelte';

	let communityPromise = relayPool
		.get(get(relays), { ids: [$page.params.community] })
		.then((event) => (event ? parseCommunityDefinition(event) : Promise.reject('Event not found')));

	let posts: Post[] = [];
	let postsPromise = communityPromise.then((community) => {
		getCommunityTopLevelPosts(community, (post: Post) => {
			posts = [...posts, post];
		});
	});
</script>

{#await communityPromise}
	<Spinner />
{:then community}
	<div class="p-5 w-full rounded-md h-30 flex flex-row space-x-3 items-center dark:text-white">
		<div>
			<Avatar src={community.image} />
		</div>
		<div class="flex flex-col h-full w-full">
			<Heading tag="h3">{community.name}</Heading>
		</div>
	</div>

	<ul class="flex flex-col space-y-3 items-stretch">
		{#await postsPromise}
			<Spinner />
		{/await}
		{#each posts as post}
			<li>
				<PostCard {post} />
			</li>
		{/each}
	</ul>
{/await}
