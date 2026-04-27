<script lang="ts">
	import SetCard from './SetCard.svelte';
	import type { FlashcardSet } from '$lib/db/schema';

	interface SetWithCount extends FlashcardSet {
		card_count: number;
	}

	export let sets: SetWithCount[] = [];
	export let onEdit: ((set: SetWithCount) => void) | undefined = undefined;
	export let onDelete: ((setId: number) => void) | undefined = undefined;
</script>

{#if sets.length === 0}
	<div class="empty-state">
		<p>No flashcard sets yet. Create your first set to get started!</p>
	</div>
{:else}
	<div class="set-grid">
		{#each sets as set (set.id)}
			<SetCard
				{set}
				on:click={() => {
					// Navigate to set details or study
				}}
				onEdit={(editedSet) => {
					onEdit?.(editedSet);
				}}
				onDelete={() => {
					onDelete?.(set.id);
				}}
			/>
		{/each}
	</div>
{/if}

<style>
	.set-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 300px;
		width: 100%;
		padding: 2rem;
		text-align: center;
		background-color: #f9fafb;
		border: 2px dashed #d1d5db;
		border-radius: 0.5rem;
	}

	.empty-state p {
		margin: 0;
		color: #6b7280;
		font-size: 1rem;
	}

	@media (max-width: 768px) {
		.set-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
	}

	@media (max-width: 480px) {
		.set-grid {
			gap: 1rem;
		}

		.empty-state {
			min-height: 200px;
			padding: 1.5rem;
		}

		.empty-state p {
			font-size: 0.95rem;
		}
	}
</style>
