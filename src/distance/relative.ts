/**
 * Gets the top, left, width and height of a single item.
 * 
 * @param	gridBoundingClientRect getBoundingClientRect result of the grid.
 * @param 	itemBoundingClientRect A single grid item's boundingClientRect.
 * @returns	Object with top, left, width and height
 */
const getItemRelativeBoundClientRect = (
	gridBoundingClientRect: DOMRect, 
	itemBoundingClientRect: DOMRect
): GridPosition => {
	const { top, left, width, height } = itemBoundingClientRect;
	return { 
		top: top - gridBoundingClientRect.top, 
		left: left - gridBoundingClientRect.left, 
		width, 
		height 
	};
};

export default getItemRelativeBoundClientRect