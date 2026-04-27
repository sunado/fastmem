<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import FlipCard from './FlipCard.svelte';
	import { gesture, type DragState } from '$lib/utils/gestures';
	import type { Flashcard } from '$lib/db/schema';

	export let card: Flashcard;

	const dispatch = createEventDispatcher<{
		cardRemembered: Flashcard;
		cardForgot: Flashcard;
	}>();

	let dragDelta = 0;
	let feedbackMessage = '';
	let dragInProgress = false;

	function handleDragStart() {
		dragInProgress = true;
		dragDelta = 0;
		feedbackMessage = '';
	}

	function handleDrag(event: CustomEvent<DragState>) {
		dragDelta = event.detail.deltaX;

		if (Math.abs(dragDelta) > 30) {
			if (dragDelta > 0) {
				feedbackMessage = '→ Forgot';
			} else {
				feedbackMessage = 'Remembered ←';
			}
		} else {
			feedbackMessage = '';
		}
	}

	function handleDragEnd(event: CustomEvent<{ state: DragState; gesture: 'left' | 'right' | null }>) {
		dragInProgress = false;
		const gesture = event.detail.gesture;

		if (gesture === 'left') {
			// Swiped left - card remembered
			dispatch('cardRemembered', card);
		} else if (gesture === 'right') {
			// Swiped right - card forgot (need to study more)
			dispatch('cardForgot', card);
		}

		dragDelta = 0;
		feedbackMessage = '';
	}

	function handleCustomGesture(detail: any) {
		const { state, gesture } = detail;

		if (gesture === 'left') {
			dispatch('cardRemembered', card);
		} else if (gesture === 'right') {
			dispatch('cardForgot', card);
		}
	}
</script>

<!-- Study card with drag gesture handlers -->
<div
	class="study-card"
	use:gesture={{
		threshold: 50,
		onDragStart: handleDragStart,
		onDrag: (state) => handleDrag(new CustomEvent('drag', { detail: state })),
		onDragEnd: (state, gesture) => handleDragEnd(new CustomEvent('dragend', { detail: { state, gesture } }))
	}}
	style="transform: translateX({dragDelta * 0.1}px); opacity: {1 - Math.abs(dragDelta) / 500};"
>
	<FlipCard question={card.question} answer={card.answer} />

	<!-- Visual feedback during drag -->
	{#if feedbackMessage}
		<div class="drag-feedback" class:left={dragDelta < 0} class:right={dragDelta > 0}>
			{feedbackMessage}
		</div>
	{/if}
</div>

<style>
	.study-card {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		transition: transform 0.1s ease-out, opacity 0.1s ease-out;
		touch-action: none;
		user-select: none;
	}

	.drag-feedback {
		position: absolute;
		top: 50%;
		font-size: 1.5rem;
		font-weight: bold;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		background-color: rgba(0, 0, 0, 0.1);
		opacity: 0.7;
		pointer-events: none;
		transform: translateY(-50%);
		white-space: nowrap;
	}

	.drag-feedback.left {
		right: 2rem;
		color: #28a745;
	}

	.drag-feedback.right {
		left: 2rem;
		color: #dc3545;
	}

	@media (max-width: 600px) {
		.drag-feedback {
			font-size: 1.25rem;
		}

		.drag-feedback.left {
			right: 1rem;
		}

		.drag-feedback.right {
			left: 1rem;
		}
	}
</style>
