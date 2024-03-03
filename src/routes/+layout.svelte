<script lang="ts">
	import {
		Button,
		Dropdown,
		DropdownDivider,
		DropdownHeader,
		DropdownItem,
		NavBrand,
		NavHamburger,
		NavLi,
		NavUl,
		Navbar,
		Select
	} from 'flowbite-svelte';
	import '../app.css';
	import { base } from '$app/paths';
	import Avatar from '$lib/components/Avatar.svelte';
	import ndk from '$lib/stores/ndk';
	import { Toaster } from 'svelte-french-toast';
	import theme from '$lib/stores/theme';
	import { signInOut } from '$lib/auth';
	import { npubShort } from '$lib/nostr';

	import favicon from '$lib/assets/favicon.png';
</script>

<header class="sticky top-0 z-20">
	<Navbar fluid={true} class="bg-gray-200 dark:bg-gray-800 py-2">
		<NavBrand href="{base}/">
			<img src={favicon} class="me-3 h-6 sm:h-9" alt="Logo" />
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
				>My soul left</span
			>
		</NavBrand>
		<div class="flex items-center md:order-2">
			<Button id="avatar_button" pill class="p-0 md:p-1 my-0 space-x-1" color="light" size="xs">
				<Avatar size="md" src={$ndk.activeUser?.profile?.image} />
				{#if $ndk.activeUser?.profile?.name}
					<p class="hidden md:block px-1">{$ndk.activeUser?.profile?.name}</p>
				{/if}
			</Button>
			<NavHamburger class1="w-full md:flex md:w-auto md:order-1" />
		</div>
		<NavUl>
			<NavLi href="{base}/">Home</NavLi>
			<NavLi href="{base}/communities">Communities</NavLi>
		</NavUl>
		<Dropdown triggeredBy="#avatar_button" class="w-56">
			{#if $ndk.activeUser}
				<DropdownHeader>
					<span class="block text-sm">{$ndk.activeUser?.profile?.name ??
						npubShort($ndk.activeUser.npub)}</span>
					{#if $ndk.activeUser?.profile?.nip05}
						<span class="block truncate text-sm font-medium">
							{$ndk.activeUser?.profile?.nip05}
						</span>
					{/if}
				</DropdownHeader>
			{/if}
			<DropdownItem>Settings</DropdownItem>
			<DropdownDivider />
			<DropdownItem class="py-1 h-min">
				<div class="flex flex-row items-center">
					<p>Theme</p>
					<Select class="ml-auto w-24 h-min py-1" bind:value={$theme} placeholder="">
						<option value="light">Light</option>
						<option value="dark">Dark</option>
						<option value="system">System</option>
					</Select>
				</div>
			</DropdownItem>
			<DropdownDivider />
			<DropdownItem on:click={signInOut}>{$ndk.activeUser ? 'Sign out' : 'Sign in'}</DropdownItem>
		</Dropdown>
	</Navbar>
</header>

<Toaster position="bottom-right" />
<div class="px-4 py-4 flex flex-col items-center">
	<main class="lg:w-2/5 md:w-2/3 w-full">
		<slot />
	</main>
</div>
