<script lang="ts">
	import { AppBar, AppShell, Avatar, LightSwitch } from '@skeletonlabs/skeleton';
	import '../app.css';
</script>

<AppShell
	slotSidebarLeft="bg-surface-500/5 w-0 lg:w-64"
	slotPageContent="place-self-center w-4/5 my-10"
>
	<svelte:fragment slot="header">
		<AppBar gridColumns="grid-cols-3" slotTrail="place-content-end">
			<svelte:fragment slot="lead">
				<h1>My soul left</h1>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<LightSwitch />
				<Avatar class="w-8" />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<p>Sidebar Working!</p>
	</svelte:fragment>
	<slot />
</AppShell>
