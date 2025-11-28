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
			return [result];
		}
		return [document.createTextNode(String(result))];
	}
	if (!shouldRender(content)) {
		return [];
	}
	if (content instanceof HTMLElement) {
		return [content];
	}
	return [document.createTextNode(String(content))];
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
		for (const item of contents) {
			const nodes = renderContent(item);
			for (const node of nodes) {
				container.appendChild(node);
			}
		}
		element.appendChild(container);
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
	isList?: boolean;
	listData?: unknown[]; // The array data (first element of deps)
	listDeps?: unknown[]; // Other dependencies besides the list
	listRenderFn?: (value: unknown, index: number) => HTMLElement; // Render function for list items
	listElements?: Map<number, HTMLElement>; // Map of index to rendered element
}

// Map of dependencies to reactive elements
// Using Map with object identity for tracking
const reactiveElements = new Map<object, Set<ReactiveElementInfo>>();

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
	if (elements) {
		for (const info of elements) {
			// Handle conditional rendering
			if (info.isConditional && info.condition && info.renderFn) {
				updateConditional(
					info.element,
					info.condition,
					info.renderFn,
					info.elseRenderFn,
				);
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
				updateList(
					info.element,
					newListData,
					info.listRenderFn,
					info.listElements,
				);
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
	// Create a container element to hold the conditionally rendered content
	const container = document.createElement("div");

	// Track this conditional element's dependencies
	for (const dep of deps) {
		const depKey = dep as object;
		const existing = reactiveElements.get(depKey);
		if (existing) {
			existing.add({
				element: container,
				attrs: {},
				content: null,
				tagName: "div",
				isConditional: true,
				condition,
				renderFn,
				elseRenderFn,
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
						isConditional: true,
						condition,
						renderFn,
						elseRenderFn,
					},
				]),
			);
		}
	}

	// Initial render
	updateConditional(container, condition, renderFn, elseRenderFn);

	return container;
}

// Update conditional rendering
function updateConditional(
	container: HTMLElement,
	condition: () => unknown,
	renderFn: () => HTMLElement,
	elseRenderFn?: () => HTMLElement,
): void {
	const conditionResult = condition();
	const shouldRender = Boolean(conditionResult);

	// Clear container
	container.textContent = "";

	if (shouldRender) {
		// Render content when condition is truthy
		const content = renderFn();
		container.appendChild(content);
	} else if (elseRenderFn) {
		// Render else content when condition is falsy and else function is provided
		const content = elseRenderFn();
		container.appendChild(content);
	}
	// If condition is falsy and no else function, container remains empty
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

	// Create a container element to hold the list items
	const container = document.createElement("div");

	// Store list elements for efficient updates
	const listElements = new Map<number, HTMLElement>();

	// Track dependencies (both list and other deps)
	const allDeps = [listData, ...otherDeps];
	for (const dep of allDeps) {
		const depKey = dep as object;
		const existing = reactiveElements.get(depKey);
		if (existing) {
			existing.add({
				element: container,
				attrs: {},
				content: null,
				tagName: "div",
				isList: true,
				listData,
				listDeps: otherDeps,
				listRenderFn: renderFnInternal,
				listElements,
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
						isList: true,
						listData,
						listDeps: otherDeps,
						listRenderFn: renderFnInternal,
						listElements,
					},
				]),
			);
		}
	}

	// Initial render
	updateList(container, listData, renderFnInternal, listElements);

	return container;
}

// Update list rendering - only manages length changes for best performance
// When length changes, re-sync the entire list to ensure correctness
function updateList(
	container: HTMLElement,
	newListData: unknown[],
	renderFn: (value: unknown, index: number) => HTMLElement,
	listElements: Map<number, HTMLElement>,
): void {
	const currentLength = container.children.length;
	const newLength = newListData.length;

	// Only update if length changed
	if (newLength !== currentLength) {
		// Clear container and re-render all items
		container.textContent = "";
		listElements.clear();

		// Re-render all items with new indices
		for (let i = 0; i < newLength; i++) {
			const element = renderFn(newListData[i], i);
			listElements.set(i, element);
			container.appendChild(element);
		}
	}
	// If lengths are equal, no changes needed - individual items will update via their own dependencies
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
		| typeof list {
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
} & HTagElements & {
		// Index signature for dynamic tags - always returns TagFunction via Proxy
		[key: string]:
			| TagFunction
			| typeof update
			| typeof onUpdate
			| typeof css
			| typeof innerHTML
			| typeof ifConditional;
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
			| typeof list;
	};

const h = _h as unknown as HExport;

export { h };
export type { HObject };
