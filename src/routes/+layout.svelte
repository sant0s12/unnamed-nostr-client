<script lang="ts">
	import { DarkMode, NavBrand, NavHamburger, NavLi, NavUl, Navbar } from 'flowbite-svelte';
	import '../app.css';
</script>

<header class="sticky top-0 z-20">
	<Navbar
		fluid={true}
		class="flex flex-wrap justify-between items-center mx-auto top-0 start-0 bg-gray-200 dark:bg-gray-800"
	>
		<NavBrand href="/">
			<img src="favicon.png" class="me-3 h-6 sm:h-9" alt="Logo" />
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
				>My soul left</span
			>
		</NavBrand>
		<NavHamburger />
		<NavUl>
			<NavLi href="/">Home</NavLi>
			<NavLi href="/communities">Communities</NavLi>
		</NavUl>
		<DarkMode />
	</Navbar>
</header>

<div class="flex items-center px-4 py-4 mx-auto w-full">
	<main class="w-4/5 mx-auto">
		<slot />
	</main>
</div>
