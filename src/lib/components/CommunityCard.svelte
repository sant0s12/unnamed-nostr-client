<script lang="ts">
	import { type Community } from '$lib/nostr';
	import { Avatar } from '@skeletonlabs/skeleton';

	export let community: Community;
</script>

<div class="card flex w-full p-2 space-x-2 items-start">
	<div>
		<Avatar width="w-10" class="items-stretch" src={community.image} placeholder={community.name} />
	</div>
	<div class="justify-center w-full">
		<a href={`/c/${community.id}`} class="h3">{community.name}</a>
		{#if community.subscribers !== undefined}
			<p>{community.subscribers} subscribers</p>
		{/if}
		{#if community.description}
			<p class="italic">{community.description}</p>
		{/if}
	</div>
</div>
