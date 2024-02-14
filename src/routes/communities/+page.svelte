<script lang="ts">
	import CommunityCard from '$lib/components/CommunityCard.svelte';
	import { getAllCommunities, type Community, getCommunitySubscribers } from '$lib/nostr';
	import { Relay } from 'nostr-tools';
	let communities: Community[] = [];

	Relay.connect('wss://nos.lol').then(async (relay) => {
		getAllCommunities(relay, (community) => {
			communities = [...communities, community].sort((a, b) => {
				if (a.subscribers === undefined && b.subscribers === undefined) return 0;
				else if (a.subscribers === undefined) return 1;
				else if (b.subscribers === undefined) return -1;
				else return b.subscribers - a.subscribers;
			});
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
