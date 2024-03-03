<script lang="ts">
	import { base } from '$app/paths';
	import { getPostReactions, CommunityPost } from '$lib/nostr';
	import ndk from '$lib/stores/ndk';
	import { Button, ButtonGroup, Spinner } from 'flowbite-svelte';
	import { ChevronDownOutline, ChevronUpOutline, MessageDotsSolid } from 'flowbite-svelte-icons';
	import { kinds } from 'nostr-tools';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-french-toast';

	export let post: CommunityPost;

	let comments = 0;

	let reactions: Map<string, number> = new Map();
	$: upvotes = reactions.get('+') || 0;
	$: downvotes = reactions.get('-') || 0;

	let userVote = 0;
	let clickedVote = 0;

	onMount(() => {
		getPostReactions(post).then((r) => (reactions = r));
	});

	$: if ($ndk) getUserVote().then((v) => (userVote = v));

	async function getUserVote() {
		if ($ndk.activeUser) {
			let events = await $ndk
				.fetchEvents({
					authors: [$ndk.activeUser.pubkey],
					kinds: [kinds.Reaction],
					'#e': [post.id],
					'#p': [post.author.pubkey]
				})
				.then((events) =>
					Array.from(events)
						.filter((event) => event.content === '+' || event.content === '-')
						.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
				);

			let lastVote = events.at(0)?.content;

			if (lastVote === '+') {
				return 1;
			} else if (lastVote === '-') {
				return -1;
			} else {
				return 0;
			}
		} else {
			return 0;
		}
	}

	async function vote(vote: number) {
		if (!$ndk.activeUser) {
			toast.error('You need to be logged in to vote');
			return;
		}

		clickedVote = vote;

		if (userVote == vote) {
			vote = 0;
		}

		// Remove existing vote
		let events = await $ndk
			.fetchEvents({
				authors: [$ndk.activeUser.pubkey],
				kinds: [kinds.Reaction],
				'#e': [post.id],
				'#p': [post.author.pubkey]
			})
			.then((events) =>
				Array.from(events).filter((event) => event.content === '+' || event.content === '-')
			);

		for (const event of events) {
			await event.delete('Removing vote', true);
		}

		if (vote != 0) {
			await post.react(vote == 1 ? '+' : '-', true);
		}

		reactions = await getPostReactions(post);
		userVote = await getUserVote();

		clickedVote = 0;
	}
</script>

<div class="flex flex-row w-full pt-2 space-x-2 items-stretch h-10">
	<ButtonGroup>
		<Button
			disabled={clickedVote != 0}
			size="xs"
			on:click={() => vote(1)}
			color={userVote == 1 ? 'primary' : undefined}
		>
			{#if clickedVote == 1}
				<Spinner size="4" />
			{:else}
				<ChevronUpOutline />
				{upvotes}
			{/if}
		</Button>
		<Button
			disabled={clickedVote != 0}
			size="xs"
			on:click={() => vote(-1)}
			color={userVote == -1 ? 'primary' : undefined}
		>
			{#if clickedVote == -1}
				<Spinner size="4" />
			{:else}
				<ChevronDownOutline />
				{downvotes}
			{/if}
		</Button>
	</ButtonGroup>
	<Button href="{base}/post/{post.id}" color="alternative" size="xs">
		<MessageDotsSolid class="me-1" />
		{comments}
	</Button>
	<div class="ml-auto"></div>
</div>
