const randomToggle = document.querySelector('.js-randomize');
const layoutToggle = document.querySelector('.js-layout');
const gapToggle = document.querySelector('.js-gap');
const addToggle = document.querySelector('.js-add');
const removeToggle = document.querySelector('.js-remove');

const grid = document.querySelector('.grid');

/**
 * Generates a random alphanumeric string based on a given length and returns it.
 * 
 * @function	generateAlphaNumericString
 * @param 		{number} [length=10] 
 * @returns		{string}
 */
const generateAlphaNumericString = (length = 10) => {
	const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const setLength = charset.length;
	let value = '';
	let i = 0;
	for (i; i < length; i++) {
		value += charset.charAt(Math.floor(Math.random() * setLength));
	}
	return value;
};

/**
 * Creates a random image from picsum and places
 * that inside a grid item.
 * 
 * @param 	{HTMLElement} item A grid item.
 * @returns	{Promise<void>}
 */
const createImage = item => new Promise(resolve => {
	const image = document.createElement('img');
	const seed = generateAlphaNumericString(4);
	const source = `https://picsum.photos/seed/${seed}/800/800`;
	image.onload = () => {
		item.firstElementChild.append(image);
		resolve();
	};
	image.src = source;
});

// const images = grid.items.forEach(createImage);

/**
 * Randomizes the layout of the grid by removing
 * and adding modifier classes that set the grid-row
 * and grid-column properties.
 */
const randomizeGrid = () => {
	if (grid.isAnimating) {
		return;
	}
	const { items } = grid;
	for (const item of items) {
		item.style.transition = `background-color ${grid.duration}ms ${grid.easing}`;
	}
	const randomIndexes = new Set(
		[...Array(8).keys()].map(() => 
			Math.floor(Math.random() * items.length)
		)
	);
	for (const item of items) {
		item.classList.remove('large', 'wide', 'huge');
		// if (item.classList.contains('large')) {
		// 	item.classList.remove('large');
		// }
		// if (item.classList.contains('wide')) {
		// 	item.classList.remove('wide');
		// }
		// if (item.classList.contains('huge')) {
		// 	item.classList.remove('huge');
		// }
	}
	for (const index of randomIndexes) {
		const item = items[index];
		const cls = Math.random() > 0.5 ? 'large' : 'wide';
		item.classList.add(cls);
	}
};

const layouts = ['four', 'six', 'eight'];

const changeLayout = () => {
	if (grid.isAnimating) {
		return;
	}
	let index = layouts.findIndex(layout => grid.classList.contains(layout));
	const current = layouts[index];
	grid.classList.remove(current);
	if (index < layouts.length - 1) {
		grid.classList.add(layouts[++index]);
	} else {
		grid.classList.add(layouts[0]);
	}
}

const toggleGap = () => {
	if (grid.isAnimating) {
		return;
	}
	grid.classList.toggle('large-gap');
};

const addRandomItem = async () => {
	if (grid.isAnimating) {
		return;
	}
	const { items } = grid;
	const randomIndex = Math.floor(Math.random() * items.length);
	const cls = Math.random() > 0.5 ? 'large' : 'wide';
	const item = document.createElement('div');
	const inner = document.createElement('div');
	if (Math.random() > 0.5) {
		item.classList.add(cls);
	}
	item.classList.add('item');
	inner.classList.add('inner');
	item.append(inner);
	// await createImage(item);
	grid.insertBefore(item, grid.children[randomIndex]);
}

const removeRandomItem = () => {
	if (grid.isAnimating) {
		return;
	}
	const { items } = grid;
	const randomIndex = Math.floor(Math.random() * items.length);
	const item = grid.children[randomIndex].remove();
}

randomToggle.addEventListener('click', randomizeGrid);
layoutToggle.addEventListener('click', changeLayout);
gapToggle.addEventListener('click', toggleGap);
addToggle.addEventListener('click', addRandomItem);
removeToggle.addEventListener('click', removeRandomItem);

grid.addEventListener('click', event => {
	if (grid.isAnimating) {
		return;
	}
	const item = event.target.closest('.item')
	if (item) {
		item.classList.toggle('huge');
	}
})

grid.addEventListener('animationend', event => {
	console.log(event)
})