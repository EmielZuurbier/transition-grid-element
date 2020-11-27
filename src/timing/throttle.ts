/**
 * Throttle function to make sure that the resize and
 * scroll event handlers don't call too many times.
 * 
 * @function	throttle
 * @param   	callback Function to execute.
 * @param   	limit Time to wait before firing in milliseconds.
 * @returns		Closure function.
 */
const throttle = (callback: Function, limit: number) => {
	let inThrottle: boolean;
	return (...args: any[]) => {
		if (!inThrottle) {
			callback(...args);
			inThrottle = true;
			setTimeout(() => inThrottle = false, limit);
		}
	}
}

export default throttle