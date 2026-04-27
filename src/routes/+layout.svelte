<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { session } from '$lib/stores/session';
	import { validateSessionFromStorage } from '$lib/utils/sessionUtils';
	import '../app.css';

	export let data;

	$: if (data?.sessionData) {
		session.login(data.sessionData.userId, data.sessionData.username);
	}

	onMount(() => {
		// Hydrate session from localStorage
		session.hydrate();

		// Check if route requires authentication
		const currentRoute = $page.route.id;
		const isPublicRoute = currentRoute?.match(/^\/(login|register|auth|api|\+page|$)/);
		const isProtectedRoute = !isPublicRoute;

		// Validate session
		const storedSession = validateSessionFromStorage();
		const isAuthenticated = storedSession !== null;

		// Redirect to login if accessing protected route without auth
		if (isProtectedRoute && !isAuthenticated) {
			goto('/');
		}
	});
</script>

<div class="app-container">
	<nav class="navbar" role="navigation" aria-label="Main navigation">
		<div class="navbar-content">
			<a href="/" class="navbar-brand">FastMem</a>

			<div class="navbar-menu">
				{#if $session.isAuthenticated}
					<span class="navbar-user" aria-label={`Logged in as ${$session.username}`}>
						{$session.username}
					</span>
					<a href="/logout" class="navbar-link">Logout</a>
				{:else}
					<a href="/login" class="navbar-link">Login</a>
					<a href="/register" class="navbar-link">Register</a>
				{/if}
			</div>
		</div>
	</nav>

	<main class="main-content" role="main">
		<slot />
	</main>

	<footer class="footer" role="contentinfo">
		<p>&copy; 2026 FastMem. All rights reserved.</p>
	</footer>
</div>

<style>
	:global(html, body) {
		height: 100%;
	}

	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
			Arial, sans-serif;
		background-color: #f9fafb;
		color: #1f2937;
	}

	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.navbar {
		background-color: #ffffff;
		border-bottom: 1px solid #e5e7eb;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.navbar-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 64px;
	}

	.navbar-brand {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2937;
		text-decoration: none;
		transition: color 0.2s;
	}

	.navbar-brand:hover {
		color: #3b82f6;
	}

	.navbar-menu {
		display: flex;
		gap: 1.5rem;
		align-items: center;
	}

	.navbar-link {
		color: #4b5563;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}

	.navbar-link:hover {
		color: #3b82f6;
	}

	.navbar-link:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
		border-radius: 4px;
	}

	.navbar-user {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.main-content {
		flex: 1;
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
		padding: 2rem 1rem;
	}

	.footer {
		background-color: #f3f4f6;
		border-top: 1px solid #e5e7eb;
		padding: 2rem 1rem;
		text-align: center;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.footer p {
		margin: 0;
	}
</style>
