<script lang="ts">
	import { getPostReactions, type Post } from '$lib/nostr';
	import { Button, ButtonGroup } from 'flowbite-svelte';
	import { ChevronDownOutline, ChevronUpOutline, MessageDotsSolid } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	export let post: Post;

	let comments = 0;
	let upvotes = 0;
	let downvotes = 0;

	onMount(async () => {
		let reactions = await getPostReactions(post);
		console.log(reactions);
		upvotes = reactions.get('+') || 0;
		downvotes = reactions.get('-') || 0;
	});
</script>

<div class="flex flex-row w-full pt-2 space-x-2 items-stretch h-10">
	<ButtonGroup>
		<Button size="xs" on:click={() => alert('button')}>
			<ChevronUpOutline />
			{upvotes}
		</Button>
		<Button size="xs">
			<ChevronDownOutline />
			{downvotes}
		</Button>
	</ButtonGroup>
	<Button color="alternative" size="xs">
		<MessageDotsSolid class="me-1" />
		{comments}
	</Button>
	<div class="ml-auto"></div>
</div>
