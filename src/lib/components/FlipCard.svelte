<script lang="ts">
	export let question: string;
	export let answer: string;

	let flipped = false;

	function toggleFlip() {
		flipped = !flipped;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleFlip();
		}
	}
</script>

<!-- 3D flip card with CSS transform rotateY animation -->
<div class="flip-card-container" role="button" tabindex="0" on:click={toggleFlip} on:keydown={handleKeydown}>
	<div class="flip-card" class:flipped>
		<div class="flip-card-inner">
			<!-- Front side (question) -->
			<div class="flip-card-front">
				<div class="card-content">
					<p class="card-label">Question</p>
					<p class="card-text">{question}</p>
				</div>
			</div>

			<!-- Back side (answer) -->
			<div class="flip-card-back">
				<div class="card-content">
					<p class="card-label">Answer</p>
					<p class="card-text">{answer}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Click hint -->
	<p class="flip-hint">Click or press Enter to flip</p>
</div>

<style>
	.flip-card-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		cursor: pointer;
		outline: none;
	}

	.flip-card-container:focus {
		outline: 2px solid #007bff;
		outline-offset: 4px;
		border-radius: 8px;
	}

	.flip-card {
		width: 100%;
		max-width: 500px;
		height: 300px;
		perspective: 1000px;
	}

	.flip-card-inner {
		position: relative;
		width: 100%;
		height: 100%;
		text-align: center;
		transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
		transform-style: preserve-3d;
	}

	.flip-card.flipped .flip-card-inner {
		transform: rotateY(180deg);
	}

	.flip-card-front,
	.flip-card-back {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		padding: 2rem;
		box-sizing: border-box;
		border: 2px solid #ddd;
	}

	.flip-card-front {
		background-color: #ffffff;
		color: #333;
		z-index: 2;
	}

	.flip-card-back {
		background-color: #f0f8ff;
		color: #333;
		transform: rotateY(180deg);
		border-color: #007bff;
	}

	.card-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}

	.card-label {
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		color: #666;
		margin: 0;
		letter-spacing: 0.05em;
	}

	.card-text {
		font-size: 1.5rem;
		font-weight: 500;
		margin: 0;
		line-height: 1.6;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	.flip-hint {
		font-size: 0.875rem;
		color: #999;
		margin: 0;
		text-align: center;
		font-style: italic;
	}

	@media (max-width: 600px) {
		.flip-card {
			height: 250px;
		}

		.flip-card-front,
		.flip-card-back {
			padding: 1.5rem;
		}

		.card-text {
			font-size: 1.25rem;
		}
	}
</style>
