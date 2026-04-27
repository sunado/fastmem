<script lang="ts">
	import Button from './Button.svelte';
	import type { FlashcardSet } from '$lib/db/schema';
	import { createEventDispatcher } from 'svelte';

	interface SetWithCount extends FlashcardSet {
		card_count?: number;
	}

	export let initialSet: SetWithCount | undefined = undefined;

	const dispatch = createEventDispatcher<{ submit: { name: string; description?: string } }>();

	let name = initialSet?.name ?? '';
	let description = initialSet?.description ?? '';
	let errors: Record<string, string> = {};
	let isSubmitting = false;

	function validateForm(): boolean {
		errors = {};

		if (!name.trim()) {
			errors.name = 'Name is required';
		} else if (name.trim().length < 1) {
			errors.name = 'Name must be at least 1 character';
		} else if (name.trim().length > 100) {
			errors.name = 'Name must be no more than 100 characters';
		}

		if (description && description.length > 500) {
			errors.description = 'Description must be no more than 500 characters';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit(): Promise<void> {
		if (!validateForm()) {
			return;
		}

		isSubmitting = true;
		try {
			dispatch('submit', {
				name: name.trim(),
				description: description.trim() || undefined
			});
		} finally {
			isSubmitting = false;
		}
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter' && event.ctrlKey) {
			handleSubmit();
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="set-form">
	<div class="form-group">
		<label for="set-name" class="form-label">
			Name <span class="required">*</span>
		</label>
		<input
			id="set-name"
			type="text"
			class="form-input"
			placeholder="Enter set name"
			bind:value={name}
			maxlength="100"
			aria-describedby={errors.name ? 'name-error' : undefined}
			disabled={isSubmitting}
		/>
		{#if errors.name}
			<p id="name-error" class="form-error">{errors.name}</p>
		{/if}
		<p class="form-hint">{name.length}/100 characters</p>
	</div>

	<div class="form-group">
		<label for="set-description" class="form-label">Description</label>
		<textarea
			id="set-description"
			class="form-textarea"
			placeholder="Enter set description (optional)"
			bind:value={description}
			maxlength="500"
			rows="4"
			aria-describedby={errors.description ? 'description-error' : undefined}
			disabled={isSubmitting}
			on:keydown={handleKeydown}
		/>
		{#if errors.description}
			<p id="description-error" class="form-error">{errors.description}</p>
		{/if}
		<p class="form-hint">{description.length}/500 characters</p>
	</div>

	<div class="form-actions">
		<Button
			type="submit"
			variant="primary"
			size="md"
			disabled={isSubmitting}
		>
			{isSubmitting ? 'Saving...' : initialSet ? 'Update Set' : 'Create Set'}
		</Button>
	</div>
</form>

<style>
	.set-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-label {
		font-weight: 600;
		color: #111827;
		font-size: 0.95rem;
	}

	.required {
		color: #dc2626;
		margin-left: 0.25rem;
	}

	.form-input,
	.form-textarea {
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-family: inherit;
		font-size: 1rem;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.form-input:focus,
	.form-textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-input:disabled,
	.form-textarea:disabled {
		background-color: #f3f4f6;
		color: #9ca3af;
		cursor: not-allowed;
	}

	.form-error {
		margin: 0;
		color: #dc2626;
		font-size: 0.875rem;
	}

	.form-hint {
		margin: 0;
		color: #9ca3af;
		font-size: 0.875rem;
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	@media (max-width: 640px) {
		.set-form {
			gap: 1rem;
		}

		.form-label {
			font-size: 0.9rem;
		}

		.form-input,
		.form-textarea {
			font-size: 16px;
		}
	}
</style>
