<script lang="ts">
	import { base } from '$app/paths';
	import { loggedInUser } from '$lib/auth';
	import { getPostReactions, type Post } from '$lib/nostr';
	import { relayPool, writeRelays } from '$lib/relays';
	import { Button, ButtonGroup } from 'flowbite-svelte';
	import { ChevronDownOutline, ChevronUpOutline, MessageDotsSolid } from 'flowbite-svelte-icons';
	import { kinds, type NostrEvent, type UnsignedEvent } from 'nostr-tools';
	import type { ReactionEventTemplate } from 'nostr-tools/nip25';
	import { onMount } from 'svelte';

	export let post: Post;

	let comments = 0;
	let upvotes = 0;
	let downvotes = 0;
	let userVote = 0;

	onMount(async () => {
		let reactions = await getPostReactions(post);
		upvotes = reactions.get('+') || 0;
		downvotes = reactions.get('-') || 0;

		userVote = await getUserVote();
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
			tags: [['e', post.id], ['p', post.author.pubkey]],
		};

		console.log(reactionEvent.created_at);

		let signedEvent = await window.nostr.signEvent(reactionEvent);
		if (signedEvent) {
			await Promise.all(relayPool.publish($writeRelays, signedEvent));
		} else {
			console.error('Failed to sign event');
		}

		await getUserVote();
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
