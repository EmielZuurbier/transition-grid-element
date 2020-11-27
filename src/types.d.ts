/**
 * Default parameters of the AnimationGridElement class.
 * These can be used to reset the attribute values to their
 * initial settings.
 */
interface DefaultParameters {
	DURATION: number
	STAGGER: number
	EASING: string
}

/**
 * An abstraction from DOMRect which values that can be modified.
 */
interface GridPosition {
	top: number
	left: number
	width: number
	height: number
}

interface DeltaObject {
	x: number,
	y: number,
	width: number,
	height: number,
	scaleX: number,
	cScaleX: number,
	scaleY: number,
	cScaleY: number,
}