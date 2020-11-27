/**
 * Calculates the distances between coordinates and sizes.
 * Returns an object with x, y, width and height properties.
 * 
 * @param 	previousPosition GridPosition object with the previous position.
 * @param 	currentPosition GridPosition object with then new and current position.
 * @returns	Object with x, y, width, height, scaleX, scaleY and reversed scales. 
 */
const delta = (previousPosition: GridPosition, currentPosition: GridPosition): DeltaObject => ({
	x: previousPosition.left - currentPosition.left,
	y: previousPosition.top - currentPosition.top,
	width: currentPosition.width - previousPosition.width,
	height: currentPosition.height - previousPosition.height,
	scaleX: (previousPosition.width / currentPosition.width),
	cScaleX: (currentPosition.width / previousPosition.width),
	scaleY: (previousPosition.height / currentPosition.height),
	cScaleY: (currentPosition.height / previousPosition.height),
});

export default delta