<script lang="ts">
	import Button from './Button.svelte';
	import Modal from './Modal.svelte';
	import SetForm from './SetForm.svelte';
	import type { FlashcardSet } from '$lib/db/schema';

	interface SetWithCount extends FlashcardSet {
		card_count: number;
	}

	export let set: SetWithCount;
	export let onEdit: ((set: SetWithCount) => void) | undefined = undefined;
	export let onDelete: (() => void) | undefined = undefined;

	let showEditModal = false;

	function handleEditClick(): void {
		showEditModal = true;
	}

	function handleDeleteClick(): void {
		if (confirm(`Are you sure you want to delete "${set.name}"? This action cannot be undone.`)) {
			onDelete?.();
		}
	}

	function handleFormSubmit(event: CustomEvent<{ name: string; description?: string }>): void {
		const { name, description } = event.detail;
		onEdit?.({
			...set,
			name,
			description: description || null
		});
		showEditModal = false;
	}

	function handleCloseModal(): void {
		showEditModal = false;
	}
</script>

<div class="set-card">
	<div class="set-card-header">
		<h3 class="set-card-title">{set.name}</h3>
		<div class="set-card-badge">{set.card_count} cards</div>
	</div>

	{#if set.description}
		<p class="set-card-description">{set.description}</p>
	{/if}

	<div class="set-card-meta">
		<p class="set-card-date">Created {new Date(set.createdAt).toLocaleDateString()}</p>
	</div>

	<div class="set-card-actions">
		<Button variant="secondary" size="sm" on:click={handleEditClick} aria-label="Edit set">
			Edit
		</Button>
		<Button variant="danger" size="sm" on:click={handleDeleteClick} aria-label="Delete set">
			Delete
		</Button>
	</div>
</div>

<Modal
	title="Edit Set"
	open={showEditModal}
	onClose={handleCloseModal}
>
	<SetForm
		initialSet={set}
		on:submit={handleFormSubmit}
	/>
</Modal>

<style>
	.set-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		background-color: #fff;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: box-shadow 0.2s, border-color 0.2s;
	}

	.set-card:hover {
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border-color: #d1d5db;
	}

	.set-card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.set-card-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
	}

	.set-card-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 3rem;
		padding: 0.25rem 0.75rem;
		background-color: #dbeafe;
		color: #1e40af;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
	}

	.set-card-description {
		margin: 0;
		color: #6b7280;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.set-card-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.set-card-date {
		margin: 0;
		font-size: 0.875rem;
		color: #9ca3af;
	}

	.set-card-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	@media (max-width: 640px) {
		.set-card {
			padding: 1rem;
		}

		.set-card-header {
			flex-direction: column;
		}

		.set-card-title {
			font-size: 1rem;
		}
	}
</style>
