import { debounce } from './timing';
import { getItemRelativeBoundClientRect, delta, hasChangedPositions } from './distance';
import { hasRelevantMutations } from './checks';
import { dispatchTransitionGridAnimationStartEvent, dispatchTransitionGridAnimationEndEvent } from './events';

/**
 * Transition Grid Element.
 * Listens for mutations in the children of the element and
 * in the element itself. It then animates the grid items from
 * their old to their new situtation.
 */
export default class TransitionGridElement extends HTMLElement {

	/**
	 * Default values for the animations.
	 */
	static get defaultValues(): DefaultParameters {
		return {
			DURATION: 250,
			STAGGER: 0,
			EASING: 'cubic-bezier(0.42, 0, 0.12, 0.97)',
		}
	};

	/**
	 * Animation state flag.
	 */
	isAnimating = false;

	/**
	 * Current cached DOMRect of the TransitionGridElement.
	 */
	#boundingClientRect: DOMRect | null = null;

	/**
	 * Map with grid items as keys and DOMRects as values.
	 * Caches each last known position of each element.
	 * @private
	 */
	#positions = new Map();

	/**
	 * Stores the current mutation observer instance.
	 * @private
	 */
	#mutationObserver: MutationObserver | null = null;

	/**
	 * Stores the current intersection observer instance.
	 * @private
	 */
	#intersectionObserver: IntersectionObserver | null = null;

	/**
	 * Flag for checking if the needed event listeners are added
	 * or not.
	 */
	#listeningToEvents = false;

	/**
	 * Loops over each item and stores a new last known position. 
	 * @private
	 */
	#updatePositions = () => {
		this.#boundingClientRect = this.getBoundingClientRect();
		for (const item of this.items) {
			const itemBoundingClientRect = item.getBoundingClientRect();
			this.#positions.set(item, itemBoundingClientRect);
		}
	};

	/**
	 * Throttled caching function that stores the last know DOMRect
	 * after either scrolling or resizing. Has a 100ms delay.
	 * @private
	 */
	#updateBoundingClientRectAndPositions = debounce(() => {
		this.#updatePositions();
	}, 100);

	/**
	 * Setup and main logic of the component.
	 */
	#setupObservers = () => {

		/**
		 * Gets the old position and calculates the position relative to
		 * the new grid size. Then updates each item with the new positions
		 */
		const calculatePositions = (item: HTMLElement) => {

			/**
			 * Get the current position relative to the current grid.
			 */
			const currentBoundingClientRect = item.getBoundingClientRect();
			const currentPosition = getItemRelativeBoundClientRect(
				this.#boundingClientRect,
				currentBoundingClientRect
			);

			/**
			 * Get the previous position relative to the current grid.
			 */
			const previousBoundingClientRect = this.#positions.get(item);
			const previousPosition = getItemRelativeBoundClientRect(
				this.#boundingClientRect, 
				previousBoundingClientRect
			);

			/**
			 * Store the new position.
			 */
			this.#positions.set(item, currentBoundingClientRect);

			return { item, currentPosition, previousPosition }
		};

		/**
		 * Return only items that should be animated.
		 * Checks if the previous and current positions are the same.
		 */
		const filterOnlyItemsWithChanges = ({ 
			currentPosition, 
			previousPosition 
		}: {
			currentPosition: GridPosition, 
			previousPosition: GridPosition 
		}) => hasChangedPositions(currentPosition, previousPosition);

		/**
		 * Animate the items from their old to their new position.
		 */
		const transitionGridItems = ({ 
			item, 
			currentPosition, 
			previousPosition 
		}: {
			item: HTMLElement, 
			currentPosition: GridPosition, 
			previousPosition: GridPosition 
		}, 
			index: number,
			items: any
		): Promise<HTMLElement> => new Promise(resolve => {

			/**
			 * Calculate the differences in the positions.
			 */
			const { 
				x,
				y,
				scaleX,
				scaleY,
			} = delta(previousPosition, currentPosition);
			
			/**
			 * Generate styles for the transition.
			 */
			const transformFrom = `translate3d(${x}px, ${y}px, 0) scale(${scaleX}, ${scaleY})`;
			const transformTo = `translate3d(0, 0, 0) scale(1, 1)`;

			/**
			 * Set a prelimenary position so that the element is already in the 
			 * starting position before it animates to the new position.
			 */
			item.style.transform = transformFrom;

			/**
			 * Set a z-index based on first move, top index. 
			 */
			item.style.zIndex = `${items.length - index}`;

			/**
			 * Set the animation in motion.
			 */
			const animation = item.animate([
				{ transform: transformFrom },
				{ transform: transformTo },
			], {
				duration: this.duration,
				delay: this.stagger * index,
				easing: this.easing,
			});

			/**
			 * TODO: Animate the firstElementChild's aspect ratio from the current size to the new size.
			 */
			// if (width !== 0 || height !== 0) {
			// 	console.log(scaleX, scaleY, width, height);

			// 	const child = item.firstElementChild;
			// 	if (child) {
			// 		const { offsetWidth, offsetHeight } = child as HTMLElement;
			// 		child.animate([
			// 			{ 
			// 				height: `${offsetHeight + height}px`,
			// 				width: `${offsetWidth + width}px`,
			// 				// transform: `scale(${cScaleX}, ${cScaleY})`
			// 			},
			// 			{ 
			// 				height: `${offsetHeight}px`,
			// 				width: `${offsetWidth}px`,
			// 				// transform: `scale(1, 1)`
			// 			},
			// 		], {
			// 			duration: this.duration,
			// 			delay: this.stagger * i,
			// 			easing: this.easing,
			// 		});
			// 	}
			// }

			/**
			 * Remove the style property after the animation is finished.
			 */
			animation.addEventListener('finish', () => {
				requestAnimationFrame(() => {
					item.style.transform = '';
					item.style.transformOrigin = '';
					if (item.getAttribute('style') === '') {
						item.removeAttribute('style');
					}
					resolve(item);
				})
			}, { once: true });
		});

		/**
		 * The callback whenever a mutation occurs.
		 * 
		 * @param 	{MutationRecord[]} mutations 
		 * @returns	{void}
		 */
		const mutationCallback = (mutations: MutationRecord[]) => {
			const shouldAnimate = hasRelevantMutations(mutations);

			/**
			 * Check if the animation should animate based on the
			 * mutated properties or check if the animation is 
			 * already running.
			 */
			if (!shouldAnimate || this.isAnimating) {
				return;
			}

			/**
			 * Dispatches grid animation start event.
			 * Enables users to hook into to the beginning
			 * of the animation.
			 */
			dispatchTransitionGridAnimationStartEvent(this);
			
			/**
			 * Set animation state to true;
			 */
			this.isAnimating = true;

			/**
			 * Update the grid client rect to the current state.
			 */
			this.#boundingClientRect = this.getBoundingClientRect();

			/**
			 * Check for added nodes that need to be animated in.
			 */
			for (const { addedNodes } of mutations) {
				for (const node of addedNodes) {
					const element = node as HTMLElement;

					/**
					 * Calculate the element's position relative to the grid so that
					 * we know it's position when it enters the DOM.
					 */
					const currentBoundingClientRect = element.getBoundingClientRect();
					const currentPosition = getItemRelativeBoundClientRect(
						this.#boundingClientRect,
						currentBoundingClientRect
					);

					/**
					 * Starting position should be positioned from the center so that
					 * the element has a nicer animation when being added to the DOM.
					 */
					const startPosition = {
						left: currentPosition.left,
						top: currentPosition.top,
						width: 0,
						height: 0,
					};

					/**
					 * Animate this element in from the center.
					 */
					element.style.transformOrigin = '50% 50%';

					/**
					 * Set the starting position.
					 */
					this.#positions.set(element, startPosition);
				}
			}

			/**
			 * Animate each item from its old to its new position.
			 */
			const animations = this.items

				/**
				 * Calculate position of each item and store the new position.
				 * Returns the item, the new and the previous positions.
				 */
				.map(calculatePositions)

				/**
				 * Filter out any items that haven't moved or changed.
				 */
				.filter(filterOnlyItemsWithChanges)
			
				/**
				 * Animate the grid items.
				 */
				.map(transitionGridItems);

			/**
			 * Wait for all animations to finish.
			 */
			Promise.all(animations).then(items => {
				requestAnimationFrame(() => {
					this.#updatePositions();
					items.forEach(item => {
						item.style.zIndex = '';
					});
				});
				dispatchTransitionGridAnimationEndEvent(this);
				this.isAnimating = false;
			})
		}

		/**
		 * Adds event listeners whenever the elements is in view.
		 * This prevents the scroll and resize listeners from needlessly
		 * firing when the element is out of view.
		 */
		const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
			for (const { isIntersecting } of entries) {
				if (!this.#listeningToEvents && isIntersecting) {
					this.#addEventListeners();
				} else if (this.#listeningToEvents && !isIntersecting) {
					this.#removeEventListeners();
				}
			}
		}

		/**
		 * Create a new MutationObserver that animates the items
		 * when it detects a change in the classes or children.
		 */
		this.#mutationObserver = new MutationObserver(mutationCallback);
		this.#mutationObserver.observe(this, {
			childList: true,
			attributes: true,
			subtree: true,
			attributeFilter: ['class'],
		});

		/**
		 * Create a new IntersectionObserver instance to add or remove
		 * event listeners that are attached to the window object to 
		 * enhance performance.
		 */
		this.#intersectionObserver = new IntersectionObserver(intersectionCallback, {
			root: null,
			rootMargin: '-50px',
			threshold: [0]
		});
		this.#intersectionObserver.observe(this);
	}

	/**
	 * Adds the scroll and resize event listeners.
	 * @private
	 */
	#addEventListeners = () => {
		window.addEventListener('scroll', this.#updateBoundingClientRectAndPositions);
		window.addEventListener('resize', this.#updateBoundingClientRectAndPositions);
		this.#listeningToEvents = true;
	}

	/**
	 * Removes the scroll and resize event listeners.
	 * @private
	 */
	#removeEventListeners = () => {
		window.removeEventListener('scroll', this.#updateBoundingClientRectAndPositions);
		window.removeEventListener('resize', this.#updateBoundingClientRectAndPositions);
		this.#listeningToEvents = false;
	}

	/**
	 * Gets the children of this element in an array.
	 * @property
	 */
	get items() {
		return Array.from(this.children);
	}

	/**
	 * Gets and sets the duration attribute.
	 * @property
	 */
	get duration() {
		return Number(this.getAttribute('duration'));
	}

	set duration(value) {
		const number = Number(value);
		if (!Number.isNaN(number)) {
			this.setAttribute('duration', number.toString());
		}
	}

	/**
	 * Gets and sets the stagger attribute.
	 * @property
	 */
	get stagger() {
		return Number(this.getAttribute('stagger'));
	}

	set stagger(value) {
		const number = Number(value);
		if (!Number.isNaN(number)) {
			this.setAttribute('stagger', number.toString());
		}
	}

	/**
	 * Get and set the easing attribute value.
	 * @property
	 */
	get easing() {
		return this.getAttribute('easing');
	}

	set easing(value) {
		if ('string' === typeof value) {
			this.setAttribute('easing', value);
		} else {
			this.setAttribute('easing', '');
		}
	}

	/**
	 * Fires when the element has been connected.
	 * 
	 * @method	connectedCallback
	 * @returns	{void}
	 */
	connectedCallback() {
		if (!('animate' in this) || !('MutationObserver' in window)) {
			return;
		}

		/**
		 * Get the default values of this component.
		 */
		const {
			DURATION,
			STAGGER,
			EASING
		} = TransitionGridElement.defaultValues;

		/**
		 * Set default value for duration if attribute
		 * has not yet been set.
		 */
		if (this.getAttribute('duration') === null) {
			this.duration = DURATION;
		}

		/**
		 * Set default value for stagger if attribute
		 * has not yet been set.
		 */
		if (this.getAttribute('stagger') === null) {
			this.stagger = STAGGER;
		}

		/**
		 * Set default value for easing if attribute
		 * has not yet been set.
		 */
		if (this.getAttribute('easing') === null) {
			this.easing = EASING;
		}

		/**
		 * Calculate positions and setup the observers.
		 */
		this.#updatePositions();
		this.#setupObservers();
	}

	/**
	 * Fires when the element has been disconnected.
	 * 
	 * @method	disconnectedCallback
	 * @returns	{void}
	 */
	disconnectedCallback() {
		this.#removeEventListeners();
	}

}