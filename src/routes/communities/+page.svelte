<script lang="ts">
	import CommunityCard from '$lib/components/CommunityCard.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import InfiniteLoading, { type InfiniteEvent } from 'svelte-infinite-loading';
	import { type Community, getTopCommunities, getCommunity, getNewCommunities } from '$lib/nostr';
	import pLimit from 'p-limit';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	enum SortOptions {
		Top = 'Top',
		New = 'New'
	}

	let sortOptions = [SortOptions.Top, SortOptions.New];
	let sortBy: SortOptions = SortOptions.Top;

	let communities: (Community | Promise<Community | null>)[] = [];
	let shownCommunities: Community[] = [];
	let loading = false;

	async function getCommunities() {
		console.log('getting communities');

		loading = true;
		communities = [];
		shownCommunities = [];

		if (sortBy === SortOptions.Top) {
			let date = new Date(0);
			let topCommunities = await getTopCommunities(date);

			let limit = pLimit(5);

			topCommunities.map((community) => {
				let author = community[0].split(':')[1];
				let name = community[0].split(':')[2];

				communities = [...communities, limit(() => getCommunity(author, name))];
			});
		} else {
			communities = await getNewCommunities(100);
		}

		loading = false;
	}

	async function loadMore({ detail: { loaded, complete } }: InfiniteEvent) {
		if (communities.length > 0) {
			let newCommunity = await communities[0];
			communities.shift();

			if (newCommunity) {
				shownCommunities = [...shownCommunities, newCommunity];
			}

			loaded();
		} else {
			complete();
		}
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
		{#each shownCommunities as community}
			<li>
				<CommunityCard {community} />
			</li>
		{/each}
	</ul>
	{#if loading == false}
		<InfiniteLoading on:infinite={loadMore}>
			<Spinner slot="spinner" />
			<div slot="noMore" />
			<div slot="noResults" />
		</InfiniteLoading>
	{:else}
		<Spinner />
	{/if}
</div>
