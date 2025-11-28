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
	lastConditionValue?: unknown; // Last condition value to detect changes
	isList?: boolean;
	listData?: unknown[]; // The array data (first element of deps)
	listDeps?: unknown[]; // Other dependencies besides the list
	listRenderFn?: (value: unknown, index: number) => HTMLElement; // Render function for list items
	listElements?: Map<number, HTMLElement>; // Map of index to rendered element
	listPlaceholder?: HTMLElement; // Current placeholder element for list rendering (first element or span)
	isVirtualList?: boolean;
	virtualListUpdate?: () => void; // Update function for virtual list
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

		// Handle virtual list rendering
		if (info.isVirtualList && info.virtualListUpdate) {
			// Update virtual list data reference if state is an array
			const currentState = virtualListInstances.get(info.element);
			if (currentState) {
				// If the triggered state is an array, use it as new data
				// Otherwise keep current data
				if (Array.isArray(state)) {
					currentState.listData = state as unknown[];
				}
			}
			info.virtualListUpdate();
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

	// Check if condition value has changed
	if (reactiveInfo.lastConditionValue === conditionResult) {
		// Condition value hasn't changed, no need to re-render
		return;
	}

	// Update last condition value
	reactiveInfo.lastConditionValue = conditionResult;

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
// First parameter is the data list (array)
// Second parameter is a render function that receives (value, index)
// Type inference: T is inferred from the dataList array
function list<T>(
	dataList: T[],
	renderFn: (value: T, index: number) => HTMLElement,
): HTMLElement;
function list(
	dataList: unknown[],
	renderFn: (value: unknown, index: number) => HTMLElement,
): HTMLElement;
function list<T = unknown>(
	dataList: T[] | unknown[],
	renderFn: (value: T, index: number) => HTMLElement,
): HTMLElement {
	// First parameter must be an array
	if (!Array.isArray(dataList)) {
		throw new Error("h.list: First parameter must be an array");
	}

	const listData = dataList as T[];
	const otherDeps: unknown[] = [];
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
		} else if (newLength > currentLength) {
			// List length increased - only add new items, don't re-render existing ones
			// Find the last existing element to insert after it
			let lastInserted: HTMLElement | null = null;
			if (parent) {
				// Find the last list element that exists in DOM
				for (let i = currentLength - 1; i >= 0; i--) {
					const listElement = listElements.get(i);
					if (listElement && listElement.parentNode === parent) {
						lastInserted = listElement;
						break;
					}
				}
			}

			// Only render and insert new items (from currentLength to newLength-1)
			for (let i = currentLength; i < newLength; i++) {
				const element = renderFn(newListData[i], i);
				listElements.set(i, element);
				if (parent && lastInserted) {
					parent.insertBefore(element, lastInserted.nextSibling);
					lastInserted = element;
				} else if (parent && !lastInserted) {
					// If no lastInserted found, insert after currentPlaceholder
					parent.insertBefore(element, currentPlaceholder.nextSibling);
					lastInserted = element;
				}
			}
		} else {
			// List length decreased - re-render all items (keep existing logic)
			// Save the insertion point before removing elements
			// We need to find the node after the LAST list element, not the first one
			let insertBeforeNode: Node | null = null;
			if (parent && currentPlaceholder.parentNode === parent) {
				// Find the last list element to get the correct insertion point
				let lastListElement: HTMLElement | null = null;
				for (let i = currentLength - 1; i >= 0; i--) {
					const listElement = listElements.get(i);
					if (listElement && listElement.parentNode === parent) {
						lastListElement = listElement;
						break;
					}
				}
				// If we found the last element, use its nextSibling
				// Otherwise, fall back to currentPlaceholder.nextSibling
				if (lastListElement) {
					insertBeforeNode = lastListElement.nextSibling;
				} else {
					insertBeforeNode = currentPlaceholder.nextSibling;
				}
			}

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
				// Insert at the original position, not at the end
				// Verify insertBeforeNode is still a child of parent before using it
				if (insertBeforeNode && insertBeforeNode.parentNode === parent) {
					parent.insertBefore(firstElement, insertBeforeNode);
				} else if (insertBeforeNode === null) {
					// If insertBeforeNode is null, it means the list was at the end
					parent.appendChild(firstElement);
				} else {
					// insertBeforeNode exists but is no longer a child of parent
					// This shouldn't happen, but fallback to appendChild
					parent.appendChild(firstElement);
				}
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

// Virtual list types and function
type VirtualListOptions = {
	/** Item height (fixed number), function to get height, or "auto" for dynamic height measurement */
	itemHeight: number | ((index: number) => number) | "auto";
	/** Container height, defaults to parent height */
	containerHeight?: number;
	/** Number of items to render outside viewport (before and after), default 6 */
	overscan?: number;
	/** Scroll container element, uses returned container if not provided */
	scrollContainer?: HTMLElement;
	/** Estimated initial height for dynamic height mode (for first render), default 150 */
	estimatedItemHeight?: number;
};

type VirtualListState = {
	scrollTop: number;
	containerHeight: number;
	totalHeight: number;
	startIndex: number;
	endIndex: number;
	visibleItems: HTMLElement[];
	spacerTop: HTMLElement | null;
	spacerBottom: HTMLElement | null;
	listData: unknown[];
	renderFn: (value: unknown, index: number) => HTMLElement;
	options: VirtualListOptions;
	contentContainer: HTMLElement;
	rafId: number | null;
	itemHeights: Map<number, number>; // Cache actual height of each item (for dynamic height mode)
	estimatedHeight: number; // Estimated height (for unmeasured items)
};

// Store virtual list instances for updates
const virtualListInstances = new WeakMap<HTMLElement, VirtualListState>();

function virtualList<T>(
	items: T[],
	attrs: Attributes,
	renderFn: (value: T, index: number) => HTMLElement,
	options?: VirtualListOptions,
): HTMLElement;
function virtualList(
	items: unknown[],
	attrs: Attributes,
	renderFn: (value: unknown, index: number) => HTMLElement,
	options?: VirtualListOptions,
): HTMLElement;
function virtualList<T = unknown>(
	items: T[] | unknown[],
	attrs: Attributes,
	renderFn: (value: T, index: number) => HTMLElement,
	options?: VirtualListOptions,
): HTMLElement {
	// Validate first parameter must be an array
	if (!Array.isArray(items)) {
		throw new Error("h.virtualList: First parameter must be an array");
	}

	const listData = items as T[];
	const otherDeps: unknown[] = [];
	const renderFnInternal = renderFn as (
		value: unknown,
		index: number,
	) => HTMLElement;

	// attrs parameter must be passed, used to set container div attributes

	// Configuration options (provide default values)
	const {
		itemHeight = "auto",
		containerHeight: initialContainerHeight,
		overscan = 6,
		scrollContainer: externalScrollContainer,
		estimatedItemHeight = 150,
	} = options || {};

	// Determine if it's dynamic height mode
	const isDynamicHeight = itemHeight === "auto";

	// Function to calculate item height
	const getItemHeight = (index: number, useCache = true): number => {
		if (isDynamicHeight) {
			// Dynamic height mode: prioritize cache, otherwise use estimated height
			if (useCache && state.itemHeights.has(index)) {
				const cachedHeight = state.itemHeights.get(index);
				if (cachedHeight !== undefined) {
					return cachedHeight;
				}
			}
			return state.estimatedHeight;
		}
		if (typeof itemHeight === "function") {
			return itemHeight(index);
		}
		return itemHeight;
	};

	// Calculate total height
	const calculateTotalHeight = (data: unknown[]): number => {
		if (isDynamicHeight) {
			// Dynamic height mode: use cached height + estimated height
			let total = 0;
			for (let i = 0; i < data.length; i++) {
				total += getItemHeight(i);
			}
			return total;
		}
		if (typeof itemHeight === "function") {
			let total = 0;
			for (let i = 0; i < data.length; i++) {
				total += getItemHeight(i);
			}
			return total;
		}
		return data.length * itemHeight;
	};

	// Calculate offset for each item
	const getItemOffset = (index: number, _data: unknown[]): number => {
		if (isDynamicHeight || typeof itemHeight === "function") {
			let offset = 0;
			for (let i = 0; i < index; i++) {
				offset += getItemHeight(i);
			}
			return offset;
		}
		return index * itemHeight;
	};

	// Ensure options is not null
	const finalOptions = options || {
		itemHeight: "auto",
		overscan: 6,
		estimatedItemHeight: 150,
	};

	// State
	const state: VirtualListState = {
		scrollTop: 0,
		// Initial height is 0, waiting for parent container height detection
		containerHeight: initialContainerHeight || 0,
		totalHeight: 0,
		startIndex: 0,
		endIndex: 0,
		visibleItems: [],
		spacerTop: null,
		spacerBottom: null,
		listData: listData as unknown[],
		renderFn: renderFnInternal,
		options: finalOptions,
		contentContainer: null as unknown as HTMLElement,
		rafId: null,
		itemHeights: new Map<number, number>(),
		estimatedHeight: estimatedItemHeight,
	};

	// Create container
	const container = document.createElement("div");
	container.style.position = "relative";
	container.style.overflow = "auto";

	// Apply user-provided attrs
	applyAttributes(container, attrs);

	if (initialContainerHeight) {
		container.style.height = `${initialContainerHeight}px`;
	}

	// Create content container
	const contentContainer = document.createElement("div");
	contentContainer.style.position = "relative";
	container.appendChild(contentContainer);

	// Calculate max height limit (2x screen height)
	const maxHeight = typeof window !== "undefined" ? window.innerHeight * 2 : 0;

	// Throttler: detect height during scroll
	let resizeThrottleId: number | null = null;
	const throttledHeightCheck = () => {
		if (resizeThrottleId === null) {
			resizeThrottleId = requestAnimationFrame(() => {
				resizeThrottleId = null;
				// Detect container height changes
				const currentHeight = container.offsetHeight;
				if (currentHeight > 0) {
					// Limit height to no more than 2x screen height
					const newHeight = Math.min(currentHeight, maxHeight);
					if (newHeight !== state.containerHeight) {
						state.containerHeight = newHeight;
						container.style.height = `${newHeight}px`;
						// Re-render visible items
						renderVisibleItems(state.listData);
					}
				}
			});
		}
	};

	// Height detection function: wait for container to be ready
	const checkContainerHeight = (): void => {
		// First try to read the container's own offsetHeight
		const containerOffsetHeight = container.offsetHeight;

		if (initialContainerHeight) {
			// If initial height is set, use it directly
			state.containerHeight = initialContainerHeight;
			container.style.height = `${initialContainerHeight}px`;
		} else if (containerOffsetHeight > 0) {
			// If container has a clear height, use it
			const newHeight = Math.min(containerOffsetHeight, maxHeight);
			if (newHeight !== state.containerHeight) {
				state.containerHeight = newHeight;
				container.style.height = `${newHeight}px`;
			}
		} else {
			// Container has no height, try reading parent container height
			const parentHeight = container.parentElement?.clientHeight || 0;
			if (parentHeight === 0) {
				// Parent container doesn't have height yet, continue waiting for next frame
				requestAnimationFrame(checkContainerHeight);
				return;
			}
			// Limit height to no more than 2x screen height
			const newHeight = Math.min(parentHeight, maxHeight);
			if (newHeight !== state.containerHeight) {
				state.containerHeight = newHeight;
				container.style.height = `${newHeight}px`;
			}
		}

		// Initial render
		renderVisibleItems(state.listData);
	};

	// Set content container to state
	state.contentContainer = contentContainer;

	// Calculate visible range
	const calculateVisibleRange = (
		data: unknown[],
	): { start: number; end: number } => {
		if (data.length === 0) {
			return { start: 0, end: 0 };
		}

		const scrollTop = state.scrollTop;
		const containerHeight = state.containerHeight;
		const viewportTop = scrollTop;
		const viewportBottom = scrollTop + containerHeight;

		let start = 0;
		let end = data.length - 1;

		// Binary search for start index
		if (isDynamicHeight || typeof itemHeight === "function") {
			// Variable height: use binary search
			let low = 0;
			let high = data.length - 1;
			while (low <= high) {
				const mid = Math.floor((low + high) / 2);
				const offset = getItemOffset(mid, data);
				const itemHeightValue = getItemHeight(mid);
				if (offset + itemHeightValue < viewportTop) {
					low = mid + 1;
				} else {
					high = mid - 1;
				}
			}
			start = low;

			// Find end index
			low = start;
			high = data.length - 1;
			while (low <= high) {
				const mid = Math.floor((low + high) / 2);
				const offset = getItemOffset(mid, data);
				if (offset > viewportBottom) {
					high = mid - 1;
				} else {
					low = mid + 1;
				}
			}
			end = high;
		} else {
			// Fixed height: direct calculation
			start = Math.floor(viewportTop / itemHeight);
			end = Math.min(Math.ceil(viewportBottom / itemHeight), data.length - 1);
		}

		// Apply overscan
		start = Math.max(0, start - overscan);
		end = Math.min(data.length - 1, end + overscan);

		return { start, end };
	};

	// Render visible items
	const renderVisibleItems = (data: unknown[]): void => {
		const { start, end } = calculateVisibleRange(data);
		state.startIndex = start;
		state.endIndex = end;

		// Remove old visible items
		for (const item of state.visibleItems) {
			if (item.parentNode === contentContainer) {
				contentContainer.removeChild(item);
			}
		}
		state.visibleItems = [];

		// Create top spacer
		if (start > 0) {
			const topOffset = getItemOffset(start, data);
			if (!state.spacerTop) {
				state.spacerTop = document.createElement("div");
				state.spacerTop.style.position = "absolute";
				state.spacerTop.style.top = "0";
				state.spacerTop.style.left = "0";
				state.spacerTop.style.right = "0";
				contentContainer.appendChild(state.spacerTop);
			}
			state.spacerTop.style.height = `${topOffset}px`;
		} else if (state.spacerTop) {
			contentContainer.removeChild(state.spacerTop);
			state.spacerTop = null;
		}

		// Render visible items
		for (let i = start; i <= end; i++) {
			const item = renderFnInternal(data[i], i);
			item.style.position = "absolute";
			item.style.top = `${getItemOffset(i, data)}px`;
			item.style.left = "0";
			item.style.right = "0";
			contentContainer.appendChild(item);
			state.visibleItems.push(item);
		}

		// Dynamic height mode: measure and cache actual height
		if (isDynamicHeight && state.visibleItems.length > 0) {
			// Use requestAnimationFrame to ensure DOM is rendered
			requestAnimationFrame(() => {
				let needsUpdate = false;
				const currentStart = state.startIndex;
				for (let idx = 0; idx < state.visibleItems.length; idx++) {
					const item = state.visibleItems[idx];
					if (!item) continue;
					const actualIndex = currentStart + idx;
					const measuredHeight =
						item.offsetHeight || item.getBoundingClientRect().height;
					if (measuredHeight > 0) {
						const oldHeight =
							state.itemHeights.get(actualIndex) || state.estimatedHeight;
						if (Math.abs(measuredHeight - oldHeight) > 1) {
							// Height changed, update cache
							state.itemHeights.set(actualIndex, measuredHeight);
							needsUpdate = true;
						}
					}
				}

				// Update estimated height (using average of measured items)
				if (needsUpdate && state.itemHeights.size > 0) {
					let sum = 0;
					let count = 0;
					for (const height of state.itemHeights.values()) {
						sum += height;
						count++;
					}
					state.estimatedHeight = Math.round(sum / count);

					// Recalculate total height and update layout
					state.totalHeight = calculateTotalHeight(data);
					contentContainer.style.height = `${state.totalHeight}px`;

					// Update positions of all visible items
					for (let idx = 0; idx < state.visibleItems.length; idx++) {
						const item = state.visibleItems[idx];
						if (!item) continue;
						const actualIndex = currentStart + idx;
						item.style.top = `${getItemOffset(actualIndex, data)}px`;
					}

					// Update spacers
					if (currentStart > 0 && state.spacerTop) {
						state.spacerTop.style.height = `${getItemOffset(currentStart, data)}px`;
					}
					const bottomOffset =
						getItemOffset(data.length, data) - getItemOffset(end + 1, data);
					if (bottomOffset > 0 && state.spacerBottom) {
						state.spacerBottom.style.height = `${bottomOffset}px`;
						state.spacerBottom.style.top = `${getItemOffset(end + 1, data)}px`;
					}
				}
			});
		}

		// Create bottom spacer
		const bottomOffset =
			getItemOffset(data.length, data) - getItemOffset(end + 1, data);
		if (bottomOffset > 0) {
			if (!state.spacerBottom) {
				state.spacerBottom = document.createElement("div");
				state.spacerBottom.style.position = "absolute";
				state.spacerBottom.style.bottom = "0";
				state.spacerBottom.style.left = "0";
				state.spacerBottom.style.right = "0";
				contentContainer.appendChild(state.spacerBottom);
			}
			state.spacerBottom.style.height = `${bottomOffset}px`;
			state.spacerBottom.style.top = `${getItemOffset(end + 1, data)}px`;
		} else if (state.spacerBottom) {
			contentContainer.removeChild(state.spacerBottom);
			state.spacerBottom = null;
		}

		// Update total height of content container
		state.totalHeight = calculateTotalHeight(data);
		contentContainer.style.height = `${state.totalHeight}px`;
	};

	// Handle scroll
	const handleScroll = (): void => {
		const scrollContainer = externalScrollContainer || container;
		state.scrollTop = scrollContainer.scrollTop;

		// Check height changes during scroll
		throttledHeightCheck();

		if (state.rafId === null) {
			state.rafId = requestAnimationFrame(() => {
				state.rafId = null;
				renderVisibleItems(state.listData);
			});
		}
	};

	// Update function (called when data changes)
	const updateVirtualList = (newData: unknown[]): void => {
		state.listData = newData;
		// Dynamic height mode: clear no-longer-existing height cache
		if (isDynamicHeight) {
			const newLength = newData.length;
			for (const index of state.itemHeights.keys()) {
				if (index >= newLength) {
					state.itemHeights.delete(index);
				}
			}
		}
		state.totalHeight = calculateTotalHeight(newData);
		contentContainer.style.height = `${state.totalHeight}px`;
		renderVisibleItems(newData);
	};

	// Initialize
	const init = (): void => {
		// Set total height
		state.totalHeight = calculateTotalHeight(listData as unknown[]);
		contentContainer.style.height = `${state.totalHeight}px`;

		// Add scroll listener
		const scrollContainer = externalScrollContainer || container;
		scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

		// Start detecting container height (wait for parent to be ready)
		checkContainerHeight();
	};

	// Initialize
	init();

	// Store state for updates
	virtualListInstances.set(container, state);

	// Register to reactive system, update when data array changes
	for (const dep of [listData, ...otherDeps]) {
		const depKey = dep as object;
		const existing = reactiveElements.get(depKey);
		if (existing) {
			existing.add({
				element: container,
				attrs: {},
				content: null,
				tagName: "div",
				isVirtualList: true,
				virtualListUpdate: () => {
					const currentState = virtualListInstances.get(container);
					if (currentState) {
						updateVirtualList(currentState.listData);
					}
				},
			});
		} else {
			reactiveElements.set(
				depKey,
				new Set([
					{
						element: container,
						attrs: {},
						content: null,
						tagName: "div",
						isVirtualList: true,
						virtualListUpdate: () => {
							const currentState = virtualListInstances.get(container);
							if (currentState) {
								updateVirtualList(currentState.listData);
							}
						},
					},
				]),
			);
		}
	}

	return container;
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
	"virtualList",
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
		| typeof element
		| typeof virtualList {
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
			if (prop === "virtualList") {
				return virtualList;
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
	virtualList: typeof virtualList;
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
			| typeof element
			| typeof virtualList;
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
	virtualList: typeof virtualList;
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
			| typeof element
			| typeof virtualList;
	};

const h = _h as unknown as HExport;

export { h };
export type { HObject };
