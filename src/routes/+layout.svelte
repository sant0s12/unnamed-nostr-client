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
		Select,
		Sidebar,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper
	} from 'flowbite-svelte';
	import '../app.css';
	import { base } from '$app/paths';
	import Avatar from '$lib/components/Avatar.svelte';
	import ndk from '$lib/stores/ndk';
	import { Toaster } from 'svelte-french-toast';
	import theme from '$lib/stores/theme';
	import { signInOut } from '$lib/auth';
	import { npubShort } from '$lib/nostr';
	import { page } from '$app/stores';

	import favicon from '$lib/assets/favicon.png';
	import { HomeSolid, UsersGroupSolid } from 'flowbite-svelte-icons';
	import { fade, fly } from 'svelte/transition';

	let dropdownOpen = false;

	let sidebarOpen = false;
	const sideBarClose = () => {
		sidebarOpen = false;
	};
</script>

<svelte:window on:scroll={sideBarClose} />

<Toaster position="bottom-right" />

<div class="min-h-svh">
	<header class="sticky top-0 w-full z-20">
		<Navbar fluid={true} class="bg-gray-200 dark:bg-gray-800 py-0 flex justify-between h-16">
			<div class="flex">
				<NavHamburger class="block sm:hidden ms-0" onClick={() => (sidebarOpen = !sidebarOpen)} />
				<NavBrand href="{base}/">
					<img src={favicon} class="me-3 h-6 sm:h-9" alt="Logo" />
					<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
						>My soul left</span
					>
				</NavBrand>
			</div>
			<Button id="avatar-button" pill class="p-0 md:p-1 my-0 space-x-1" color="light" size="xs">
				<Avatar size="md" src={$ndk.activeUser?.profile?.image} />
				{#if $ndk.activeUser?.profile?.name}
					<p class="hidden md:block px-1">{$ndk.activeUser?.profile?.name}</p>
				{/if}
			</Button>
			<Dropdown triggeredBy="#avatar-button" class="w-56" bind:open={dropdownOpen}>
				{#if $ndk.activeUser}
					<DropdownHeader>
						<span class="block text-sm"
							>{$ndk.activeUser?.profile?.name ?? npubShort($ndk.activeUser.npub)}</span
						>
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

	<div class="grid grid-cols-[1fr_min-content_minmax(0,640px)_min-content_1fr]">
		{#key sidebarOpen}
			<div
				class="fixed h-screen top-0 left-0
						{sidebarOpen ? '' : 'hidden'} w-screen bg-gray-900/80"
				in:fade
				out:fade
			/>
			<div
				class="h-[calc(100vh-theme(space.16))] max-w-full sm:sticky fixed top-16
				   overflow-y-auto ml-auto col-start-2 sm:block {sidebarOpen ? '' : 'hidden'}"
				in:fly={{ opacity: 100, x: -500 }}
				out:fly={{ opacity: 100, x: -500 }}
			>
				<Sidebar asideClass="pt-5" activeUrl={$page.url.pathname}>
					<SidebarWrapper>
						<SidebarGroup>
							<SidebarItem href="{base}/" label="Home" on:click={sideBarClose}>
								<HomeSolid slot="icon" />
							</SidebarItem>
							<SidebarItem href="{base}/communities" label="Communities" on:click={sideBarClose}>
								<UsersGroupSolid slot="icon" />
							</SidebarItem>
						</SidebarGroup>
					</SidebarWrapper>
				</Sidebar>
			</div>
		{/key}
		<main class="w-full p-5 col-start-3 justify-stretch">
			<slot />
		</main>
		<div class="col-start-4 hidden sm:block"></div>
	</div>
</div>
