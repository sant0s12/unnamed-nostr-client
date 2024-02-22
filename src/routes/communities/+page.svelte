<script lang="ts">
	import CommunityCard from '$lib/components/CommunityCard.svelte';
	import { type Community, getTopCommunities, getCommunityDefinition } from '$lib/nostr';
	import { onMount } from 'svelte';

	let communities: Community[] = [];

	onMount(async () => {
		let topCommunities = await getTopCommunities(new Date(0));
		topCommunities.slice(0, 100).forEach(async (community) => {
			let author = community[0].split(':')[1];
			let name = community[0].split(':')[2];

			let cDef = await getCommunityDefinition(author, name);
			if (cDef) {
				cDef.subscribers = community[1];
				communities = [...communities, cDef];
			}
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
	{#each communities as community (community.id)}
		<li>
			<CommunityCard bind:community={community} />
		</li>
	{/each}
</ul>
