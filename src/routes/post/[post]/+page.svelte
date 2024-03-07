<script lang="ts">
	import { page } from '$app/stores';
	import PostInteraction from '$lib/components/PostInteraction.svelte';
	import { CommunityPost } from '$lib/nostr';
	import ndk from '$lib/stores/ndk';
	import { Heading, Skeleton } from 'flowbite-svelte';
	import PostHeader from '$lib/components/PostHeader.svelte';
	import ReplyThread from '$lib/components/ReplyThread.svelte';

	async function findEvent(): Promise<CommunityPost | undefined> {
		let eventId = $page.params.post;

		let event = await $ndk.fetchEvent({ ids: [eventId] });
		if (!event) {
			throw new Error('Event not found');
		}

		event.tagAddress;

		return CommunityPost.from(event);
	}
</script>

<div class="flex flex-col pt-5 space-y-2 border-separate">
	{#await findEvent()}
		<Skeleton size="xxl" />
	{:then post}
		{#if post}
			<div class="flex flex-col space-y-2">
				<PostHeader {post} showCommunity />
				{#if post?.title}
					<Heading tag="h3" class="dark:text-white">{post.title}</Heading>
				{/if}
				<p class="dark:text-white break-words">{post.content}</p>
				<PostInteraction {post} />
				<div class="pt-2">
					<ReplyThread isRoot event={post} rootId={post.id} />
				</div>
			</div>
		{/if}
	{:catch error}
		<p>{error}</p>
	{/await}
</div>
