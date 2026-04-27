<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import SetGrid from '$lib/components/SetGrid.svelte';
	import SetForm from '$lib/components/SetForm.svelte';
	import Button from '$lib/components/Button.svelte';
	import { sets } from '$lib/stores/sets';
	import type { PageData } from './$types';
	import type { FlashcardSet } from '$lib/db/schema';

	interface SetWithCount extends FlashcardSet {
		card_count: number;
	}

	export let data: PageData;

	let showCreateModal = false;
	let isLoading = true;
	let storeError: string | null = null;
	let isAuthenticated = false;

	// Subscribe to store
	let storeData = {
		sets: data.sets || [],
		loading: false,
		error: null as string | null
	};

	const unsubscribe = sets.subscribe((state) => {
		storeData = state;
		storeError = state.error;
	});

	onMount(() => {
		// Check if user is authenticated
		if (typeof window !== 'undefined') {
			const session = localStorage.getItem('fastmem_session');
			if (!session) {
				// Redirect to login if not authenticated
				goto('/');
				return;
			}
			isAuthenticated = true;
		}

		// Load sets from API
		sets.fetchSets().then(() => {
			isLoading = false;
		});

		return () => {
			unsubscribe();
		};
	});

	async function handleCreateSet(event: CustomEvent<{ name: string; description?: string }>): Promise<void> {
		const { name, description } = event.detail;
		const result = await sets.createSet(name, description);
		if (result) {
			showCreateModal = false;
		}
	}

	async function handleEditSet(editedSet: SetWithCount): Promise<void> {
		const result = await sets.updateSet(editedSet.id, editedSet.name, editedSet.description ?? undefined);
		// Modal is handled by SetCard component
	}

	async function handleDeleteSet(setId: number): Promise<void> {
		await sets.deleteSet(setId);
	}

	function handleCloseModal(): void {
		showCreateModal = false;
	}

	$: displaySets = storeData.sets;

</script>

<svelte:head>
	<title>Dashboard - FastMem</title>
</svelte:head>

<div class="dashboard">
	<div class="dashboard-header">
		<div class="dashboard-title-section">
			<h1 class="dashboard-title">My Flashcard Sets</h1>
			<p class="dashboard-subtitle">Create, manage, and study your flashcard sets</p>
		</div>
		<Button
			variant="primary"
			size="md"
			on:click={() => (showCreateModal = true)}
			aria-label="Create new set"
		>
			+ Create Set
		</Button>
	</div>

	{#if storeError}
		<div class="error-banner" role="alert">
			<p class="error-message">{storeError}</p>
		</div>
	{/if}

	{#if storeData.loading && displaySets.length === 0}
		<div class="loading-state">
			<div class="loading-spinner" aria-hidden="true"></div>
			<p class="loading-text">Loading your sets...</p>
		</div>
	{:else}
		<SetGrid
			sets={displaySets}
			onEdit={handleEditSet}
			onDelete={handleDeleteSet}
		/>
	{/if}
</div>

<Modal
	title="Create New Set"
	open={showCreateModal}
	onClose={handleCloseModal}
>
	<SetForm on:submit={handleCreateSet} />
</Modal>

<style>
	.dashboard {
		min-height: 100vh;
		padding: 2rem;
		background-color: #f9fafb;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2rem;
		margin-bottom: 2rem;
		max-width: 1200px;
		margin-left: auto;
		margin-right: auto;
	}

	.dashboard-title-section {
		flex: 1;
	}

	.dashboard-title {
		margin: 0;
		font-size: 2rem;
		font-weight: 700;
		color: #111827;
	}

	.dashboard-subtitle {
		margin: 0.5rem 0 0 0;
		font-size: 1rem;
		color: #6b7280;
	}

	.error-banner {
		max-width: 1200px;
		margin: 0 auto 1.5rem;
		padding: 1rem;
		background-color: #fee;
		border: 1px solid #fca;
		border-radius: 0.375rem;
		color: #dc2626;
	}

	.error-message {
		margin: 0;
		font-size: 0.95rem;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		gap: 1rem;
	}

	.loading-spinner {
		width: 2rem;
		height: 2rem;
		border: 3px solid #e5e7eb;
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.loading-text {
		margin: 0;
		color: #6b7280;
		font-size: 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 768px) {
		.dashboard {
			padding: 1.5rem;
		}

		.dashboard-header {
			flex-direction: column;
			gap: 1rem;
		}

		.dashboard-title {
			font-size: 1.75rem;
		}

		.dashboard-subtitle {
			font-size: 0.95rem;
		}
	}

	@media (max-width: 480px) {
		.dashboard {
			padding: 1rem;
		}

		.dashboard-title {
			font-size: 1.5rem;
		}

		.dashboard-subtitle {
			font-size: 0.9rem;
		}
	}
</style>
