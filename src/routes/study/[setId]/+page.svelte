<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import StudyCard from '$lib/components/StudyCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import SideMenu from '$lib/components/SideMenu.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import CardEditor from '$lib/components/CardEditor.svelte';
	import { cardsStore } from '$lib/stores/cards';
	import type { PageData } from './$types';
	import type { Flashcard } from '$lib/db/schema';

	export let data: PageData;

	const setId = parseInt(data.setId || '0', 10);
	const setName = data.setName || 'Flashcard Set';

	let currentCardIndex = 0;
	let reviewedCount = 0;
	let isStudyComplete = false;
	let isAuthenticated = false;
	let isLoadingCards = true;
	let showCardEditorModal = false;
	let cardEditorMode: 'add' | 'edit' = 'add';
	let cardToEdit: Flashcard | null = null;

	// Subscribe to cards store
	let storeData = {
		cards: [] as Flashcard[],
		currentSetId: null as number | null,
		loading: false,
		error: null as string | null
	};

	const unsubscribe = cardsStore.subscribe((state) => {
		storeData = state;
	});

	onMount(() => {
		// Check if user is authenticated
		if (typeof window !== 'undefined') {
			const session = localStorage.getItem('fastmem_session');
			if (!session) {
				goto('/');
				return;
			}
			isAuthenticated = true;
		}

		// Load cards for this set
		if (setId && setId > 0) {
			cardsStore.fetchCards(setId).then(() => {
				isLoadingCards = false;
			});
		}

		return () => {
			unsubscribe();
		};
	});

	function handleCardRemembered(event: CustomEvent<Flashcard>) {
		const card = event.detail;
		reviewedCount++;
		advanceCard();
	}

	function handleCardForgot(event: CustomEvent<Flashcard>) {
		const card = event.detail;
		reviewedCount++;
		advanceCard();
	}

	function advanceCard() {
		currentCardIndex++;

		if (currentCardIndex >= storeData.cards.length) {
			isStudyComplete = true;
		}
	}

	function resetStudy() {
		currentCardIndex = 0;
		reviewedCount = 0;
		isStudyComplete = false;
	}

	function goToDashboard() {
		cardsStore.clearCards();
		goto('/dashboard');
	}

	function goToNextCard() {
		advanceCard();
	}

	function goToPreviousCard() {
		if (currentCardIndex > 0) {
			currentCardIndex--;
		}
	}

	function handleMenuAddCard() {
		cardEditorMode = 'add';
		cardToEdit = null;
		showCardEditorModal = true;
	}

	function handleMenuEditCard() {
		if (!currentCard) return;
		cardEditorMode = 'edit';
		cardToEdit = currentCard;
		showCardEditorModal = true;
	}

	async function handleMenuDeleteCard() {
		if (!currentCard) return;

		const confirmed = confirm(`Delete card: "${currentCard.question.substring(0, 50)}..."?`);
		if (!confirmed) return;

		const success = await cardsStore.deleteCard(currentCard.id, setId);
		if (success) {
			// Adjust current index if needed
			if (currentCardIndex >= storeData.cards.length) {
				currentCardIndex = Math.max(0, storeData.cards.length - 1);
			}

			if (storeData.cards.length === 0) {
				isStudyComplete = true;
			}
		}
	}

	function handleCardCreated(event: CustomEvent<Flashcard>) {
		// Card added to store automatically
		showCardEditorModal = false;
	}

	function handleCardUpdated(event: CustomEvent<Flashcard>) {
		// Card updated in store automatically
		showCardEditorModal = false;
	}

	function handleEditorCancelled() {
		showCardEditorModal = false;
	}

	function closeCardEditorModal() {
		showCardEditorModal = false;
	}

	$: currentCard = storeData.cards[currentCardIndex];
	$: hasCards = storeData.cards.length > 0;
	$: cardCount = storeData.cards.length;
	$: progress = cardCount > 0 ? Math.round(((currentCardIndex + reviewedCount) / cardCount) * 100) : 0;
</script>

<svelte:head>
	<title>Study - {setName} - FastMem</title>
</svelte:head>

<div class="study-container">
	<!-- Header -->
	<div class="study-header">
		<div class="header-info">
			<h1>{setName}</h1>
			<p class="subtitle">{cardCount} {cardCount === 1 ? 'card' : 'cards'}</p>
		</div>
		<div class="header-actions">
			<Button variant="secondary" on:click={goToDashboard}>
				← Back to Dashboard
			</Button>
		</div>
	</div>

	<!-- Loading state -->
	{#if isLoadingCards}
		<div class="loading">
			<p>Loading cards...</p>
		</div>
	{:else if !hasCards}
		<!-- No cards message -->
		<div class="empty-state">
			<p>No cards in this set yet.</p>
			<Button on:click={goToDashboard}>Go to Dashboard</Button>
		</div>
	{:else if isStudyComplete}
		<!-- Study complete state -->
		<div class="completion-state">
			<div class="completion-content">
				<h2>🎉 Great Job!</h2>
				<p>You've reviewed all {cardCount} {cardCount === 1 ? 'card' : 'cards'} in this set.</p>
				<div class="completion-stats">
					<div class="stat">
						<p class="stat-label">Cards Reviewed</p>
						<p class="stat-value">{reviewedCount}</p>
					</div>
					<div class="stat">
						<p class="stat-label">Success Rate</p>
						<p class="stat-value">{cardCount > 0 ? Math.round((reviewedCount / cardCount) * 100) : 0}%</p>
					</div>
				</div>
				<div class="completion-actions">
					<Button on:click={resetStudy}>Study Again</Button>
					<Button variant="secondary" on:click={goToDashboard}>
						Return to Dashboard
					</Button>
				</div>
			</div>
		</div>
	{:else}
		<!-- Study view -->
		<div class="study-content">
			<!-- Progress bar -->
			<div class="progress-section">
				<div class="progress-info">
					<span class="card-counter">Card {currentCardIndex + 1} of {cardCount}</span>
					<span class="progress-percentage">{progress}%</span>
				</div>
				<div class="progress-bar">
					<div class="progress-fill" style="width: {progress}%"></div>
				</div>
			</div>

			<div class="study-layout">
				<!-- Main content -->
				<div class="study-main">
					<!-- Current card -->
					{#if currentCard}
						<div class="card-wrapper">
							<StudyCard
								card={currentCard}
								on:cardRemembered={handleCardRemembered}
								on:cardForgot={handleCardForgot}
							/>
						</div>
					{/if}

					<!-- Navigation controls -->
					<div class="controls-section">
						<div class="navigation-controls">
							<Button
								variant="secondary"
								disabled={currentCardIndex === 0}
								on:click={goToPreviousCard}
							>
								← Previous
							</Button>
							<Button
								variant="secondary"
								disabled={currentCardIndex === cardCount - 1}
								on:click={goToNextCard}
							>
								Next →
							</Button>
						</div>
						<p class="instructions">
							<strong>Drag left</strong> if you remembered the card, <strong>drag right</strong> if you need to study more.
						</p>
					</div>

					<!-- Reviewed count -->
					<div class="study-stats">
						<p>Cards reviewed: {reviewedCount} of {cardCount}</p>
					</div>
				</div>

				<!-- Side menu -->
				<div class="study-side">
					<SideMenu
						{cardCount}
						currentCardIndex={cardCount > 0 ? currentCardIndex : 0}
						on:addCard={handleMenuAddCard}
						on:editCard={handleMenuEditCard}
						on:deleteCard={handleMenuDeleteCard}
					/>
				</div>
			</div>
		</div>

		<!-- Card Editor Modal -->
		<Modal bind:open={showCardEditorModal} on:close={closeCardEditorModal}>
			<CardEditor
				mode={cardEditorMode}
				card={cardToEdit}
				{setId}
				on:created={handleCardCreated}
				on:updated={handleCardUpdated}
				on:cancelled={handleEditorCancelled}
			/>
		</Modal>
	{/if}

	<!-- Error message -->
	{#if storeData.error}
		<div class="error-message">
			<p>Error: {storeData.error}</p>
		</div>
	{/if}
</div>

<style>
	.study-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
		min-height: 100vh;
	}

	.study-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
	}

	.header-info {
		flex: 1;
	}

	.study-header h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2rem;
		font-weight: 700;
		color: #333;
	}

	.subtitle {
		margin: 0;
		font-size: 1rem;
		color: #666;
	}

	.header-actions {
		display: flex;
		gap: 1rem;
	}

	.loading,
	.empty-state {
		text-align: center;
		padding: 3rem;
		background-color: #f9f9f9;
		border-radius: 8px;
		border: 1px solid #ddd;
	}

	.loading p,
	.empty-state p {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		color: #666;
	}

	.completion-state {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		min-height: 400px;
	}

	.completion-content {
		text-align: center;
		max-width: 500px;
	}

	.completion-content h2 {
		margin: 0 0 1rem 0;
		font-size: 2rem;
		color: #28a745;
	}

	.completion-content p {
		margin: 0 0 2rem 0;
		font-size: 1.1rem;
		color: #666;
	}

	.completion-stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.stat {
		padding: 1.5rem;
		background-color: #f0f8ff;
		border-radius: 8px;
		border: 1px solid #bdd7ee;
	}

	.stat-label {
		margin: 0 0 0.5rem 0;
		font-size: 0.9rem;
		color: #666;
		text-transform: uppercase;
		font-weight: 600;
	}

	.stat-value {
		margin: 0;
		font-size: 2rem;
		font-weight: bold;
		color: #007bff;
	}

	.completion-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.study-content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.progress-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.progress-info {
		display: flex;
		justify-content: space-between;
		font-size: 0.9rem;
		color: #666;
	}

	.card-counter {
		font-weight: 600;
	}

	.progress-percentage {
		font-weight: 600;
		color: #007bff;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background-color: #e0e0e0;
		border-radius: 4px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background-color: #007bff;
		transition: width 0.3s ease;
	}

	.card-wrapper {
		display: flex;
		justify-content: center;
		position: relative;
		min-height: 400px;
	}

	.controls-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}

	.navigation-controls {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.instructions {
		font-size: 0.9rem;
		color: #666;
		margin: 0;
		text-align: center;
	}

	.study-stats {
		text-align: center;
		padding: 1rem;
		background-color: #f9f9f9;
		border-radius: 8px;
		border: 1px solid #ddd;
	}

	.study-stats p {
		margin: 0;
		font-size: 0.95rem;
		color: #666;
	}

	.error-message {
		padding: 1rem;
		background-color: #f8d7da;
		border: 1px solid #f5c6cb;
		border-radius: 4px;
		color: #721c24;
	}

	.error-message p {
		margin: 0;
	}

	.study-layout {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: 2rem;
		align-items: start;
	}

	.study-main {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.study-side {
		position: sticky;
		top: 2rem;
	}

	@media (max-width: 900px) {
		.study-layout {
			grid-template-columns: 1fr;
		}

		.study-side {
			position: static;
		}
	}

	@media (max-width: 600px) {
		.study-container {
			padding: 1rem;
			gap: 1.5rem;
		}

		.study-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.study-header h1 {
			font-size: 1.5rem;
		}

		.completion-stats {
			grid-template-columns: 1fr;
		}

		.navigation-controls {
			flex-wrap: wrap;
		}
	}
</style>
