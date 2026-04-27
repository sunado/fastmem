<script lang="ts">
	import { tick } from 'svelte';

	export let title: string;
	export let open = false;
	export let onClose: (() => void) | undefined = undefined;

	let dialogElement: HTMLDialogElement;

	$: if (open && dialogElement && !dialogElement.open) {
		tick().then(() => dialogElement?.showModal());
	} else if (!open && dialogElement && dialogElement.open) {
		dialogElement.close();
	}

	function handleClose(): void {
		if (dialogElement) {
			dialogElement.close();
		}
		onClose?.();
	}

	function handleBackdropClick(event: MouseEvent): void {
		if (event.target === dialogElement) {
			handleClose();
		}
	}
</script>

<dialog
	bind:this={dialogElement}
	class="modal"
	on:close={handleClose}
	on:click={handleBackdropClick}
	role="dialog"
	aria-modal="true"
	aria-labelledby="modal-title"
>
	<div class="modal-content" role="document">
		<div class="modal-header">
			<h2 id="modal-title" class="modal-title">{title}</h2>
			<button
				class="modal-close"
				on:click={handleClose}
				aria-label="Close modal"
				type="button"
			>
				<span aria-hidden="true">&times;</span>
			</button>
		</div>
		<div class="modal-body">
			<slot />
		</div>
	</div>
</dialog>

<style>
	:global(body.modal-open) {
		overflow: hidden;
	}

	dialog {
		border: none;
		border-radius: 0.5rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		padding: 0;
		max-width: 500px;
		width: 90%;
	}

	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}

	dialog[open] {
		display: flex;
		flex-direction: column;
	}

	.modal-content {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #6b7280;
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.25rem;
		transition: background-color 0.2s;
	}

	.modal-close:hover {
		background-color: #f3f4f6;
	}

	.modal-close:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.modal-body {
		padding: 1.5rem;
		overflow-y: auto;
		max-height: calc(100vh - 200px);
	}
</style>
