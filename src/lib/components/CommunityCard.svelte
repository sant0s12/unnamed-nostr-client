<script lang="ts">
	import Avatar from '$lib/components/Avatar.svelte';
	import type { Community } from '$lib/nostr';

	export let community: Community;
</script>

<div class="card flex w-full p-2 space-x-2 items-start">
	<div>
		<Avatar src={community.image} placeholder={community.name} />
	</div>
	<div class="justify-center w-full">
		<a href={`/c/${community.id}`} class="h3">{community.name}</a>
		<p>{community.subscribers} subscribers</p>
		<p class="italic">{community.description}</p>
	</div>
</div>
