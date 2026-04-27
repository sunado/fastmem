<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from './Button.svelte';

	export let cardCount = 0;
	export let currentCardIndex = 0;

	const dispatch = createEventDispatcher<{
		addCard: void;
		editCard: void;
		deleteCard: void;
	}>();

	function handleAddCard() {
		dispatch('addCard');
	}

	function handleEditCard() {
		dispatch('editCard');
	}

	function handleDeleteCard() {
		dispatch('deleteCard');
	}

	$: hasCards = cardCount > 0;
</script>

<div class="side-menu">
	<div class="menu-section">
		<h3>Card Operations</h3>
		<div class="menu-items">
			<Button
				variant="secondary"
				on:click={handleAddCard}
				class="menu-button"
			>
				<span class="icon">➕</span>
				<span>Add Card</span>
			</Button>

			<Button
				variant="secondary"
				disabled={!hasCards}
				on:click={handleEditCard}
				class="menu-button"
			>
				<span class="icon">✏️</span>
				<span>Edit Card</span>
			</Button>

			<Button
				variant="danger"
				disabled={!hasCards}
				on:click={handleDeleteCard}
				class="menu-button"
			>
				<span class="icon">🗑️</span>
				<span>Delete Card</span>
			</Button>
		</div>
	</div>
</div>

<style>
	.side-menu {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 1.5rem;
		background-color: #f9f9f9;
		border-radius: 8px;
		border: 1px solid #ddd;
	}

	.menu-section h3 {
		margin: 0 0 1rem 0;
		font-size: 1rem;
		font-weight: 600;
		text-transform: uppercase;
		color: #666;
		letter-spacing: 0.05em;
	}

	.menu-items {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	:global(.menu-button) {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		justify-content: flex-start;
		width: 100%;
	}

	.icon {
		font-size: 1.2rem;
	}

	@media (max-width: 600px) {
		.side-menu {
			padding: 1rem;
			border-radius: 6px;
		}

		.menu-items {
			flex-direction: row;
			gap: 0.5rem;
			flex-wrap: wrap;
		}

		:global(.menu-button) {
			flex: 1 1 auto;
			min-width: 100px;
			justify-content: center;
			flex-direction: column;
			gap: 0.25rem;
			font-size: 0.85rem;
		}

		.icon {
			font-size: 1rem;
		}
	}
</style>
