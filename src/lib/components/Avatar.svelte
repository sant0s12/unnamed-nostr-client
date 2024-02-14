<script lang="ts">
	export let src: string | null;
	export let placeholder: string;

	let showPlaceholder = src?.length == 0;
</script>

<div
	class="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-surface-500 rounded-full"
>
	{#if showPlaceholder}
		<span class="font-medium">{placeholder.substring(0, 2).toUpperCase()}</span>
	{:else}
		<img
			on:error={() => {
				showPlaceholder = true;
			}}
			{src}
			alt={placeholder}
			class="object-cover w-full h-full"
		/>
	{/if}
</div>
