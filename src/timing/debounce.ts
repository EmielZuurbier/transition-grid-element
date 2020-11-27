/**
 * Returns a function, that, as long as it continues to be invoked, will not 
 * be triggered. The function will be called after it stops being called for 
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 * 
 * @function	debounce
 * @param   	callback Function to execute.
 * @param   	wait Time to wait before firing in milliseconds.
 * @param   	immediate Fire immediately or not. (optional)
 * @returns		Closure function.
 */
const debounce = (callback: Function, wait: number, immediate = false) => {
	let timeout: number | null;
	return (...args: any[]) => {
		const later = () => {
			timeout = null;
			if (!immediate) callback(...args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = window.setTimeout(later, wait);
		if (callNow) callback(...args);
	};
};

export default debounce