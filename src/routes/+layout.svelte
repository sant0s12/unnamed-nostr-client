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
	import { fly } from 'svelte/transition';

	let dropdownOpen = false;
</script>

<Toaster position="bottom-right" />

<div class="min-h-svh">
	<header class="sticky top-0 w-full z-20">
		<Navbar fluid={true} class="bg-gray-200 dark:bg-gray-800 py-0 flex justify-between h-16">
			<NavBrand href="{base}/">
				<img src={favicon} class="me-3 h-6 sm:h-9" alt="Logo" />
				<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
					>My soul left</span
				>
			</NavBrand>
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

	<div class="grid grid-cols-[1fr_auto_1fr]">
		<div
			class="max-h-[calc(100vh-theme(space.16))] max-w-full sticky top-16
				   overflow-y-auto ml-auto"
		>
			<Sidebar asideClass="hidden lg:block" activeUrl={$page.url.pathname}>
				<SidebarWrapper>
					<SidebarGroup>
						<SidebarItem href="{base}/" label="Home">
							<HomeSolid slot="icon" />
						</SidebarItem>
						<SidebarItem href="{base}/communities" label="Communities">
							<UsersGroupSolid slot="icon" />
						</SidebarItem>
					</SidebarGroup>
				</SidebarWrapper>
			</Sidebar>
		</div>
		<main class="max-w-screen-sm p-5">
			<slot />
		</main>
		<div class="mr-auto"></div>
	</div>
</div>
