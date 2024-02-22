<script lang="ts">
	import CommunityCard from '$lib/components/CommunityCard.svelte';
	import { getAllCommunities, type Community } from '$lib/nostr';
	import { onMount } from 'svelte';

	let communities: Community[] = [];

	onMount(() => {
		getAllCommunities((community) => {
			communities = [...communities, community];
		});
	});

	$: {
		communities = communities.sort((a, b) => {
			if (a.subscribers === undefined && b.subscribers === undefined) return 0;
			else if (a.subscribers === undefined) return 1;
			else if (b.subscribers === undefined) return -1;
			else return b.subscribers - a.subscribers;
		});
	}
</script>

<ul class="list">
	{#each communities as community, i (community.id)}
		<li>
			<CommunityCard bind:community={communities[i]} />
		</li>
	{/each}
</ul>
