<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	export let image: string;
	export let name: string;
</script>

<div class="card m-5">
	{#if image}
		<Avatar src={image} />
	{/if}
	<h2>{name}</h2>
</div>
