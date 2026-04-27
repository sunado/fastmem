/**
 * Gesture detection utility for pointer events (touch and mouse)
 * Recognizes left/right swipes with visual feedback
 */

export interface DragState {
	startX: number;
	startY: number;
	currentX: number;
	currentY: number;
	isDragging: boolean;
	deltaX: number;
	direction: 'left' | 'right' | null;
}

export interface GestureConfig {
	threshold?: number; // Minimum pixels to consider as swipe (default: 50)
	onDragStart?: (state: DragState) => void;
	onDrag?: (state: DragState) => void;
	onDragEnd?: (state: DragState, gesture: 'left' | 'right' | null) => void;
}

/**
 * Create gesture handler for an element
 * Recognizes left/right swipes using pointer events
 * Threshold default is 50px for left/right (significant drag)
 */
export function createGestureHandler(config: GestureConfig = {}) {
	const threshold = config.threshold || 50;
	let dragState: DragState = {
		startX: 0,
		startY: 0,
		currentX: 0,
		currentY: 0,
		isDragging: false,
		deltaX: 0,
		direction: null
	};

	function onPointerDown(event: PointerEvent) {
		dragState.startX = event.clientX;
		dragState.startY = event.clientY;
		dragState.currentX = event.clientX;
		dragState.currentY = event.clientY;
		dragState.isDragging = true;
		dragState.deltaX = 0;
		dragState.direction = null;

		config.onDragStart?.(dragState);
	}

	function onPointerMove(event: PointerEvent) {
		if (!dragState.isDragging) return;

		dragState.currentX = event.clientX;
		dragState.currentY = event.clientY;
		dragState.deltaX = dragState.currentX - dragState.startX;

		// Determine direction based on threshold
		if (Math.abs(dragState.deltaX) > threshold) {
			dragState.direction = dragState.deltaX > 0 ? 'right' : 'left';
		} else {
			dragState.direction = null;
		}

		config.onDrag?.(dragState);
	}

	function onPointerUp(event: PointerEvent) {
		if (!dragState.isDragging) return;

		dragState.isDragging = false;
		const gesture = dragState.direction;

		config.onDragEnd?.(dragState, gesture);

		// Reset state
		dragState = {
			startX: 0,
			startY: 0,
			currentX: 0,
			currentY: 0,
			isDragging: false,
			deltaX: 0,
			direction: null
		};
	}

	return {
		onPointerDown,
		onPointerMove,
		onPointerUp,
		getDragState: () => dragState
	};
}

/**
 * Attach gesture handlers to an element
 * Usage:
 *   const unsubscribe = attachGestureHandlers(element, {
 *     onDragEnd: (state, gesture) => {
 *       if (gesture === 'left') { // Swiped left
 *         // Handle remembered
 *       } else if (gesture === 'right') { // Swiped right
 *         // Handle forgot
 *       }
 *     }
 *   });
 */
export function attachGestureHandlers(element: HTMLElement, config: GestureConfig = {}) {
	const handler = createGestureHandler(config);

	element.addEventListener('pointerdown', handler.onPointerDown);
	element.addEventListener('pointermove', handler.onPointerMove);
	element.addEventListener('pointerup', handler.onPointerUp);
	element.addEventListener('pointercancel', handler.onPointerUp);

	// Return cleanup function
	return () => {
		element.removeEventListener('pointerdown', handler.onPointerDown);
		element.removeEventListener('pointermove', handler.onPointerMove);
		element.removeEventListener('pointerup', handler.onPointerUp);
		element.removeEventListener('pointercancel', handler.onPointerUp);
	};
}

/**
 * Svelte action for gesture handling
 * Usage in component:
 *   import { gesture } from '$lib/utils/gestures';
 *   <div use:gesture={{ threshold: 50, onDragEnd: handleGesture }}>
 */
export function gesture(element: HTMLElement, config: GestureConfig = {}) {
	const unsubscribe = attachGestureHandlers(element, config);

	return {
		destroy() {
			unsubscribe();
		}
	};
}
