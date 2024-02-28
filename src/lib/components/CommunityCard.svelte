<script lang="ts">
	import { type Community } from '$lib/nostr';
	import Avatar from '$lib/components/Avatar.svelte';
	import { base } from '$app/paths';

	export let community: Community;
</script>

<div class="flex w-full p-2 space-x-2 items-start">
	<div>
		<Avatar size="sm" src={community.image} fallback={community.name} />
	</div>
	<div class="justify-center w-full">
		<a href={`${base}/c/${community.id}`} class="h3 dark:text-white">{community.name}</a>
		{#if community.subscribers !== undefined}
			<p>{community.subscribers} subscribers</p>
		{/if}
		{#if community.description}
			<p class="italic dark:text-white">{community.description}</p>
		{/if}
	</div>
</div>
