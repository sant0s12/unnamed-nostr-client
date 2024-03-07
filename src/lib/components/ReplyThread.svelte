<script lang="ts">
	import { NDKKind, type NDKEvent, type NDKEventId } from '@nostr-dev-kit/ndk';
	import ndk from '$lib/stores/ndk';

	export let event: NDKEvent;

	export let isRoot = false;
	export let rootId: NDKEventId;

	let replyStore = $ndk.storeSubscribe({ kinds: [NDKKind.Text], '#e': [event.id] });

	let directChildren: Set<NDKEvent> = new Set();
	$: {
		for (const replyEvent of $replyStore) {
			const matchingTags = replyEvent.getMatchingTags('e');
			if (isRoot) {
				if (matchingTags.length === 1 && matchingTags[0][1] === rootId) {
					directChildren.add(replyEvent);
				}
			} else {
				// Legacy
				if (
					(matchingTags.length === 1 && matchingTags[0][1] === event.id) ||
					(matchingTags.length === 2 && matchingTags[1][1] === event.id) ||
					(matchingTags.length > 2 && matchingTags[-1][1] === event.id)
				) {
					directChildren.add(replyEvent);
				}
			}
		}

		directChildren = directChildren;
	}
</script>

<ul class="space-y-4 border-l px-2">
	{#each directChildren as child}
		<li class="ml-2 space-y-2">
			<p class="border">
				{child.content}
			</p>
			<svelte:self event={child} {rootId} />
		</li>
	{/each}
</ul>
