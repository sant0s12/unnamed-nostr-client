<script lang="ts">
	import { CommunityPost } from '$lib/nostr';
	import { Card, Heading } from 'flowbite-svelte';
	import PostInteraction from '$lib/components/PostInteraction.svelte';
	import { base } from '$app/paths';
	import PostHeader from './PostHeader.svelte';

	export let post: CommunityPost;
	export let showCommunity: boolean = false;

	let { content, title, id } = post;
</script>

<Card size="xl" class="space-y-2">
	<PostHeader {post} {showCommunity} />
	{#if title}
		<a href="{base}/post/{id}" class="flex flex-row w-auto">
			<Heading tag="h4">{title}</Heading>
		</a>
	{/if}
	<div class="flex flex-row w-auto">
		<p class="break-all hyphens-auto line-clamp-5">{content}</p>
	</div>
	<PostInteraction {post} />
</Card>
