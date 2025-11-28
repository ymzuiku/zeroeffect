type Attributes = Record<string, unknown>;
type Content =
	| string
	| number
	| HTMLElement
	| (() => string | number | HTMLElement | null | undefined | false);
type Dependencies = unknown[];

// Tag function type - supports variable arguments
type TagFunction = (
	...args: Array<Dependencies | Attributes | Content | Content[]>
) => HTMLElement;

// Common HTML tags for better type hints
interface HTagElements {
	// Structural elements
	div: TagFunction;
	p: TagFunction;
	span: TagFunction;
	section: TagFunction;
	article: TagFunction;
	header: TagFunction;
	footer: TagFunction;
	nav: TagFunction;
	aside: TagFunction;
	main: TagFunction;

	// Text elements
	h1: TagFunction;
	h2: TagFunction;
	h3: TagFunction;
	h4: TagFunction;
	h5: TagFunction;
	h6: TagFunction;
	strong: TagFunction;
	em: TagFunction;
	b: TagFunction;
	i: TagFunction;
	u: TagFunction;
	code: TagFunction;
	pre: TagFunction;
	blockquote: TagFunction;

	// List elements
	ul: TagFunction;
	ol: TagFunction;
	li: TagFunction;
	dl: TagFunction;
	dt: TagFunction;
	dd: TagFunction;

	// Form elements
	form: TagFunction;
	input: TagFunction;
	button: TagFunction;
	textarea: TagFunction;
	select: TagFunction;
	option: TagFunction;
	label: TagFunction;
	fieldset: TagFunction;
	legend: TagFunction;

	// Table elements
	table: TagFunction;
	thead: TagFunction;
	tbody: TagFunction;
	tfoot: TagFunction;
	tr: TagFunction;
	th: TagFunction;
	td: TagFunction;
	caption: TagFunction;

	// Media elements
	img: TagFunction;
	video: TagFunction;
	audio: TagFunction;
	canvas: TagFunction;
	svg: TagFunction;

	// Link elements
	a: TagFunction;
	link: TagFunction;

	// Other common elements
	br: TagFunction;
	hr: TagFunction;
	meta: TagFunction;
	title: TagFunction;
	script: TagFunction;
	style: TagFunction;
	iframe: TagFunction;
	embed: TagFunction;
	object: TagFunction;

	// Support dynamic access with index signature for custom tags
	// Note: TypeScript's index signature allows undefined, but our Proxy always returns TagFunction
	[key: string]: TagFunction | undefined;
}

// Check if a value should be rendered (falsy values that don't render)
function shouldRender(value: unknown): boolean {
	if (
		value === false ||
		value === null ||
		value === undefined ||
		Number.isNaN(value) ||
		value === ""
	) {
		return false;
	}
	return true;
}

// Render content to DOM nodes
function renderContent(content: Content): Node[] {
	if (typeof content === "function") {
		const result = content();
		if (!shouldRender(result)) {
			return [];
		}
		if (result instanceof HTMLElement) {
			// Check if this is a list element (index 0)
			const listIndex = result.getAttribute("data-ns-list");
			if (listIndex === "0") {
				insertListRemainingElements(result);
			}
			return [result];
		}
		return [document.createTextNode(String(result))];
	}
	if (!shouldRender(content)) {
		return [];
	}
	if (content instanceof HTMLElement) {
		// Check if this is a list element (index 0)
		const listIndex = content.getAttribute("data-ns-list");
		if (listIndex === "0") {
			insertListRemainingElements(content);
		}
		return [content];
	}
	return [document.createTextNode(String(content))];
}

// Insert remaining list elements after the first element
function insertListRemainingElements(firstElement: HTMLElement): void {
	// Find the reactive info using the WeakMap
	const info = listFirstElementMap.get(firstElement);
	if (!info?.isList || !info.listElements) {
		return;
	}

	const listElements = info.listElements;
	const parent = firstElement.parentNode;

	// If first element is not in DOM yet, schedule insertion for next frame
	if (!parent) {
		// Prevent duplicate scheduling
		if (!scheduledInsertions.has(firstElement)) {
			scheduledInsertions.add(firstElement);
			requestAnimationFrame(() => {
				scheduledInsertions.delete(firstElement);
				insertListRemainingElements(firstElement);
			});
		}
		return;
	}

	// Insert elements in order
	let lastInserted = firstElement;
	for (let i = 1; i < listElements.size; i++) {
		const element = listElements.get(i);
		if (element && !element.parentNode) {
			// Insert after lastInserted
			parent.insertBefore(element, lastInserted.nextSibling);
			lastInserted = element;
		}
	}
}

// Apply style object directly to element.style
function applyStyleObject(
	element: HTMLElement,
	style: Record<string, string | number>,
): void {
	for (const [key, value] of Object.entries(style)) {
		// Directly set style property using JavaScript style API
		// Use index signature to access style properties dynamically
		(element.style as unknown as Record<string, string>)[key] = String(value);
	}
}

// Apply reactive attributes to an element (called on initial render and updates)
function applyAttributes(
	element: HTMLElement,
	attrs: Attributes,
	skipEvents = false,
): void {
	for (const [key, value] of Object.entries(attrs)) {
		if (key.startsWith("on") && typeof value === "function") {
			// Event handlers - skip if skipEvents is true (already added)
			if (!skipEvents) {
				const eventName = key.slice(2).toLowerCase();
				element.addEventListener(eventName, value as EventListener);
			}
		} else if (typeof value === "function") {
			// Reactive attribute - execute function and set result
			const result = value();
			if (key === "class" && typeof result === "string") {
				element.className = result;
			} else if (key === "style") {
				if (typeof result === "string") {
					element.setAttribute("style", result);
				} else if (
					result &&
					typeof result === "object" &&
					!Array.isArray(result) &&
					!(result instanceof HTMLElement)
				) {
					// Style object - apply directly to element.style
					applyStyleObject(element, result as Record<string, string | number>);
				}
			} else if (
				key === "value" &&
				(element instanceof HTMLInputElement ||
					element instanceof HTMLTextAreaElement ||
					element instanceof HTMLSelectElement)
			) {
				// For input/textarea/select elements, set value property directly
				element.value = String(result ?? "");
			} else if (key === "checked" && element instanceof HTMLInputElement) {
				// For checkbox/radio inputs, set checked property
				element.checked = Boolean(result);
			} else {
				element.setAttribute(key, String(result ?? ""));
			}
		} else {
			// Static attribute
			if (key === "class" && typeof value === "string") {
				element.className = value;
			} else if (key === "style") {
				if (typeof value === "string") {
					element.setAttribute("style", value);
				} else if (
					value &&
					typeof value === "object" &&
					!Array.isArray(value) &&
					!(value instanceof HTMLElement)
				) {
					// Style object - apply directly to element.style
					applyStyleObject(element, value as Record<string, string | number>);
				}
			} else if (
				key === "value" &&
				(element instanceof HTMLInputElement ||
					element instanceof HTMLTextAreaElement ||
					element instanceof HTMLSelectElement)
			) {
				// For input/textarea/select elements, set value property directly
				element.value = String(value ?? "");
			} else if (key === "checked" && element instanceof HTMLInputElement) {
				// For checkbox/radio inputs, set checked property
				element.checked = Boolean(value);
			} else {
				element.setAttribute(key, String(value ?? ""));
			}
		}
	}
}

// Create a reactive element
function createReactiveElement(
	tagName: string,
	deps: Dependencies | null,
	attrs: Attributes | null,
	content: Content | Content[] | null,
): HTMLElement {
	const element = document.createElement(tagName);
	const container = document.createDocumentFragment();

	// Track this element's dependencies
	if (deps) {
		for (const dep of deps) {
			// Convert to object for Map key (objects are tracked by reference)
			const depKey = dep as object;
			const existing = reactiveElements.get(depKey);
			if (existing) {
				existing.add({
					element,
					attrs: attrs || {},
					content: content || null,
					tagName,
				});
			} else {
				reactiveElements.set(
					depKey,
					new Set([
						{
							element,
							attrs: attrs || {},
							content: content || null,
							tagName,
						},
					]),
				);
			}
		}
	}

	// Initial render - apply all attributes including event handlers
	if (attrs) {
		applyAttributes(element, attrs);
	}

	if (content) {
		const contents = Array.isArray(content) ? content : [content];
		// Track list first elements that need insertion
		const listFirstElements: HTMLElement[] = [];

		for (const item of contents) {
			const nodes = renderContent(item);
			for (const node of nodes) {
				container.appendChild(node);
				// Check if this is a list first element
				if (
					node instanceof HTMLElement &&
					node.getAttribute("data-ns-list") === "0"
				) {
					listFirstElements.push(node);
				}
			}
		}
		element.appendChild(container);

		// Insert remaining elements for all list first elements
		for (const firstElement of listFirstElements) {
			insertListRemainingElements(firstElement);
		}
	}

	return element;
}

// Reactive element info
interface ReactiveElementInfo {
	element: HTMLElement;
	attrs: Attributes;
	content: Content | Content[] | null;
	tagName: string;
	isConditional?: boolean;
	condition?: () => unknown; // Return value doesn't need to be boolean, just truthy/falsy
	renderFn?: () => HTMLElement;
	elseRenderFn?: () => HTMLElement; // Optional else render function
	conditionalPlaceholder?: HTMLElement; // Current placeholder element for conditional rendering
	isList?: boolean;
	listData?: unknown[]; // The array data (first element of deps)
	listDeps?: unknown[]; // Other dependencies besides the list
	listRenderFn?: (value: unknown, index: number) => HTMLElement; // Render function for list items
	listElements?: Map<number, HTMLElement>; // Map of index to rendered element
	listPlaceholder?: HTMLElement; // Current placeholder element for list rendering (first element or span)
}

// Map of dependencies to reactive elements
// Using WeakMap with object identity for tracking
// WeakMap automatically cleans up when state objects are garbage collected
const reactiveElements = new WeakMap<object, Set<ReactiveElementInfo>>();

// Map of list first elements to their reactive info (for inserting remaining elements)
const listFirstElementMap = new WeakMap<HTMLElement, ReactiveElementInfo>();

// Set to track elements that are scheduled for insertion (prevent duplicate requestAnimationFrame)
const scheduledInsertions = new WeakSet<HTMLElement>();

// Update callbacks
const updateCallbacks: Set<() => void> = new Set();

// Flag to prevent infinite recursion in onUpdate callbacks
let isInCallback = false;

// Collection of states that need to be updated
const pendingUpdates = new Set<unknown>();

// Flag to track if we've scheduled a batch update
let updateScheduled = false;

// Process updates for a state object
function processUpdate(state: unknown): void {
	const elements = reactiveElements.get(state as object);
	if (!elements) {
		return;
	}

	// Process updates for valid elements and clean up stale ones in one pass
	const staleElements: ReactiveElementInfo[] = [];
	for (const info of elements) {
		// Check if element is still connected to DOM
		if (!info.element.isConnected) {
			staleElements.push(info);
			continue;
		}
		// Handle conditional rendering
		if (info.isConditional && info.condition && info.renderFn) {
			updateConditional(info, info.condition, info.renderFn, info.elseRenderFn);
			continue;
		}

		// Handle list rendering
		if (
			info.isList &&
			info.listData &&
			info.listRenderFn &&
			info.listElements
		) {
			// Update list data from the state that triggered the update
			// If the state is the list itself, use it; otherwise keep current list
			const newListData = Array.isArray(state)
				? (state as unknown[])
				: info.listData;
			updateList(info, newListData, info.listRenderFn, info.listElements);
			// Update stored list data
			info.listData = newListData;
			continue;
		}

		// Clear existing content
		info.element.textContent = "";

		// Re-apply attributes (skip event handlers as they're already added)
		applyAttributes(info.element, info.attrs, true);

		// Re-render content
		if (info.content) {
			const container = document.createDocumentFragment();
			const contents = Array.isArray(info.content)
				? info.content
				: [info.content];
			for (const item of contents) {
				const nodes = renderContent(item);
				for (const node of nodes) {
					container.appendChild(node);
				}
			}
			info.element.appendChild(container);
		}
	}

	// Clean up stale elements after processing
	for (const stale of staleElements) {
		elements.delete(stale);
	}
}

// Batch process all pending updates
function flushUpdates(): void {
	if (pendingUpdates.size === 0) {
		updateScheduled = false;
		return;
	}

	// Collect all states to update
	const statesToUpdate = Array.from(pendingUpdates);
	pendingUpdates.clear();
	updateScheduled = false;

	// Process all updates
	for (const state of statesToUpdate) {
		processUpdate(state);
	}

	// Trigger update callbacks
	isInCallback = true;
	try {
		for (const callback of updateCallbacks) {
			callback();
		}
	} finally {
		isInCallback = false;
	}

	// If new updates were queued during callbacks, schedule another flush
	if (pendingUpdates.size > 0) {
		scheduleUpdate();
	}
}

// Schedule batch update for next frame
function scheduleUpdate(): void {
	if (updateScheduled) {
		return;
	}
	updateScheduled = true;

	// Use requestAnimationFrame for better performance (runs before next repaint)
	if (typeof requestAnimationFrame !== "undefined") {
		requestAnimationFrame(flushUpdates);
	} else {
		// Fallback for environments without requestAnimationFrame
		setTimeout(flushUpdates, 0);
	}
}

// Update function - collects states to update and schedules batch update for next frame
function update(state: unknown): void {
	// Add state to pending updates
	pendingUpdates.add(state);

	// If we're in a callback, don't schedule update yet
	// The update will be processed after callbacks finish (in flushUpdates or next scheduleUpdate)
	if (isInCallback) {
		return;
	}

	// Schedule batch update for next frame
	// This batches multiple update() calls in the same frame
	scheduleUpdate();
}

// On update callback
function onUpdate(callback: () => void): void {
	updateCallbacks.add(callback);
}

// Create a tag function for a given tag name
function createTagFunction(tagName: string): TagFunction {
	return (...args) => {
		// Determine which parameters were passed
		let deps: Dependencies | null = null;
		let attrs: Attributes | null = null;
		let finalContent: Content | Content[] | null = null;

		if (args.length === 0) {
			// No arguments
			return createReactiveElement(tagName, null, null, null);
		}

		const firstArg = args[0];
		const secondArg = args[1];

		if (Array.isArray(firstArg) && firstArg.length > 0) {
			// Check if first array is dependencies (contains objects) or content (contains HTMLElements/functions/strings)
			const isDependencies = firstArg.every(
				(item) =>
					typeof item === "object" &&
					item !== null &&
					!(item instanceof HTMLElement) &&
					typeof item !== "function",
			);

			if (isDependencies) {
				// First param is dependencies array
				deps = firstArg as Dependencies;
				if (
					secondArg &&
					typeof secondArg === "object" &&
					!Array.isArray(secondArg) &&
					!(secondArg instanceof HTMLElement) &&
					typeof secondArg !== "function"
				) {
					// Second param is attributes
					attrs = secondArg as Attributes;
					// Remaining args are content
					if (args.length > 2) {
						finalContent = args.slice(2) as Content[];
					} else {
						finalContent = null;
					}
				} else {
					// Second param is content, remaining args are also content
					if (args.length > 1) {
						finalContent = args.slice(1) as Content[];
					} else {
						finalContent = null;
					}
				}
			} else {
				// First array is content (array of children)
				finalContent = firstArg as Content[];
			}
		} else if (
			firstArg &&
			typeof firstArg === "object" &&
			!Array.isArray(firstArg) &&
			!(firstArg instanceof HTMLElement) &&
			typeof firstArg !== "function"
		) {
			// First param is attributes
			attrs = firstArg as Attributes;
			// Remaining args are content
			if (args.length > 1) {
				finalContent = args.slice(1) as Content[];
			} else {
				finalContent = null;
			}
		} else {
			// First param is content, all args are content (multiple children)
			if (args.length === 1) {
				finalContent = firstArg as Content | Content[] | null;
			} else {
				finalContent = args as Content[];
			}
		}

		return createReactiveElement(tagName, deps, attrs, finalContent);
	};
}

// CSS function - creates a style tag and inserts it into head
function css(styles: string): void {
	const styleElement = document.createElement("style");
	styleElement.textContent = styles;
	document.head.appendChild(styleElement);
}

// innerHTML function - creates a div element and sets its innerHTML
function innerHTML(html: string): HTMLElement {
	const div = document.createElement("div");
	div.innerHTML = html;
	return div;
}

// If function - conditional rendering based on a condition
// First parameter must be an array (dependencies)
// Second parameter must be a function (condition) - returns truthy/falsy value
// Third parameter must be a function (render when condition is truthy)
// Fourth parameter is optional function (render when condition is falsy)
function ifConditional(
	deps: Dependencies,
	condition: () => unknown,
	renderFn: () => HTMLElement,
	elseRenderFn?: () => HTMLElement,
): HTMLElement {
	const initialElement = document.createElement("span");
	initialElement.style.display = "none";

	// Track this conditional element's dependencies
	const reactiveInfo: ReactiveElementInfo = {
		element: initialElement,
		attrs: {},
		content: null,
		tagName: initialElement.tagName.toLowerCase(),
		isConditional: true,
		condition,
		renderFn,
		elseRenderFn,
		conditionalPlaceholder: initialElement,
	};

	for (const dep of deps) {
		const depKey = dep as object;
		const existing = reactiveElements.get(depKey);
		if (existing) {
			existing.add(reactiveInfo);
		} else {
			reactiveElements.set(depKey, new Set([reactiveInfo]));
		}
	}

	return initialElement;
}

// Update conditional rendering
function updateConditional(
	reactiveInfo: ReactiveElementInfo,
	condition: () => unknown,
	renderFn: () => HTMLElement,
	elseRenderFn?: () => HTMLElement,
): void {
	const conditionResult = condition();
	const shouldRender = Boolean(conditionResult);

	const currentPlaceholder = reactiveInfo.conditionalPlaceholder;
	if (!currentPlaceholder) {
		// Initialize placeholder if not set
		const initialPlaceholder = document.createElement("div");
		reactiveInfo.conditionalPlaceholder = initialPlaceholder;
		reactiveInfo.element = initialPlaceholder;
		return;
	}

	const parent = currentPlaceholder.parentNode;

	if (!parent) {
		// Placeholder not in DOM yet, just update the reference
		if (shouldRender) {
			const newElement = renderFn();
			reactiveInfo.conditionalPlaceholder = newElement;
			reactiveInfo.element = newElement;
		} else if (elseRenderFn) {
			const newElement = elseRenderFn();
			reactiveInfo.conditionalPlaceholder = newElement;
			reactiveInfo.element = newElement;
		} else {
			// Create span placeholder
			const spanPlaceholder = document.createElement("span");
			spanPlaceholder.style.display = "none";
			reactiveInfo.conditionalPlaceholder = spanPlaceholder;
			reactiveInfo.element = spanPlaceholder;
		}
		return;
	}

	if (shouldRender) {
		// Condition is true - replace placeholder with actual element
		const newElement = renderFn();
		parent.replaceChild(newElement, currentPlaceholder);
		// Update references - new element becomes the placeholder
		reactiveInfo.conditionalPlaceholder = newElement;
		reactiveInfo.element = newElement;
	} else if (elseRenderFn) {
		// Condition is false but has else function - replace with else element
		const newElement = elseRenderFn();
		parent.replaceChild(newElement, currentPlaceholder);
		reactiveInfo.conditionalPlaceholder = newElement;
		reactiveInfo.element = newElement;
	} else {
		// Condition is false and no else function - replace with span placeholder
		const spanPlaceholder = document.createElement("span");
		spanPlaceholder.style.display = "none";
		parent.replaceChild(spanPlaceholder, currentPlaceholder);
		reactiveInfo.conditionalPlaceholder = spanPlaceholder;
		reactiveInfo.element = spanPlaceholder;
	}
}

// List function - renders a list of items with efficient diffing
// First parameter must be an array where first element is the list data (array), others are dependencies
// Second parameter is a render function that receives (value, index)
// Type inference: T is inferred from the first element of deps array
function list<T>(
	deps: [T[], ...unknown[]],
	renderFn: (value: T, index: number) => HTMLElement,
): HTMLElement;
function list(
	deps: Dependencies,
	renderFn: (value: unknown, index: number) => HTMLElement,
): HTMLElement;
function list<T = unknown>(
	deps: [T[], ...unknown[]] | Dependencies,
	renderFn: (value: T, index: number) => HTMLElement,
): HTMLElement {
	// First element must be the list array
	if (deps.length === 0 || !Array.isArray(deps[0])) {
		throw new Error("h.list: First dependency must be an array");
	}

	const listData = deps[0] as unknown[];
	const otherDeps = deps.slice(1);
	// Cast renderFn to match internal type signature
	const renderFnInternal = renderFn as (
		value: unknown,
		index: number,
	) => HTMLElement;

	// Store list elements for efficient updates
	const listElements = new Map<number, HTMLElement>();

	// Create initial placeholder - will be replaced by actual elements
	let initialPlaceholder: HTMLElement;
	if (listData.length === 0) {
		// Empty list - create hidden span
		initialPlaceholder = document.createElement("span");
		initialPlaceholder.style.display = "none";
		initialPlaceholder.setAttribute("data-ns-list", "0");
	} else {
		// Non-empty list - use first element as placeholder
		initialPlaceholder = renderFnInternal(listData[0], 0);
		initialPlaceholder.setAttribute("data-ns-list", "0");
		// Store first element
		listElements.set(0, initialPlaceholder);
		// Render remaining elements and store them
		// They will be inserted when the first element is processed by renderContent
		for (let i = 1; i < listData.length; i++) {
			const element = renderFnInternal(listData[i], i);
			listElements.set(i, element);
		}
	}

	// Track dependencies (both list and other deps)
	const allDeps = [listData, ...otherDeps];
	const reactiveInfo: ReactiveElementInfo = {
		element: initialPlaceholder,
		attrs: {},
		content: null,
		tagName: initialPlaceholder.tagName.toLowerCase(),
		isList: true,
		listData,
		listDeps: otherDeps,
		listRenderFn: renderFnInternal,
		listElements,
		listPlaceholder: initialPlaceholder,
	};

	// Store mapping from first element to reactive info
	if (listData.length > 0) {
		listFirstElementMap.set(initialPlaceholder, reactiveInfo);
	}

	for (const dep of allDeps) {
		const depKey = dep as object;
		const existing = reactiveElements.get(depKey);
		if (existing) {
			existing.add(reactiveInfo);
		} else {
			reactiveElements.set(depKey, new Set([reactiveInfo]));
		}
	}

	return initialPlaceholder;
}

// Update list rendering - only manages length changes for best performance
// When length changes, re-sync the entire list to ensure correctness
function updateList(
	reactiveInfo: ReactiveElementInfo,
	newListData: unknown[],
	renderFn: (value: unknown, index: number) => HTMLElement,
	listElements: Map<number, HTMLElement>,
): void {
	const currentPlaceholder = reactiveInfo.listPlaceholder;
	if (!currentPlaceholder) {
		// Initialize if not set
		if (newListData.length === 0) {
			const spanPlaceholder = document.createElement("span");
			spanPlaceholder.style.display = "none";
			spanPlaceholder.setAttribute("data-ns-list", "0");
			reactiveInfo.listPlaceholder = spanPlaceholder;
			reactiveInfo.element = spanPlaceholder;
		} else {
			const firstElement = renderFn(newListData[0], 0);
			firstElement.setAttribute("data-ns-list", "0");
			listElements.set(0, firstElement);
			// Render remaining elements
			let lastInserted = firstElement;
			for (let i = 1; i < newListData.length; i++) {
				const element = renderFn(newListData[i], i);
				listElements.set(i, element);
				if (firstElement.parentNode) {
					firstElement.parentNode.insertBefore(
						element,
						lastInserted.nextSibling,
					);
					lastInserted = element;
				}
			}
			reactiveInfo.listPlaceholder = firstElement;
			reactiveInfo.element = firstElement;
		}
		return;
	}

	const currentLength = listElements.size;
	const newLength = newListData.length;

	// Only update if length changed
	if (newLength !== currentLength) {
		const parent = currentPlaceholder.parentNode;

		if (newLength === 0) {
			// List became empty - replace with span placeholder
			const spanPlaceholder = document.createElement("span");
			spanPlaceholder.style.display = "none";
			spanPlaceholder.setAttribute("data-ns-list", "0");

			if (parent) {
				// First, collect other list elements to remove (excluding currentPlaceholder)
				const elementsToRemove: HTMLElement[] = [];

				// Remove all elements that are in the listElements map (except currentPlaceholder)
				for (let i = 1; i < currentLength; i++) {
					const listElement = listElements.get(i);
					if (listElement && listElement.parentNode === parent) {
						elementsToRemove.push(listElement);
					}
				}

				// Remove other list elements first
				for (const elem of elementsToRemove) {
					if (elem.parentNode === parent) {
						parent.removeChild(elem);
					}
				}

				// Then replace currentPlaceholder with span placeholder
				// Check if currentPlaceholder is still in DOM before replacing
				if (currentPlaceholder.parentNode === parent) {
					parent.replaceChild(spanPlaceholder, currentPlaceholder);
				} else {
					// If currentPlaceholder was already removed, just append the span
					parent.appendChild(spanPlaceholder);
				}
			}

			listElements.clear();
			reactiveInfo.listPlaceholder = spanPlaceholder;
			reactiveInfo.element = spanPlaceholder;
		} else if (currentLength === 0) {
			// List was empty, now has items - replace span with first element
			const firstElement = renderFn(newListData[0], 0);
			firstElement.setAttribute("data-ns-list", "0");
			listElements.set(0, firstElement);

			if (parent) {
				parent.replaceChild(firstElement, currentPlaceholder);
				// Insert remaining elements after first element
				let lastInserted = firstElement;
				for (let i = 1; i < newLength; i++) {
					const element = renderFn(newListData[i], i);
					listElements.set(i, element);
					parent.insertBefore(element, lastInserted.nextSibling);
					lastInserted = element;
				}
			} else {
				// Not in DOM yet, just store references
				for (let i = 1; i < newLength; i++) {
					const element = renderFn(newListData[i], i);
					listElements.set(i, element);
				}
			}

			reactiveInfo.listPlaceholder = firstElement;
			reactiveInfo.element = firstElement;
		} else {
			// List length changed (non-zero to non-zero) - re-render all items
			// Remove only existing list elements (those in listElements map)
			if (parent) {
				const elementsToRemove: HTMLElement[] = [];

				// Collect all list elements that need to be removed
				for (let i = 0; i < currentLength; i++) {
					const listElement = listElements.get(i);
					if (listElement && listElement.parentNode === parent) {
						elementsToRemove.push(listElement);
					}
				}

				// Remove all collected elements
				for (const elem of elementsToRemove) {
					if (elem.parentNode === parent) {
						parent.removeChild(elem);
					}
				}
			}

			listElements.clear();

			// Re-render all items
			const firstElement = renderFn(newListData[0], 0);
			firstElement.setAttribute("data-ns-list", "0");
			listElements.set(0, firstElement);

			if (parent) {
				parent.appendChild(firstElement);
			}

			// Insert remaining elements in order
			let lastInserted = firstElement;
			for (let i = 1; i < newLength; i++) {
				const element = renderFn(newListData[i], i);
				listElements.set(i, element);
				if (parent) {
					parent.insertBefore(element, lastInserted.nextSibling);
					lastInserted = element;
				}
			}

			reactiveInfo.listPlaceholder = firstElement;
			reactiveInfo.element = firstElement;
		}
	}
	// If lengths are equal, no changes needed - individual items will update via their own dependencies
}

// Element function - bind reactive properties and dependencies to an existing element
function element(existingElement: HTMLElement): TagFunction {
	return (
		...args: Array<Dependencies | Attributes | Content | Content[]>
	): HTMLElement => {
		// Parse arguments (same as createTagFunction)
		let deps: Dependencies | null = null;
		let attrs: Attributes | null = null;
		let content: Content | Content[] | null = null;

		for (const arg of args) {
			if (Array.isArray(arg) && arg.length > 0) {
				// Check if it's a dependencies array (first element is an object/array)
				const firstItem = arg[0];
				if (
					typeof firstItem === "object" &&
					firstItem !== null &&
					!(firstItem instanceof HTMLElement)
				) {
					deps = arg as Dependencies;
					continue;
				}
			}
			if (
				typeof arg === "object" &&
				arg !== null &&
				!(arg instanceof HTMLElement) &&
				!Array.isArray(arg)
			) {
				attrs = arg as Attributes;
				continue;
			}
			if (content === null) {
				content = arg as Content | Content[] | null;
			} else if (Array.isArray(content)) {
				content.push(arg as Content);
			} else {
				content = [content, arg as Content];
			}
		}

		// Track this element's dependencies (same as createReactiveElement)
		if (deps) {
			for (const dep of deps) {
				const depKey = dep as object;
				const existing = reactiveElements.get(depKey);
				if (existing) {
					existing.add({
						element: existingElement,
						attrs: attrs || {},
						content: content || null,
						tagName: existingElement.tagName.toLowerCase(),
					});
				} else {
					reactiveElements.set(
						depKey,
						new Set([
							{
								element: existingElement,
								attrs: attrs || {},
								content: content || null,
								tagName: existingElement.tagName.toLowerCase(),
							},
						]),
					);
				}
			}
		}

		// Apply attributes (including event handlers)
		if (attrs) {
			applyAttributes(existingElement, attrs);
		}

		// Apply content (replace existing content)
		if (content !== null) {
			// Clear existing content
			existingElement.textContent = "";
			const container = document.createDocumentFragment();
			const contents = Array.isArray(content) ? content : [content];
			for (const item of contents) {
				const nodes = renderContent(item);
				for (const node of nodes) {
					container.appendChild(node);
				}
			}
			existingElement.appendChild(container);
		}

		return existingElement;
	};
}

// Whitelist of methods that should NOT be tag functions
const WHITELIST = new Set([
	"update",
	"onUpdate",
	"watch",
	"list",
	"if",
	"css",
	"innerHTML",
	"element",
]);

// Proxy handler for dynamic tag access
const handler: ProxyHandler<HObject> = {
	get(
		target,
		prop: string,
	):
		| TagFunction
		| typeof update
		| typeof onUpdate
		| typeof css
		| typeof innerHTML
		| typeof ifConditional
		| typeof list
		| typeof element {
		if (WHITELIST.has(prop)) {
			if (prop === "update") {
				return update;
			}
			if (prop === "onUpdate") {
				return onUpdate;
			}
			if (prop === "css") {
				return css;
			}
			if (prop === "innerHTML") {
				return innerHTML;
			}
			if (prop === "if") {
				return ifConditional;
			}
			if (prop === "list") {
				return list;
			}
			if (prop === "element") {
				return element;
			}
			// For watch - return no-op functions for now
			return (() => {}) as TagFunction;
		}
		// Create tag function on demand
		if (!target[prop]) {
			target[prop] = createTagFunction(prop);
		}
		// Always return TagFunction for tag names
		return target[prop] as TagFunction;
	},
};

// H object interface with all methods and tag functions
// Use intersection type to allow special methods to override index signature
// Record<string, TagFunction> ensures all string keys return TagFunction
type HObject = {
	// Special methods (these have specific types)
	update: typeof update;
	onUpdate: typeof onUpdate;
	css: typeof css;
	innerHTML: typeof innerHTML;
	if: typeof ifConditional;
	list: typeof list;
	element: typeof element;
} & HTagElements & {
		// Index signature for dynamic tags - always returns TagFunction via Proxy
		[key: string]:
			| TagFunction
			| typeof update
			| typeof onUpdate
			| typeof css
			| typeof innerHTML
			| typeof ifConditional
			| typeof list
			| typeof element;
	};

// Create the h object with proxy
const _h = new Proxy<HObject>({} as HObject, handler);

// Export type that handles noUncheckedIndexedAccess
// We need to explicitly define the type to override the index signature behavior
// The key is to use a type that doesn't have the noUncheckedIndexedAccess behavior
type HExport = {
	// Special methods
	update: typeof update;
	onUpdate: typeof onUpdate;
	css: typeof css;
	innerHTML: typeof innerHTML;
	if: typeof ifConditional;
	list: typeof list;
	element: typeof element;
} & HTagElements & {
		// Index signature that explicitly returns TagFunction (not TagFunction | undefined)
		// This overrides the default behavior from noUncheckedIndexedAccess
		[key: string]:
			| TagFunction
			| typeof update
			| typeof onUpdate
			| typeof css
			| typeof innerHTML
			| typeof ifConditional
			| typeof list
			| typeof element;
	};

const h = _h as unknown as HExport;

export { h };
export type { HObject };
