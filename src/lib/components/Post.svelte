<script lang="ts">
	import { Card, Heading } from "flowbite-svelte";

	export let title: string = 'None';
	export let content: string = 'None';
</script>

<Card size="lg" class="space-y-2">
	<div class="flex flex-row w-auto">
		<Heading tag="h4">{title}</Heading>
	</div>
	<div class="flex flex-row w-auto">
		<p class="break-all hyphens-auto">{content}</p>
	</div>
	<div class="flex flex-row w-auto">
		<p>Bottom bar</p>
	</div>
</Card>
