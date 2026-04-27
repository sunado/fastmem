<script>
	import { page } from '$app/stores';
	import Button from '$lib/components/Button.svelte';
</script>

<svelte:head>
	<title>Error - FastMem</title>
</svelte:head>

<div class="error-container">
	<div class="error-content">
		<h1>⚠️ Oops!</h1>
		<h2>Something went wrong</h2>

		{#if $page.status === 404}
			<p>The page you're looking for doesn't exist.</p>
		{:else if $page.status === 500}
			<p>A server error occurred. Please try again later.</p>
		{:else if $page.error?.message}
			<p>{$page.error.message}</p>
		{:else}
			<p>An unexpected error occurred.</p>
		{/if}

		<p class="error-code">Error {$page.status || 'Unknown'}</p>

		<div class="error-actions">
			<Button href="/">Go to Home</Button>
			<Button variant="secondary" on:click={() => window.history.back()}>
				Go Back
			</Button>
		</div>
	</div>
</div>

<style>
	.error-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	}

	.error-content {
		text-align: center;
		background: white;
		padding: 3rem;
		border-radius: 12px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
		max-width: 500px;
	}

	h1 {
		margin: 0 0 0.5rem 0;
		font-size: 3rem;
		color: #dc3545;
	}

	h2 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		color: #333;
	}

	p {
		margin: 0 0 1rem 0;
		font-size: 1.05rem;
		color: #666;
		line-height: 1.6;
	}

	.error-code {
		font-size: 0.95rem;
		color: #999;
		font-weight: 600;
		margin-bottom: 2rem;
	}

	.error-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	@media (max-width: 600px) {
		.error-container {
			padding: 1rem;
		}

		.error-content {
			padding: 2rem;
		}

		h1 {
			font-size: 2rem;
		}

		h2 {
			font-size: 1.25rem;
		}

		.error-actions {
			flex-direction: column;
		}
	}
</style>
