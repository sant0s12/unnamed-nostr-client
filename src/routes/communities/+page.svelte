<script lang="ts">
	import CommunityCard from '$lib/components/CommunityCard.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { type Community, getTopCommunities, getCommunity, getNewCommunities } from '$lib/nostr';
	import { onMount } from 'svelte';

	enum SortOptions {
		Top = 'Top',
		New = 'New'
	}

	let sortOptions = [SortOptions.Top, SortOptions.New];
	let sortBy: SortOptions = SortOptions.Top;

	let communities: Community[] = [];
	let loading = false;

	async function getCommunities() {
		console.log('getting communities');

		loading = true;
		communities = [];

		if (sortBy === SortOptions.Top) {
			let date = new Date(0);
			let topCommunities = await getTopCommunities(date);

			topCommunities.forEach(async (community) => {
				let author = community[0].split(':')[1];
				let name = community[0].split(':')[2];

				let cDef = await getCommunity(author, name);
				if (cDef) {
					cDef.subscribers = community[1];
					communities = [...communities, cDef];
				}
			});
		} else {
			communities = await getNewCommunities(100);
		}

		loading = false;
	}

	onMount(getCommunities);
</script>

<div class="flex flex-col space-y-4">
	<div>
		<h2 class="h2">Communities</h2>
		<div class="flex flex-col w-20">
			<p class="p">Sort by</p>
			<select
				class="btn btn-sm variant-filled w-min"
				bind:value={sortBy}
				disabled={loading}
				on:change={getCommunities}
			>
				{#each sortOptions as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</div>
	</div>
	<ul class="list">
		{#each communities as community (community.id)}
			<li>
				<CommunityCard bind:community />
			</li>
		{/each}
	</ul>
	{#if loading}
		<Spinner />
	{/if}
</div>
