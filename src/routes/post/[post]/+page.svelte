<script lang="ts">
	import { page } from '$app/stores';
	import PostInteraction from '$lib/components/PostInteraction.svelte';
	import { relayPool, relays } from '$lib/relays';
	import { get } from 'svelte/store';
	import { type Post, parsePost } from '$lib/nostr';
	import { Heading, Skeleton } from 'flowbite-svelte';
	import PostHeader from '$lib/components/PostHeader.svelte';

	async function findEvent(): Promise<Post | undefined> {
		let eventId = $page.params.post;

		let event = await relayPool.get(get(relays), { ids: [eventId] });
		if (!event) {
			throw new Error('Event not found');
		}

		return parsePost(event);
	}
</script>

<div class="pt-5">
	{#await findEvent()}
		<Skeleton size="xxl" />
	{:then post}
		{#if post}
			<div class="flex flex-col space-y-2">
				<PostHeader {post} showCommunity />
				{#if post.title}
					<Heading tag="h3" class="dark:text-white">{post.title}</Heading>
				{/if}
				<p class="dark:text-white">{post.content}</p>
				<PostInteraction {post} />
			</div>
		{/if}
	{:catch error}
		<p>{error}</p>
	{/await}
</div>
