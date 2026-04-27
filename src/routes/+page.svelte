<script lang="ts">
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session';
	import LoginForm from '$lib/components/LoginForm.svelte';
	import { apiPost } from '$lib/utils/api';
	import type { SuccessResponse } from '$lib/utils/errorHandler';

	let loading = false;
	let error: string | null = null;

	interface LoginResponseData {
		success: boolean;
		user: {
			id: number;
			username: string;
		};
		session: {
			userId: number;
			username: string;
			isAuthenticated: boolean;
			created_at: string;
			current_set_id: null;
			current_card_index: number;
			reviewed_count: number;
		};
	}

	async function handleLogin(credentials: { username: string; password: string }) {
		loading = true;
		error = null;

		try {
			const response = await apiPost<LoginResponseData>('/api/auth/login', credentials);

			if (!response.success) {
				error = response.error || 'Login failed. Please try again.';
				loading = false;
				return;
			}

			const loginData = response.data;

			// Save session to store and localStorage
			session.setSession({
				userId: loginData.session.userId,
				username: loginData.session.username,
				isAuthenticated: true,
				created_at: loginData.session.created_at,
				current_set_id: loginData.session.current_set_id,
				current_card_index: loginData.session.current_card_index,
				reviewed_count: loginData.session.reviewed_count
			});

			// Redirect to dashboard
			goto('/dashboard');
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
			console.error('Login error:', err);
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>FastMem - Login</title>
	<meta name="description" content="Login to FastMem flashcard app" />
</svelte:head>

<div class="login-container">
	<div class="login-card">
		<h1>FastMem</h1>
		<p class="subtitle">Learn faster with spaced repetition</p>

		<LoginForm
			onSubmit={handleLogin}
			{loading}
			{error}
			on:submit={(e) => handleLogin(e.detail)}
		/>

		<div class="demo-notice">
			<p><strong>Demo credentials:</strong></p>
			<p>Username: <code>user</code></p>
			<p>Password: <code>user</code></p>
		</div>
	</div>
</div>

<style>
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 1rem;
	}

	.login-card {
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		padding: 2rem;
		width: 100%;
		max-width: 500px;
	}

	h1 {
		text-align: center;
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 2rem;
	}

	.subtitle {
		text-align: center;
		color: #666;
		margin: 0 0 2rem 0;
		font-size: 0.95rem;
	}

	.demo-notice {
		margin-top: 2rem;
		padding: 1rem;
		background-color: #f0f8ff;
		border-left: 4px solid #0066cc;
		border-radius: 4px;
		font-size: 0.9rem;
		color: #333;
	}

	.demo-notice p {
		margin: 0.25rem 0;
	}

	code {
		background-color: #e8f1ff;
		padding: 0.2rem 0.5rem;
		border-radius: 2px;
		font-family: monospace;
		color: #0066cc;
	}
</style>
