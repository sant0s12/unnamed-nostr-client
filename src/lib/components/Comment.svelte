<script lang="ts">
	import { CommunityPost } from '$lib/nostr';
	import { Card, Heading } from 'flowbite-svelte';
	import PostInteraction from '$lib/components/PostInteraction.svelte';
	import { base } from '$app/paths';
	import PostHeader from './PostHeader.svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';

	export let post: NDKEvent;
	export let showCommunity: boolean = false;
</script>

<div class="space-y-1">
	<PostHeader {post} {showCommunity} />
	<div class="flex flex-row w-auto">
		<p class="break-all hyphens-auto line-clamp-5">{post.content}</p>
	</div>
	<PostInteraction {post} hideCommentsButton showReplyButton />
</div>
