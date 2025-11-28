import { h } from "zeroeffect";

// Will create a style tag and insert it into the head
h.css(`
	.text-red-500 {
		color: red;
	}
	.text-blue-500 {
		color: blue;
	}
`);

export const ExamplePage = () => {
	// Just need a regular object
	const state = {
		count: 0,
	};

	const other = {
		name: "John",
	};

	// List data, also a regular array
	const list = [1, 2, 3, 4, 5];

	// Todo List data
	const todos: Array<{ id: number; text: string; completed: boolean }> = [];

	// Virtual List data - 100,000 items
	const virtualListItems: Array<{
		id: number;
		name: string;
		value: number;
	}> = Array.from({ length: 100000 }, (_, i) => ({
		id: i,
		name: `Item ${i}`,
		value: Math.floor(Math.random() * 1000),
	}));

	const getCount = () => {
		// mock api call, get count from api
		state.count = 100;
		// When actively updating state, need to manually call h.update to update the view
		h.update(state);
		// Multiple updates in the same frame will be merged into one update
		h.update(state);
	};

	// If update is executed, this callback will be triggered
	h.onUpdate(() => {
		console.log("state changed", state);
		if (state.count === 100) {
			other.name = "Jane";
		}
		// Don't unconditionally use update in onUpdate, it will cause circular calls
		// h.update(other);
	});

	getCount();

	// Will only print once
	console.log("re-render only once");

	// h.div and all other commonly used tag functions are functions that return a DOM element, some special strings will also be parsed as tags, e.g. h['iconify-icon'] will be parsed as <iconify-icon> tag
	// Only those in the whitelist won't be parsed as tag functions: update, onUpdate, watch, list, if, css, innerHTML, element, otherwise all will be parsed as tag functions

	// Create an existing element to demonstrate h.ref functionality
	const existingDiv = document.createElement("div");
	existingDiv.textContent = "Initial content";

	return h.div(
		// If the first parameter is an array, it will be used as dependencies. When objects in the array change, it will trigger the function to respond. Dependencies can be multiple
		// When h.update containing state is executed, it will trigger the function to respond, because [state] is described
		// h.div is just a regular HTMLDivElement element, which will automatically bind reactive properties and dependencies
		h.div(
			[state],
			{ class: "text-2xl font-bold" },
			() => `Count: ${state.count} -- ${new Date().toISOString()}`,
			h.span([state], () => (state.count % 2 === 0 ? "Even" : "Odd")),
		),
		h.if(
			[state],
			() => state.count > 2,
			() => {
				console.log("==debug==", "rerender");
				return h.div([state], "Count is greater than 2");
			},
			() => {
				console.log("==debug==", "else rerender");
				return h.div([state], "Count is less than 2");
			},
		),
		// h.element is used to bind reactive properties and dependencies to existing DOM elements
		h.element(existingDiv)([state], { class: "text-2xl font-bold" }, () =>
			state.count % 2 === 0 ? "Even" : "Odd",
		),
		// Supports custom components. In TS, due to the type system, it's recommended to use 'as' to assert to a known type
		h["iconify-icon" as "div"]({
			icon: "material-symbols:agriculture",
		}),
		// Supports innerHTML
		h.innerHTML(
			`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2m3.3 14.71L11 12.41V7h2v4.59l3.71 3.71z"/></svg>`,
		),
		// When h.update containing other is executed, it will trigger the function to respond, because [other] is described
		h.div(
			[other],
			{
				// Any property that is a function will be executed on update
				class: () => {
					if (other.name === "Jane") {
						return "text-red-500";
					}
					return "text-blue-500";
				},
				// Properties starting with 'on' won't trigger updates, because they are event handler functions
				onclick: () => {
					other.name = "John";
					h.update(other);
				},
			},
			() => `Name: ${other.name} -- ${new Date().toISOString()}`,
		),
		h.button(
			[state],
			{
				// If the style property is an object, it will be directly applied to the element
				style: {
					// Note: property names need to be wrapped in quotes
					backgroundColor: "red",
				},
				onclick: () => {
					state.count++;
					h.update(state);
				},
			},
			// If the return value is false, null, undefined, NaN, '', it won't render, but 'false', 0, '0' will render
			() => state.count && "Click me",
		),
		h.span(
			[state],
			{
				// Similarly, if the style property is a function, it will be executed on update
				style: () => ({
					backgroundColor: state.count % 2 === 0 ? "red" : "blue",
				}),
			},
			() => `Count: ${state.count} -- ${new Date().toISOString()}`,
		),
		// Supports if conditional rendering. If the condition is true, render the content, otherwise don't render
		h.if(
			// The first parameter must be an array, representing dependencies, type constraints are needed
			[state],
			// The second parameter must be a function, representing the condition, type constraints are needed, return value doesn't need to be boolean, just truthy
			() => state.count % 2 === 0,
			// The third parameter must be a function, when true, represents the content to render
			() => h.div([state], "I am even"),
			// If there's a 4th parameter, it will render when the condition is false
			() => h.div([state], "I am odd"),
		),
		h.if(
			[state],
			() => state.count % 2 === 0,
			() => {
				return h.div([state], "I am even2");
			},
		),
		h.list(
			// The first parameter is still dependencies, and the first element of the first parameter array needs to be the host. There can be multiple parameters, other parameters are just regular dependencies
			// The list on the next line will be treated as both a dependency and parsed as a list, and will be used for type inference
			// Content under list won't trigger updates, but when the list length changes, elements will be removed or added
			[list, state],
			// Automatically parses array type, value is the value in the array, index is the index
			(value, index) => h.div([value], `Item: ${value}, index: ${index}`),
		),
		// Todo List example
		h.div(
			{ class: "mt-8 p-4 border border-gray-300 rounded-lg" },
			h.h2({ class: "text-xl font-bold mb-4" }, "Todo List"),
			// Input field and add button
			h.div(
				{ class: "flex gap-2 mb-4" },
				h.input({
					id: "todo-input",
					type: "text",
					placeholder: "Enter todo item...",
					class: "flex-1 px-3 py-2 border border-gray-300 rounded",
					onkeydown: (e: KeyboardEvent) => {
						if (e.key === "Enter") {
							const input = e.target as HTMLInputElement;
							if (input.value.trim()) {
								todos.push({
									id: Date.now(),
									text: input.value.trim(),
									completed: false,
								});
								input.value = "";
								h.update(todos);
							}
						}
					},
				}),
				h.button(
					{
						class: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",
						onclick: () => {
							const input = document.getElementById(
								"todo-input",
							) as HTMLInputElement;
							if (input?.value.trim()) {
								todos.push({
									id: Date.now(),
									text: input.value.trim(),
									completed: false,
								});
								input.value = "";
								h.update(todos);
							}
						},
					},
					"Add",
				),
			),
			// Use h.list to render todo list
			h.list([todos], (todo, index) => {
				return h.div(
					[todo],
					{
						class:
							"flex items-center gap-2 p-2 mb-2 border border-gray-200 rounded",
						style: () => ({
							opacity: todo.completed ? 0.6 : 1,
							textDecoration: todo.completed ? "line-through" : "none",
						}),
					},
					h.input([todo], {
						type: "checkbox",
						checked: todo.completed,
						onchange: () => {
							todo.completed = !todo.completed;
							h.update(todos);
						},
					}),
					// Editable input field - value uses function form to make it reactive
					h.input([todo], {
						type: "text",
						value: () => todo.text, // Reactive value
						class: "flex-1 px-2 py-1 border border-gray-300 rounded",
						style: () => ({
							textDecoration: todo.completed ? "line-through" : "none",
						}),
						oninput: (e: Event) => {
							const input = e.target as HTMLInputElement;
							todo.text = input.value;
							// Note: h.update is not called here, because frequent updates during input will affect input experience
							// Can update on onblur, or use debouncing
						},
						onblur: () => {
							// Update view when losing focus (ensure other elements depending on this todo also update)
							h.update(todo);
						},
						onkeydown: (e: KeyboardEvent) => {
							if (e.key === "Enter") {
								(e.target as HTMLInputElement).blur();
							}
						},
					}),
					// Render time display, used to check if repainting occurred
					h.span(
						[todo],
						{
							class: "text-xs text-gray-500",
							style: {
								fontFamily: "monospace",
							},
						},
						() =>
							`Render time: ${new Date().toLocaleTimeString()}.${Date.now() % 1000}`,
					),
					h.button(
						{
							class: "px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600",
							onclick: () => {
								todos.splice(index, 1);
								h.update(todos);
							},
						},
						"Delete",
					),
				);
			}),
		),
		// Virtual List example - can handle 100k+ items efficiently
		h.div(
			{ class: "mt-8 p-4 border border-gray-300 rounded-lg" },
			h.h2({ class: "text-xl font-bold mb-4" }, "Virtual List (100,000 items)"),
			h.div(
				{ class: "mb-4 flex gap-2 items-center" },
				h.span(
					{ class: "text-sm text-gray-600" },
					"Only visible items are rendered",
				),
				h.button(
					{
						class:
							"px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600",
						onclick: () => {
							const newId = virtualListItems.length;
							virtualListItems.push({
								id: newId,
								name: `Item ${newId}`,
								value: Math.floor(Math.random() * 1000),
							});
							h.update(virtualListItems);
						},
					},
					"Add Item",
				),
				h.button(
					{
						class: "px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600",
						onclick: () => {
							if (virtualListItems.length > 0) {
								virtualListItems.pop();
								h.update(virtualListItems);
							}
						},
					},
					"Remove Last",
				),
				h.span(
					[virtualListItems],
					{ class: "text-sm font-semibold" },
					() => `Total: ${virtualListItems.length.toLocaleString()} items`,
				),
			),
			h.virtualList(
				[virtualListItems],
				(item, index) => {
					return h.div(
						[item],
						{
							class: "p-3 border-b border-gray-200 hover:bg-gray-50",
							style: () => ({
								backgroundColor: index % 2 === 0 ? "#f9fafb" : "#ffffff",
							}),
						},
						h.div(
							{ class: "flex items-center justify-between" },
							h.div(
								{ class: "flex-1" },
								h.span({ class: "font-semibold text-gray-800" }, `#${item.id}`),
								h.span({ class: "ml-2 text-gray-600" }, item.name),
							),
							h.div(
								{ class: "flex items-center gap-2" },
								h.span(
									{
										class:
											"px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm",
									},
									`Value: ${item.value}`,
								),
								h.button(
									{
										class:
											"px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm",
										onclick: () => {
											// Find the index of the item by id and remove it
											const itemIndex = virtualListItems.findIndex(
												(i) => i.id === item.id,
											);
											if (itemIndex !== -1) {
												virtualListItems.splice(itemIndex, 1);
												h.update(virtualListItems);
											}
										},
									},
									"Delete",
								),
							),
						),
					);
				},
				{
					itemHeight: 60, // Fixed height for each item
					containerHeight: 400, // Container height
					overscan: 5, // Render 5 extra items above and below viewport
				},
			),
		),
	);
};

// Wait for DOM to be ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		const root = document.getElementById("root");
		if (root) {
			root.appendChild(ExamplePage());
		}
	});
} else {
	// DOM is already loaded
	const root = document.getElementById("root");
	if (root) {
		root.appendChild(ExamplePage());
	}
}
