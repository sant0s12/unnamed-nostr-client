<script lang="ts">
	export let title: string = 'None';
	export let content: string = 'None';
</script>

<div class="flex flex-col">
	<div class="flex flex-row">
		<p>{title}</p>
	</div>
	<div class="flex flex-row">
		<p>{content}</p>
	</div>
	<div class="flex flex-row">
		<p>Bottom bar</p>
	</div>
</div>
