<script lang="ts">
	import { DarkMode, NavBrand, NavHamburger, NavLi, NavUl, Navbar } from 'flowbite-svelte';
	import '../app.css';
	import { base } from '$app/paths';
</script>

<header class="sticky top-0 z-20">
	<Navbar
		fluid={true}
		class="flex flex-wrap justify-between items-center mx-auto top-0 start-0 bg-gray-200 dark:bg-gray-800"
	>
		<NavBrand href="{base}/">
			<img src="favicon.png" class="me-3 h-6 sm:h-9" alt="Logo" />
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
				>My soul left</span
			>
		</NavBrand>
		<NavHamburger />
		<NavUl>
			<NavLi href="{base}/">Home</NavLi>
			<NavLi href="{base}/communities">Communities</NavLi>
			<NavLi>
				<DarkMode btnClass="" />
			</NavLi>
		</NavUl>
	</Navbar>
</header>

<div class="px-4 py-4 flex flex-col items-center">
	<main class="lg:w-2/5 w-2/3">
		<slot />
	</main>
</div>
