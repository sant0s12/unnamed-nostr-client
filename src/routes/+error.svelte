<script>
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { Button, Heading } from 'flowbite-svelte';
</script>

<div class="w-full h-full flex flex-col items-center p-20 space-y-10">
	<Heading tag="h1" class="w-auto">{$page.status} {$page.error?.message}</Heading>
	<Heading tag="h1" class="w-auto">Oof</Heading>
	<Button href="{base}/">Take me home</Button>
</div>
