/**
 * Dispatches start event that fires before the
 * animations have started.
 */
export const dispatchTransitionGridAnimationStartEvent = (eventTarget: EventTarget): void => {
	const event = new Event('transitiongridanimationstart');
	eventTarget.dispatchEvent(event);
}

/**
 * Dispatches end event that fires after all
 * animations have finished.
 */
export const dispatchTransitionGridAnimationEndEvent = (eventTarget: EventTarget): void => {
	const event = new Event('transitiongridanimationend');
	eventTarget.dispatchEvent(event);
}