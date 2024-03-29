<script lang="ts">
	import { base } from '$app/paths';
	import Avatar from '$lib/components/Avatar.svelte';
	import { npubShort, CommunityPost } from '$lib/nostr';
	import DOMPurify from 'dompurify';
	import { ArrowsRepeatOutline, BadgeCheckSolid } from 'flowbite-svelte-icons';
	import { formatDistance } from 'date-fns';

	export let post: CommunityPost;
	export let showCommunity: boolean = false;

	let communityLinks: string[] = [];
	let joinedLinks: string = '';

	if (showCommunity) {
		post.getCommunities().then((communities) => {
			for (const community of communities) {
				community.name = DOMPurify.sanitize(community.name, { ALLOWED_TAGS: [] });
				community.id = DOMPurify.sanitize(community.id, { ALLOWED_TAGS: [] });

				communityLinks.push(
					`<a href="${base}/c/${community.id}" class="hover:underline"> <p>${community.name}</p> </a>`
				);

				communityLinks = communityLinks;
			}

			joinedLinks = communityLinks.join('<span class="text-gray-400"> • </span>');
		});
	}

	$: if (post.author.profile === undefined) post.author.fetchProfile().then(() => (post = post));

	let postTime = post.created_at
		? formatDistance(new Date(post.created_at * 1000), new Date(), {
				addSuffix: true
			})
		: 'some time ago';
</script>

<div class="flex flex-row w-auto space-x-2 items-center">
	{#if showCommunity && post.communities && post.communities.length > 0}
		<div class="flex -space-x-4 rtl:space-x-reverse">
			{#await post.getCommunities() then communities}
				{#each communities as community}
					<a href="{base}/c/{community.id}">
						<Avatar
							src={community.image}
							fallback={community.name}
							size={'sm'}
							class={communities.length > 1 ? 'border-[2px] dark:border-gray-800 border-white' : ''}
						/>
					</a>
				{/each}
			{/await}
		</div>
	{:else}
		<a href="{base}/p/{post.author.pubkey}">
			<Avatar src={post.author.profile?.image} fallback={post.author.profile?.name} size={'xs'} />
		</a>
	{/if}
	<div class="flex flex-col text-xs justify-center items-start">
		{#if showCommunity && post.communities && post.communities.length > 0}
			<div class="flex flex-row space-x-1 font-bold">
				{@html joinedLinks}
			</div>
		{/if}
		<div class="flex flex-row space-x-1">
			<a
				href="{base}/p/{post.author.pubkey}"
				class="inline-flex space-x-1 items-center hover:underline"
			>
				{#if post.author.profile?.name}
					<p>{post.author.profile.name}</p>
				{:else}
					<p>{npubShort(post.author.npub)}</p>
				{/if}
				{#if post.author.profile?.nip05}
					{#await post.author.validateNip05(post.author.profile.nip05) then validated}
						{#if validated}
							<BadgeCheckSolid size="xs" />
							<div>
								{post.author.profile.nip05}
							</div>
						{/if}
					{/await}
				{/if}
			</a>
			<p>•</p>
			<p>{postTime}</p>
		</div>
	</div>
</div>
{#if post.repostedByEvents}
	{#each post.repostedByEvents as repostedBy}
		{#await repostedBy.author.fetchProfile() then repostAuthor}
			{#if repostAuthor}
				<div class="flex flex-row overflow-hidden space-x-2 items-center">
					<ArrowsRepeatOutline size="xs" />
					<div class="flex flex-col text-xs justify-center items-start">
						<a
							href="{base}/p/{repostAuthor.pubkey}"
							class="inline-flex space-x-1 items-center hover:underline"
						>
							{#if repostAuthor.name}
								<p>{repostAuthor.name}</p>
							{:else}
								<p>{npubShort(repostedBy.author.npub)}</p>
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
		{/await}
	{/each}
{/if}
