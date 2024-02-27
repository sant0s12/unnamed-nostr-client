<script lang="ts">
	import { Avatar } from 'flowbite-svelte';
	import { twMerge } from 'tailwind-merge';

	export let src: string | undefined = undefined;
	export let fallback: string | undefined = undefined;
	export let alt: string | undefined = fallback;
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none' = 'md';

	function getFallbackInitials() {
		if (fallback?.includes(' ')) {
			let words = fallback.split(' ');
			return words[0][0].toUpperCase() + words[1][0].toUpperCase();
		} else {
			return fallback?.slice(0, 2).toUpperCase();
		}
	}

	const sizes = {
		xs: 'size-6',
		sm: 'size-8',
		md: 'size-10',
		lg: 'size-20',
		xl: 'size-36',
		none: ''
	};

	const textSizes = {
		xs: 'text-xs',
		sm: 'text-sm',
		md: 'text-md',
		lg: 'text-4xl',
		xl: 'text-[4.5rem]',
		none: ''
	};

	let error = false;
</script>

<div
	class={twMerge(
		`flex overflow-clip rounded-full aspect-square items-center justify-center
		${sizes[size]}`,
		$$props.class
	)}
>
	{#if error || !src}
		{#if fallback}
			<Avatar {size} {alt} class={`${textSizes[size]}`}>
				{getFallbackInitials()}
			</Avatar>
		{:else}
			<Avatar {size} {alt} />
		{/if}
	{:else}
		<img on:error={() => (error = true)} class="object-cover h-full w-full" {src} {alt} />
	{/if}
</div>
