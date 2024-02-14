<script lang="ts">
	import CommunityCard from '$lib/components/CommunityCard.svelte';
	import { getAllCommunities, type Community } from '$lib/nostr';
	let communities: Community[] = [];

	getAllCommunities((community) => {
		communities = [...communities, community].sort((a, b) => {
			if (a.subscribers === undefined && b.subscribers === undefined) return 0;
			else if (a.subscribers === undefined) return 1;
			else if (b.subscribers === undefined) return -1;
			else return b.subscribers - a.subscribers;
		});
	});
</script>

<ul class="list">
	{#each communities as community (community.id)}
		<li>
			<CommunityCard {community} />
		</li>
	{/each}
</ul>
