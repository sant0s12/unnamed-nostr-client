<script lang="ts">
	import { page } from '$app/stores';
	import {
		parseCommunityDefinition,
		getCommunityTopLevelPosts,
		type Post,
		ndk,
		type Community
	} from '$lib/nostr';
	import PostCard from '$lib/components/PostCard.svelte';
	import { Heading, Spinner } from 'flowbite-svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import { readable, type Readable } from 'svelte/store';

	let communityStore = $ndk.storeSubscribe({ ids: [$page.params.community] }, { closeOnEose: true });

	let community: Community;
	$: {
		if ($communityStore.length !== 0) {
			community = parseCommunityDefinition($communityStore[0]);
		}
	}

	let topLevelPosts: Readable<Post[]> = readable([]);
	$: {
		if (community !== undefined) {
			topLevelPosts = getCommunityTopLevelPosts(community);
		}
	}
</script>

{#if community === undefined}
	<Spinner class="w-full mt-5" />
{:else}
	<div class="p-5 w-full rounded-md h-30 flex flex-row space-x-3 items-center dark:text-white">
		<div>
			<Avatar src={community.image} />
		</div>
		<div class="flex flex-col h-full w-full">
			<Heading tag="h3">{community.name}</Heading>
		</div>
	</div>

	<ul class="flex flex-col space-y-3 items-stretch">
		{#each $topLevelPosts as post}
			<li>
				<PostCard {post} />
			</li>
		{/each}
	</ul>
{/if}
