<script lang="ts">
	import { getUserMetadata, npubEncodeShort, type Post, type User } from '$lib/nostr';
	import { Card, Heading } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { ArrowsRepeatOutline, BadgeCheckSolid } from 'flowbite-svelte-icons';
	import Avatar from '$lib/components/Avatar.svelte';
	import PostInteraction from '$lib/components/PostInteraction.svelte';
	import { base } from '$app/paths';

	export let post: Post;
	export let showCommunity: boolean = false;

	let { author, repost, community } = post;
	let repostAuthor: User | undefined;

	if (repost) {
		repostAuthor = author;
		author = repost.author;
		post = repost;
	}

	let { title, content } = post;

	onMount(async () => {
		author = await getUserMetadata(author);
		if (repostAuthor) {
			repostAuthor = await getUserMetadata(repostAuthor);
		}
	});
</script>

<Card size="xl" class="space-y-2">
	<div class="flex flex-row w-auto space-x-2 items-center">
		<a href={showCommunity ? `${base}/c/${community?.id}` : `${base}/p/${author.pubkey}`}>
			<Avatar
				src={showCommunity ? community?.image : author.picture}
				fallback={author.name}
				size={showCommunity ? 'sm' : 'xs'}
			/>
		</a>
		<div class="flex flex-col text-xs justify-center items-start">
			{#if showCommunity && community?.name}
				<a href="{base}/c/{community.id}" class="font-bold hover:underline">{community.name}</a>
			{/if}
			<a href="{base}/p/{author.pubkey}" class="inline-flex space-x-1 items-center hover:underline">
				{#if author.name}
					<p>{author.name}</p>
				{:else}
					<p>{npubEncodeShort(author.pubkey)}</p>
				{/if}
				{#if author.verified}
					<BadgeCheckSolid size="xs" />
					<div>
						{author.nip05}
					</div>
				{/if}
			</a>
		</div>
	</div>
	{#if repostAuthor}
		<div class="flex flex-row overflow-hidden space-x-2 items-center">
			<ArrowsRepeatOutline size="xs" />
			<div class="flex flex-col text-xs justify-center items-start">
				<a
					href="{base}/p/{author.pubkey}"
					class="inline-flex space-x-1 items-center hover:underline"
				>
					{#if repostAuthor.name}
						<p>{repostAuthor.name}</p>
					{:else}
						<p>{npubEncodeShort(repostAuthor.pubkey)}</p>
					{/if}
					{#if repostAuthor.verified}
						<BadgeCheckSolid size="xs" />
						<div>
							{repostAuthor.nip05}
						</div>
					{/if}
				</a>
			</div>
		</div>
	{/if}
	{#if title}
		<div class="flex flex-row w-auto">
			<Heading tag="h4">{title}</Heading>
		</div>
	{/if}
	<div class="flex flex-row w-auto">
		<p class="break-all hyphens-auto line-clamp-5">{content}</p>
	</div>
	<PostInteraction {post} />
</Card>
