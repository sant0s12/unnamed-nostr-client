<script lang="ts">
	import SidebarCommunity from '$lib/components/SidebarCommunity.svelte';
	import { getAllCommunities } from '$lib/nostr';
	import { AppBar, AppShell } from '@skeletonlabs/skeleton';
	import { Relay } from 'nostr-tools';
</script>

<AppShell>
	<svelte:fragment slot="header">
		<AppBar>Very cool nostr client</AppBar>
	</svelte:fragment>
</AppShell>
