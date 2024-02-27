<script lang="ts">
	import { getUserMetadata, type Post } from '$lib/nostr';
	import { Card, Heading } from 'flowbite-svelte';
	import { npubEncode } from 'nostr-tools/nip19';
	import { onMount } from 'svelte';
	import { BadgeCheckSolid } from 'flowbite-svelte-icons';
	import Avatar from '$lib/components/Avatar.svelte';
	import PostInteraction from '$lib/components/PostInteraction.svelte';
	import { base } from '$app/paths';

	export let post: Post;
	export let showCommunity: boolean = false;

	let { title, author, content, id, community } = post;

	let npub = npubEncode(author.pubkey);
	let shortNpub = npub.slice(0, 8) + '...' + npub.slice(-8);

	onMount(async () => {
		author = await getUserMetadata(author);
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
					<p>{shortNpub}</p>
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
