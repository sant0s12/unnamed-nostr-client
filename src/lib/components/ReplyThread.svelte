<script lang="ts">
	import { NDKKind, type NDKEvent, type NDKEventId } from '@nostr-dev-kit/ndk';
	import ndk from '$lib/stores/ndk';
	import { Button } from 'flowbite-svelte';
	import { ChevronDoubleDownOutline, ChevronDoubleDownSolid } from 'flowbite-svelte-icons';

	export let event: NDKEvent;

	export let isRoot = false;
	export let rootId: NDKEventId;
	export let showNested = 0;

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
					(matchingTags.length === 1 && matchingTags.at(0)?.at(1) === event.id) ||
					(matchingTags.length === 2 && matchingTags.at(1)?.at(1) === event.id) ||
					(matchingTags.length > 2 && matchingTags.at(-1)?.at(1) === event.id)
				) {
					directChildren.add(replyEvent);
				}
			}
		}

		directChildren = directChildren;
	}
</script>

{#if directChildren.size === 0 && isRoot}
	<p>No replies yet</p>
{:else if directChildren.size > 0}
	<ul class="space-y-4 border-l-2">
		{#if isRoot || showNested > 0}
			{#each directChildren as child}
				<li class="ml-2 space-y-2">
					<p class="border">
						{child.content}
					</p>
					<svelte:self event={child} {rootId} showNested={showNested - 1} />
				</li>
			{/each}
		{:else}
			<li class="ml-2 space-y-2">
				<Button
					class="py-1 px-1 border-0"
					color="light"
					size="xs"
					on:click={() => (showNested = 5)}
				>
					<ChevronDoubleDownOutline size="sm" />
					<p class="p-0.5">Show replies</p>
				</Button>
			</li>
		{/if}
	</ul>
{/if}
