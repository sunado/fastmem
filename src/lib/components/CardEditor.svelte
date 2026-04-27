<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import CardForm from './CardForm.svelte';
	import type { Flashcard } from '$lib/db/schema';

	export let mode: 'add' | 'edit' = 'add';
	export let card: Flashcard | null = null;
	export let setId: number;
	export let isSubmitting = false;

	const dispatch = createEventDispatcher<{
		created: Flashcard;
		updated: Flashcard;
		cancelled: void;
	}>();

	let question = card?.question || '';
	let answer = card?.answer || '';

	async function handleSubmit(event: CustomEvent<{ question: string; answer: string }>) {
		const { question: q, answer: a } = event.detail;

		try {
			if (mode === 'add') {
				// Create new card
				const response = await fetch('/api/cards', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': getAuthHeader()
					},
					body: JSON.stringify({
						setId,
						question: q,
						answer: a
					})
				});

				if (response.ok) {
					const data = await response.json();
					if (data.success && data.card) {
						dispatch('created', data.card);
					}
				}
			} else {
				// Update existing card
				if (!card) return;

				const response = await fetch(`/api/cards/${card.id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': getAuthHeader()
					},
					body: JSON.stringify({
						setId,
						question: q,
						answer: a
					})
				});

				if (response.ok) {
					const data = await response.json();
					if (data.success && data.card) {
						dispatch('updated', data.card);
					}
				}
			}
		} catch (error) {
			console.error('Error saving card:', error);
		}
	}

	function handleCancel() {
		dispatch('cancelled');
	}

	function getAuthHeader(): string {
		if (typeof window === 'undefined') return '';

		const session = localStorage.getItem('fastmem_session');
		if (!session) return '';

		try {
			const sessionStr = JSON.stringify(JSON.parse(session));
			const encoded = Buffer.from(sessionStr).toString('base64');
			return `Bearer ${encoded}`;
		} catch {
			return '';
		}
	}
</script>

<div class="card-editor">
	<h3>{mode === 'add' ? 'Add New Card' : 'Edit Card'}</h3>
	<CardForm
		bind:question
		bind:answer
		{mode}
		{isSubmitting}
		on:submit={handleSubmit}
		on:cancel={handleCancel}
	/>
</div>

<style>
	.card-editor {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	h3 {
		margin: 0;
		font-size: 1.25rem;
		color: #333;
	}
</style>
