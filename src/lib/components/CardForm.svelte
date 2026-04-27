<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from './Button.svelte';

	export let question = '';
	export let answer = '';
	export let mode: 'add' | 'edit' = 'add';
	export let isSubmitting = false;

	const dispatch = createEventDispatcher<{
		submit: { question: string; answer: string };
		cancel: void;
	}>();

	let errors: { question?: string; answer?: string } = {};

	function validateForm(): boolean {
		errors = {};

		if (!question.trim()) {
			errors.question = 'Question is required';
		}

		if (!answer.trim()) {
			errors.answer = 'Answer is required';
		}

		return Object.keys(errors).length === 0;
	}

	function handleSubmit() {
		if (!validateForm()) {
			return;
		}

		dispatch('submit', {
			question: question.trim(),
			answer: answer.trim()
		});
	}

	function handleCancel() {
		dispatch('cancel');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && event.ctrlKey) {
			event.preventDefault();
			handleSubmit();
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit} on:keydown={handleKeydown}>
	<div class="form-group">
		<label for="question">Question</label>
		<textarea
			id="question"
			bind:value={question}
			placeholder="Enter the question or prompt..."
			rows="4"
			disabled={isSubmitting}
		></textarea>
		{#if errors.question}
			<span class="error-message">{errors.question}</span>
		{/if}
	</div>

	<div class="form-group">
		<label for="answer">Answer</label>
		<textarea
			id="answer"
			bind:value={answer}
			placeholder="Enter the answer or explanation..."
			rows="4"
			disabled={isSubmitting}
		></textarea>
		{#if errors.answer}
			<span class="error-message">{errors.answer}</span>
		{/if}
	</div>

	<div class="form-actions">
		<Button type="submit" disabled={isSubmitting}>
			{mode === 'add' ? 'Add Card' : 'Update Card'}
		</Button>
		<Button type="button" variant="secondary" on:click={handleCancel} disabled={isSubmitting}>
			Cancel
		</Button>
	</div>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 600;
		color: #333;
		font-size: 0.95rem;
	}

	textarea {
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-family: inherit;
		font-size: 0.95rem;
		resize: vertical;
		transition: border-color 0.3s ease;
	}

	textarea:focus {
		outline: none;
		border-color: #007bff;
		box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
	}

	textarea:disabled {
		background-color: #f5f5f5;
		cursor: not-allowed;
	}

	.error-message {
		color: #dc3545;
		font-size: 0.85rem;
		margin-top: 0.25rem;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		flex-wrap: wrap;
	}

	@media (max-width: 600px) {
		.form-actions {
			flex-direction: column;
		}
	}
</style>
