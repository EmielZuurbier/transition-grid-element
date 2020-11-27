/**
 * Checks if the current position is different from
 * the previous position and returns a boolean.
 * 
 * @param 	{GridPosition} previousPosition 
 * @param 	{GridPosition} currentPosition 
 * @returns	{boolean}
 */
const hasChangedPositions = (previousPosition: GridPosition, currentPosition: GridPosition) => !(
	previousPosition.top === currentPosition.top &&
	previousPosition.left === currentPosition.left &&
	previousPosition.width === currentPosition.width &&
	previousPosition.height === currentPosition.height
)

export default hasChangedPositions