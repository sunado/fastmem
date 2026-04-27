<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let onSubmit: (credentials: { username: string; password: string }) => void = () => {};
	export let loading = false;
	export let error: string | null = null;

	const dispatch = createEventDispatcher<{
		submit: { username: string; password: string };
	}>();

	let username = '';
	let password = '';

	function handleSubmit(e: Event) {
		e.preventDefault();

		// Validate inputs
		if (!username.trim() || !password.trim()) {
			return;
		}

		const credentials = {
			username: username.trim(),
			password
		};

		// Call provided handler
		onSubmit(credentials);

		// Dispatch event for Svelte components
		dispatch('submit', credentials);
	}
</script>

<form on:submit={handleSubmit} class="login-form">
	<div class="form-group">
		<label for="username">Username</label>
		<input
			id="username"
			type="text"
			name="username"
			bind:value={username}
			required
			disabled={loading}
			placeholder="Enter your username"
			autocomplete="username"
			aria-label="Username"
			aria-describedby={error ? 'error-message' : undefined}
		/>
	</div>

	<div class="form-group">
		<label for="password">Password</label>
		<input
			id="password"
			type="password"
			name="password"
			bind:value={password}
			required
			disabled={loading}
			placeholder="Enter your password"
			autocomplete="current-password"
			aria-label="Password"
			aria-describedby={error ? 'error-message' : undefined}
		/>
	</div>

	{#if error}
		<div id="error-message" class="error-message" role="alert">
			{error}
		</div>
	{/if}

	<button type="submit" disabled={loading || !username.trim() || !password.trim()}>
		{loading ? 'Logging in...' : 'Login'}
	</button>
</form>

<style>
	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		width: 100%;
		max-width: 400px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 500;
		color: #333;
		font-size: 0.95rem;
	}

	input {
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #0066cc;
		box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
	}

	input:disabled {
		background-color: #f5f5f5;
		cursor: not-allowed;
		opacity: 0.6;
	}

	button {
		padding: 0.75rem 1rem;
		background-color: #0066cc;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	button:hover:not(:disabled) {
		background-color: #0052a3;
	}

	button:disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}

	.error-message {
		padding: 0.75rem;
		background-color: #fee;
		color: #c33;
		border: 1px solid #fcc;
		border-radius: 4px;
		font-size: 0.95rem;
	}
</style>
