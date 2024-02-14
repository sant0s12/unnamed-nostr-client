<script lang="ts">
	import { getAllCommunities, type Community } from '$lib/nostr';
	import { Relay } from 'nostr-tools';
	let communities: Community[] = [];

	Relay.connect('wss://nos.lol').then(async (relay) => {
		getAllCommunities(relay, (community) => {
			communities = [...communities, community];
		});
	});
</script>

{#each communities as community}
	<p>{community.id}</p>
{/each}
