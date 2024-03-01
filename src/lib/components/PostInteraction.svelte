<script lang="ts">
	import { base } from '$app/paths';
	import { loggedInUser } from '$lib/auth';
	import { getPostReactions, type Post } from '$lib/nostr';
	import { relayPool, writeRelays } from '$lib/relays';
	import { Button, ButtonGroup } from 'flowbite-svelte';
	import { ChevronDownOutline, ChevronUpOutline, MessageDotsSolid } from 'flowbite-svelte-icons';
	import { kinds, type UnsignedEvent } from 'nostr-tools';
	import { onMount } from 'svelte';

	export let post: Post;

	let comments = 0;

	let reactions: Map<string, number> = new Map();
	$: upvotes = reactions.get('+') || 0;
	$: downvotes = reactions.get('-') || 0;
	let userVote = 0;

	onMount(() => {
		getPostReactions(post).then((r) => (reactions = r));
		getUserVote().then((v) => (userVote = v));
	});

	async function getUserVote() {
		if ($loggedInUser) {
			let event = await relayPool.get($writeRelays, {
				authors: [$loggedInUser.pubkey],
				kinds: [kinds.Reaction],
				'#e': [post.id],
				'#p': [post.author.pubkey]
			});

			if (event?.content === '+') {
				return 1;
			} else if (event?.content === '-') {
				return -1;
			} else {
				return 0;
			}
		} else {
			return 0;
		}
	}

	async function vote(vote: number) {
		if (userVote == vote || !$loggedInUser) {
			return;
		}

		let reactionEvent: UnsignedEvent = {
			kind: kinds.Reaction,
			pubkey: $loggedInUser.pubkey,
			created_at: Math.round(new Date().getTime() / 1000),
			content: vote == 1 ? '+' : '-',
			tags: [
				['e', post.id],
				['p', post.author.pubkey]
			]
		};

		let signedEvent = await window.nostr.signEvent(reactionEvent);
		if (signedEvent) {
			await Promise.any(relayPool.publish($writeRelays, signedEvent));
		} else {
			console.error('Failed to sign event');
		}

		userVote = await getUserVote();
		if (vote == 1) {
			reactions = reactions.set('+', (reactions.get('+') || 0) + 1);
		} else {
			reactions = reactions.set('-', (reactions.get('-') || 0) + 1);
		}
	}
</script>

<div class="flex flex-row w-full pt-2 space-x-2 items-stretch h-10">
	<ButtonGroup>
		<Button size="xs" on:click={() => vote(1)} color={userVote == 1 ? 'primary' : undefined}>
			<ChevronUpOutline />
			{upvotes}
		</Button>
		<Button size="xs" on:click={() => vote(-1)} color={userVote == -1 ? 'primary' : undefined}>
			<ChevronDownOutline />
			{downvotes}
		</Button>
	</ButtonGroup>
	<Button href="{base}/post/{post.id}" color="alternative" size="xs">
		<MessageDotsSolid class="me-1" />
		{comments}
	</Button>
	<div class="ml-auto"></div>
</div>
