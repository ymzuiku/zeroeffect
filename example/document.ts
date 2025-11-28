import { h } from "zeroeffect";

// Language state - must be reactive
const langState = { current: "en" as "zh" | "en" };

// Modal state
const modalState = { isOpen: false };

// Translations
const translations = {
	zh: {
		title: "zeroeffect 响应式 DOM 库文档",
		subtitle: "无虚拟 DOM · 无 Proxy · 无 Signal",
		switchLang: "English",
		gettingStarted: {
			title: "快速开始",
			content:
				"zeroeffect 使用普通的 JavaScript 对象作为 state，无需 Signal 或 Proxy。第一个参数如果是数组，会作为依赖。当依赖对象变化时，调用 h.update(state) 更新视图。",
		},
		reactiveAttributes: {
			title: "响应式属性",
			content:
				"任何属性如果是函数，都会在更新时执行。on 开头的属性是事件处理函数，不会触发更新。",
		},
		style: {
			title: "样式对象和函数",
			content:
				"style 属性可以是对象或函数。如果是对象，会直接应用到元素上；如果是函数，会在更新时执行。",
		},
		conditional: {
			title: "条件渲染",
			content:
				"使用 h.if() 进行条件渲染。第一个参数是依赖数组，第二个参数是条件函数（返回真值/假值），第三个参数是条件为真时的渲染函数，第四个参数是可选的 else 渲染函数（条件为假时渲染）。如果没有 else 函数，条件为假时返回隐藏的 span。",
		},
		list: {
			title: "列表渲染",
			content:
				"使用 h.list() 渲染列表。第一个参数是依赖数组，第一个元素必须是列表数据数组，其他依赖是可选的。第二个参数是渲染函数，接收 value 和 index。列表长度变化时会重新渲染整个列表。每个列表项元素可以有自己的依赖，当这些依赖变化时，只有对应的项会更新。",
		},
		element: {
			title: "绑定已有元素",
			content: "使用 h.element() 可以给已有的 DOM 元素绑定响应式属性和依赖。",
		},
		todo: {
			title: "Todo List 完整示例",
			content: "一个完整的 Todo List 示例，展示了所有功能的综合使用。",
		},
		css: {
			title: "CSS 注入",
			content: "使用 h.css() 可以注入全局样式到 head 中。",
		},
		customTags: {
			title: "自定义标签",
			content:
				"支持自定义标签，如 h['iconify-icon']。在 TypeScript 中，建议使用类型断言 h['iconify-icon' as 'div'] 来避免类型错误。只有白名单里的方法不会解析成标签函数：update, onUpdate, list, if, css, innerHTML, element。",
		},
		innerHTML: {
			title: "innerHTML",
			content: "使用 h.innerHTML() 可以渲染 HTML 字符串。",
		},
		falsy: {
			title: "Falsy 值处理",
			content:
				"如果返回值是 false, null, undefined, NaN, ''，不会渲染。但是 'false', 0, '0' 会渲染。",
		},
	},
	en: {
		title: "zeroeffect Reactive DOM Library Documentation",
		subtitle: "No Virtual DOM · No Proxy · No Signal",
		switchLang: "中文",
		gettingStarted: {
			title: "Getting Started",
			content:
				"zeroeffect uses plain JavaScript objects as state - no Signal or Proxy needed. If the first parameter is an array, it becomes dependencies. When dependency objects change, call h.update(state) to update the view.",
		},
		reactiveAttributes: {
			title: "Reactive Attributes",
			content:
				"Any attribute that is a function will be executed on update. Attributes starting with 'on' are event handlers and won't trigger updates.",
		},
		style: {
			title: "Style Objects and Functions",
			content:
				"The style attribute can be an object or a function. If it's an object, it will be directly applied to the element; if it's a function, it will be executed on update.",
		},
		conditional: {
			title: "Conditional Rendering",
			content:
				"Use h.if() for conditional rendering. The first parameter is a dependency array, the second is a condition function (returns truthy/falsy), the third is a render function when condition is true, and the fourth is an optional else render function (when condition is false). If no else function is provided, a hidden span is returned when condition is false.",
		},
		list: {
			title: "List Rendering",
			content:
				"Use h.list() to render lists. The first parameter is a dependency array where the FIRST element MUST be the array to render, other dependencies are optional. The second parameter is a render function that receives value and index. The list re-renders when array length changes. Each list item element can have its own dependencies - when those dependencies change, only that specific item updates.",
		},
		element: {
			title: "Binding Existing Elements",
			content:
				"Use h.element() to bind reactive attributes and dependencies to existing DOM elements.",
		},
		todo: {
			title: "Todo List Complete Example",
			content:
				"A complete Todo List example demonstrating the comprehensive use of all features.",
		},
		css: {
			title: "CSS Injection",
			content: "Use h.css() to inject global styles into the head.",
		},
		customTags: {
			title: "Custom Tags",
			content:
				"Custom tags are supported, like h['iconify-icon']. In TypeScript, use type assertion h['iconify-icon' as 'div'] to avoid type errors. Only whitelisted methods won't be parsed as tag functions: update, onUpdate, list, if, css, innerHTML, element.",
		},
		innerHTML: {
			title: "innerHTML",
			content: "Use h.innerHTML() to render HTML strings.",
		},
		falsy: {
			title: "Falsy Value Handling",
			content:
				"If the return value is false, null, undefined, NaN, '', it won't render. But 'false', 0, '0' will render.",
		},
	},
};

function t(key: string): string {
	const keys = key.split(".");
	let value: unknown = translations[langState.current];
	for (const k of keys) {
		if (value && typeof value === "object" && k in value) {
			value = (value as Record<string, unknown>)[k];
		} else {
			return key;
		}
	}
	return typeof value === "string" ? value : key;
}

// Example states
const exampleStates = {
	gettingStarted: { count: 0 },
	reactiveAttributes: { name: "John" },
	style: { count: 0 },
	conditional: { count: 0 },
	list: { items: [1, 2, 3, 4, 5] },
	element: { count: 0 },
	todo: {
		todos: [] as Array<{
			id: number;
			text: string;
			completed: boolean;
			renderTime: string;
		}>,
	},
	css: {},
	customTags: {},
	innerHTML: {},
	falsy: { show: true },
};

// Inject CSS for documentation
h.css(`
	.text-red-500 {
		color: red;
	}
	.text-blue-500 {
		color: blue;
	}
	body {
		background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
		min-height: 100vh;
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
	}
	
	/* Code block styling - match Prism.js background */
	code[class*="language-"],
	pre[class*="language-"] {
		background: #1e1e1e !important;
		color: #d4d4d4 !important;
	}
	
	/* Override Prism.js theme to match our background */
	.token.comment,
	.token.prolog,
	.token.doctype,
	.token.cdata {
		color: #6a9955;
	}
	
	.token.punctuation {
		color: #d4d4d4;
	}
	
	.token.property,
	.token.tag,
	.token.boolean,
	.token.number,
	.token.constant,
	.token.symbol,
	.token.deleted {
		color: #569cd6;
	}
	
	.token.selector,
	.token.attr-name,
	.token.string,
	.token.char,
	.token.builtin,
	.token.inserted {
		color: #ce9178;
	}
	
	.token.operator,
	.token.entity,
	.token.url,
	.language-css .token.string,
	.style .token.string {
		color: #d4d4d4;
	}
	
	.token.atrule,
	.token.attr-value,
	.token.keyword {
		color: #569cd6;
	}
	
	.token.function,
	.token.class-name {
		color: #dcdcaa;
	}
	
	.token.regex,
	.token.important,
	.token.variable {
		color: #d4d4d4;
	}
	
	/* Ensure code block container matches */
	.doc-code-block {
		background: #1e1e1e !important;
		padding: 12px !important;
		border-radius: 8px;
		overflow-x: visible;
		overflow-wrap: break-word;
		word-wrap: break-word;
		border: 1px solid #2d2d2d;
	}
	
	.doc-code-block pre {
		margin: 0 !important;
		padding: 0 !important;
		background: #1e1e1e !important;
		white-space: pre-wrap;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}
	
	.doc-code-block code {
		background: #1e1e1e !important;
		font-size: 14px;
		line-height: 1.6;
		color: #d4d4d4 !important;
		white-space: pre-wrap;
		word-wrap: break-word;
		overflow-wrap: break-word;
		display: block;
	}
	
	.doc-code-block .token {
		background: transparent !important;
	}
	
	/* Preview block styling */
	.doc-preview-block {
		background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		padding: 24px;
		min-height: 200px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	
	/* Section card */
	.doc-section-card {
		margin-bottom: 48px;
		background: white;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
		padding: 32px;
		transition: box-shadow 0.2s;
	}
	
	.doc-section-card:hover {
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}
	
	/* Title styling */
	.doc-section-title {
		font-size: 28px;
		font-weight: 700;
		margin-bottom: 12px;
		color: #111827;
		line-height: 1.2;
	}
	
	.doc-section-desc {
		font-size: 16px;
		color: #6b7280;
		line-height: 1.6;
		max-width: 768px;
		margin-bottom: 24px;
	}
	
	/* Grid layout */
	.doc-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
	}
	
	@media (min-width: 1024px) {
		.doc-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
	
	/* Header styling */
	.doc-header {
		margin-bottom: 48px;
		text-align: center;
		padding-bottom: 32px;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.doc-title {
		font-size: 48px;
		font-weight: 800;
		margin-bottom: 16px;
		background: linear-gradient(to right, #111827, #374151, #111827);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	.doc-subtitle {
		font-size: 20px;
		color: #6b7280;
		font-weight: 500;
		letter-spacing: 0.5px;
	}
	
	/* Language switcher */
	.doc-lang-switcher {
		position: fixed;
		top: 24px;
		right: 24px;
		z-index: 50;
		display: flex;
		gap: 12px;
	}
	
	.doc-lang-button,
	.doc-claude-button {
		padding: 8px 16px;
		font-size: 14px;
		background: white;
		color: #374151;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
		cursor: pointer;
		font-weight: 500;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: all 0.2s;
	}
	
	.doc-lang-button:hover,
	.doc-claude-button:hover {
		background: #f9fafb;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
	}
	
	/* Modal styles */
	.doc-modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.2s;
	}
	
	.doc-modal-overlay.open {
		opacity: 1;
		pointer-events: all;
	}
	
	.doc-modal {
		background: white;
		border-radius: 12px;
		max-width: 800px;
		max-height: 90vh;
		width: 100%;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		transform: scale(0.95);
		transition: transform 0.2s;
	}
	
	.doc-modal-overlay.open .doc-modal {
		transform: scale(1);
	}
	
	.doc-modal-header {
		padding: 20px 24px;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.doc-modal-title {
		font-size: 20px;
		font-weight: 700;
		color: #111827;
	}
	
	.doc-modal-actions {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	
	.doc-modal-close,
	.doc-modal-copy {
		background: none;
		border: none;
		font-size: 24px;
		cursor: pointer;
		color: #6b7280;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		transition: all 0.2s;
	}
	
	.doc-modal-close:hover,
	.doc-modal-copy:hover {
		background: #f3f4f6;
		color: #111827;
	}
	
	.doc-modal-copy {
		font-size: 18px;
	}
	
	.doc-modal-content {
		padding: 24px;
		overflow-y: auto;
		flex: 1;
		background: #1e1e1e;
		color: #d4d4d4;
		margin: 0;
	}
	
	.doc-modal-content code {
		background: transparent;
		padding: 0;
		color: inherit;
		font-family: inherit;
		font-size: inherit;
	}
	
	/* Container */
	.doc-container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 32px 24px;
	}
	
	@media (min-width: 768px) {
		.doc-container {
			padding: 48px 32px;
		}
	}
	
	/* Utility classes */
	.doc-space-y > * + * {
		margin-top: 16px;
	}
	
	.doc-flex {
		display: flex;
	}
	
	.doc-flex-col {
		flex-direction: column;
	}
	
	.doc-gap-2 {
		gap: 8px;
	}
	
	.doc-gap-4 {
		gap: 16px;
	}
	
	@media (min-width: 640px) {
		.doc-flex-row-sm {
			flex-direction: row;
		}
	}
`);

// Create example section component
function createExampleSection(
	id: string,
	_codeExample: string,
	renderFn: () => HTMLElement,
) {
	const section = h.div(
		{ class: "doc-section-card" },
		// Title and description
		h.div(
			h.h2([langState], { class: "doc-section-title" }, () => t(`${id}.title`)),
			h.p([langState], { class: "doc-section-desc" }, () => t(`${id}.content`)),
		),
		// Code and preview container
		h.div(
			{ class: "doc-grid" },
			// Code block
			h.div(
				{ class: "doc-code-block" },
				h.pre(
					{
						style: {
							margin: "0",
							padding: "0",
							background: "transparent",
							color: "#d4d4d4",
							fontFamily: "Consolas, Monaco, 'Courier New', monospace",
							fontSize: "14px",
							lineHeight: "1.6",
							whiteSpace: "pre-wrap",
							wordWrap: "break-word",
							overflowWrap: "break-word",
						},
					},
					h.code(
						{
							class: "language-typescript",
							"data-lang": "typescript",
							style: {
								whiteSpace: "pre-wrap",
								wordWrap: "break-word",
								overflowWrap: "break-word",
								display: "block",
							},
						},
						_codeExample,
					),
				),
			),
			// Preview block
			h.div({ class: "doc-preview-block" }, renderFn()),
		),
	);

	return section;
}

// Create the document page
export const DocumentPage = () => {
	// Update document title when language changes
	const updateTitle = () => {
		document.title = t("title");
	};
	h.onUpdate(() => {
		if (langState.current) {
			updateTitle();
		}
	});

	// README-CLAUDE.md content
	const claudeMdContent = `# zeroeffect Usage Guide for Claude

## Core Concept

zeroeffect is a reactive DOM library that uses **plain JavaScript objects** as state. No Signal, no Proxy, no Virtual DOM.

## Basic Usage

\`\`\`typescript
import { h } from "zeroeffect";

// State is just a plain object
const state = { count: 0 };

// Create element with reactive content
const div = h.div(
  [state], // First arg: dependencies array
  () => \`Count: \${state.count}\` // Reactive content function
);

// Update state and trigger re-render
state.count = 5;
h.update(state); // Manual update required
\`\`\`

## Key Rules

1. **Dependencies**: First parameter as array \`[state]\` makes content reactive to that state
2. **Manual Updates**: Call \`h.update(state)\` after modifying state to update DOM
3. **Reactive Content**: Functions in content position execute on update
4. **Reactive Attributes**: Functions as attribute values execute on update
5. **Event Handlers**: Attributes starting with \`on\` (e.g., \`onclick\`) are event handlers, not reactive

## Common Patterns

\`\`\`typescript
// Reactive content
h.div([state], () => \`Value: \${state.value}\`);

// Reactive attributes
h.div([state], {
  class: () => (state.active ? "active" : "inactive"),
  style: () => ({ color: state.color }),
});

// Event handler
h.button(
  {
    onclick: () => {
      state.count++;
      h.update(state);
    },
  },
  "Click"
);

// Conditional rendering
h.if(
  [state], // Dependencies array
  () => state.show, // Condition function (returns truthy/falsy)
  () => h.div("Visible"), // Render function when condition is true
  () => h.div("Hidden") // Optional: render function when condition is false
);
// Without else: returns hidden span when condition is false

// List rendering
h.list(
  [items, otherState], // First dep MUST be the array to render, other deps are optional
  (item, index) => h.div([item], () => \`Item: \${item}\`) // Each item can have its own dependencies
);
// When items.length changes, list re-renders
// Individual items update when their own dependencies change

// Bind to existing element
h.element(existingDiv)([state], () => state.text);
\`\`\`

## Special Methods

- \`h.update(state)\` - Manually trigger update for state
- \`h.onUpdate(callback)\` - Register update callback
- \`h.css(styles)\` - Inject CSS into head
- \`h.innerHTML(html)\` - Render HTML string
- \`h.if(deps, condition, renderFn, elseRenderFn?)\` - Conditional rendering
  - \`deps\`: Dependencies array
  - \`condition\`: Function returning truthy/falsy
  - \`renderFn\`: Function returning element when condition is true
  - \`elseRenderFn\`: Optional function returning element when condition is false (if omitted, returns hidden span)
- \`h.list(deps, renderFn)\` - List rendering
  - **First dependency MUST be the array to render** (e.g., \`[items, otherState]\` where \`items\` is the list)
  - Other dependencies are optional and shared across all items
  - \`renderFn(value, index)\`: Function that returns element for each item
  - **Each item element can have its own dependencies** (e.g., \`h.div([item], ...)\` makes each item reactive to its own data)
  - List re-renders when array length changes
  - Individual items update when their own dependencies change
- \`h.element(element)\` - Bind reactive properties to existing element

## Important Notes

- Multiple \`h.update()\` calls in same frame are batched
- Falsy values (\`false\`, \`null\`, \`undefined\`, \`NaN\`, \`''\`) don't render
- Custom tags: \`h["custom-tag"]()\` works, but reserved methods don't: \`update\`, \`onUpdate\`, \`list\`, \`if\`, \`css\`, \`innerHTML\`, \`element\`
- **TypeScript**: For custom tags, use type assertion: \`h["iconify-icon" as "div"]({ ... })\` to avoid type errors
- Elements must be in DOM for updates to work`;

	// Modal component
	const modal = h.div(
		[modalState],
		{
			class: () => `doc-modal-overlay ${modalState.isOpen ? "open" : ""}`,
			onclick: (e: MouseEvent) => {
				if (e.target === e.currentTarget) {
					modalState.isOpen = false;
					h.update(modalState);
				}
			},
		},
		h.div(
			{ class: "doc-modal" },
			h.div(
				{ class: "doc-modal-header" },
				h.h2({ class: "doc-modal-title" }, "CLAUDE.md"),
				h.div(
					{ class: "doc-modal-actions" },
					h.button(
						{
							class: "doc-modal-copy",
							onclick: async (e: MouseEvent) => {
								try {
									await navigator.clipboard.writeText(claudeMdContent);
									// Show feedback
									const btn = e.target as HTMLElement;
									if (btn) {
										const originalText = btn.textContent;
										btn.textContent = "✓";
										setTimeout(() => {
											btn.textContent = originalText;
										}, 1000);
									}
								} catch (err) {
									console.error("Failed to copy:", err);
								}
							},
						},
						"📋",
					),
					h.button(
						{
							class: "doc-modal-close",
							onclick: () => {
								modalState.isOpen = false;
								h.update(modalState);
							},
						},
						"×",
					),
				),
			),
			h.pre(
				{
					class: "doc-modal-content",
					style: {
						whiteSpace: "pre-wrap",
						wordWrap: "break-word",
						overflowWrap: "break-word",
						fontFamily: "Consolas, Monaco, 'Courier New', monospace",
						fontSize: "14px",
						lineHeight: "1.6",
					},
				},
				h.code(claudeMdContent),
			),
		),
	);

	// Language switcher and Claude button
	const langSwitcher = h.div(
		{ class: "doc-lang-switcher" },
		h.button(
			{
				class: "doc-claude-button",
				onclick: () => {
					modalState.isOpen = true;
					h.update(modalState);
				},
			},
			"CLAUDE.md",
		),
		h.button(
			[langState],
			{
				class: "doc-lang-button",
				onclick: () => {
					langState.current = langState.current === "zh" ? "en" : "zh";
					h.update(langState);
					updateTitle();
				},
			},
			() => t("switchLang"),
		),
	);

	return h.div(
		{ class: "doc-container" },
		langSwitcher,
		modal,
		// Header
		h.div(
			[langState],
			{ class: "doc-header" },
			h.h1({ class: "doc-title" }, () => t("title")),
			h.p({ class: "doc-subtitle" }, () => t("subtitle")),
		),
		// Getting Started - Combined intro, state, basic tags, reactive content
		createExampleSection(
			"gettingStarted",
			`import { h } from "zeroeffect";

// State is just a plain JavaScript object
const state = { count: 0 };

// Create elements with reactive content
// First parameter [state] is dependencies array
const app = h.div(
	{ class: "space-y-4" },
	h.div(
		[state],
		{ class: "text-xl font-bold" },
		() => \`Count: \${state.count}\`
	),
	h.button(
		{
			class: "px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600",
			onclick: () => {
				state.count++;
				h.update(state);
			}
		},
		"Increment"
	)
);

document.body.append(app);`,
			() => {
				const state = exampleStates.gettingStarted as { count: number };
				return h.div(
					{ class: "space-y-4" },
					h.div(
						[state],
						{ class: "text-xl font-bold" },
						() => `Count: ${state.count}`,
					),
					h.button(
						{
							class:
								"px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600",
							onclick: () => {
								state.count++;
								h.update(state);
							},
						},
						"Increment",
					),
				);
			},
		),
		// Reactive Attributes
		createExampleSection(
			"reactiveAttributes",
			`import { h } from "zeroeffect";

const state = { name: "John" };

const app = h.div(
	{ class: "space-y-4" },
	h.div(
		[state],
		{
			class: () =>
				state.name === "Jane"
					? "text-red-500 font-bold"
					: "text-blue-500 font-bold",
			onclick: () => {
				state.name = state.name === "John" ? "Jane" : "John";
				h.update(state);
			}
		},
		() => \`Name: \${state.name} (Click to toggle)\`
	)
);

document.body.append(app);`,
			() => {
				const state = exampleStates.reactiveAttributes as { name: string };
				return h.div(
					{ class: "space-y-4" },
					h.div(
						[state],
						{
							class: () =>
								state.name === "Jane"
									? "text-red-500 font-bold"
									: "text-blue-500 font-bold",
							onclick: () => {
								state.name = state.name === "John" ? "Jane" : "John";
								h.update(state);
							},
						},
						() => `Name: ${state.name} (Click to toggle)`,
					),
				);
			},
		),
		// Style Objects and Functions
		createExampleSection(
			"style",
			`import { h } from "zeroeffect";

const state = { count: 0 };

const app = h.div(
	{ class: "space-y-4" },
	// Style object
	h.div(
		{
			style: {
				backgroundColor: "red",
				color: "white",
				padding: "10px",
				borderRadius: "4px"
			}
		},
		"Styled div (static)"
	),
	// Style function
	h.div(
		[state],
		{
			style: () => ({
				backgroundColor: state.count % 2 === 0 ? "red" : "blue",
				color: "white",
				padding: "10px",
				borderRadius: "4px"
			})
		},
		() => \`Count: \${state.count} (dynamic style)\`
	),
	h.button(
		{
			class: "px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600",
			onclick: () => {
				state.count++;
				h.update(state);
			}
		},
		"Toggle"
	)
);

document.body.append(app);`,
			() => {
				const state = exampleStates.style as { count: number };
				return h.div(
					{ class: "space-y-4" },
					h.div(
						{
							style: {
								backgroundColor: "red",
								color: "white",
								padding: "10px",
								borderRadius: "4px",
							},
						},
						"Styled div (static)",
					),
					h.div(
						[state],
						{
							style: () => ({
								backgroundColor: state.count % 2 === 0 ? "red" : "blue",
								color: "white",
								padding: "10px",
								borderRadius: "4px",
							}),
						},
						() => `Count: ${state.count} (dynamic style)`,
					),
					h.button(
						{
							class:
								"px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600",
							onclick: () => {
								state.count++;
								h.update(state);
							},
						},
						"Toggle",
					),
				);
			},
		),
		// Conditional Rendering
		createExampleSection(
			"conditional",
			`import { h } from "zeroeffect";

const state = { count: 0 };

const app = h.div(
	{ class: "space-y-4" },
	h.div(
		[state],
		{ class: "text-lg font-bold mb-2" },
		() => \`Count: \${state.count}\`
	),
	// With else function
	h.if(
		[state],
		() => state.count % 2 === 0,
		() => h.div({ class: "text-green-600 font-bold" }, "Even"),
		() => h.div({ class: "text-red-600 font-bold" }, "Odd")
	),
	// Without else function (returns hidden span when false)
	h.if(
		[state],
		() => state.count % 2 === 0,
		() => h.div({ class: "text-blue-600" }, "I am even (no else)")
	),
	h.button(
		{
			class: "px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600",
			onclick: () => {
				state.count++;
				h.update(state);
			}
		},
		"Increment"
	)
);

document.body.append(app);`,
			() => {
				const state = exampleStates.conditional as { count: number };
				return h.div(
					{ class: "space-y-4" },
					h.div(
						[state],
						{ class: "text-lg font-bold mb-2" },
						() => `Count: ${state.count}`,
					),
					h.if(
						[state],
						() => state.count % 2 === 0,
						() => h.div({ class: "text-green-600 font-bold" }, "Even"),
						() => h.div({ class: "text-red-600 font-bold" }, "Odd"),
					),
					h.if(
						[state],
						() => state.count % 2 === 0,
						() => h.div({ class: "text-blue-600" }, "I am even (no else)"),
					),
					h.button(
						{
							class:
								"px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600",
							onclick: () => {
								state.count++;
								h.update(state);
							},
						},
						"Increment",
					),
				);
			},
		),
		// List Rendering
		createExampleSection(
			"list",
			`import { h } from "zeroeffect";

const list = [1, 2, 3, 4, 5];
const sharedState = { highlight: false };

// First dependency MUST be the array to render
// Other dependencies are optional and shared
const app = h.div(
	{ class: "space-y-4" },
	h.list(
		[list, sharedState],
		(value, index) =>
			h.div(
				[value],
				// Each item can have its own dependencies
				{
					class: "p-2 mb-2 bg-white border border-gray-200 rounded",
					style: () => ({
						backgroundColor: sharedState.highlight ? "#fef3c7" : "white"
					})
				},
				() => \`Item: \${value}, index: \${index}\`
			)
	),
	h.div(
		{ class: "flex flex-col sm:flex-row gap-2" },
		h.button(
			{
				class: "px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600",
				onclick: () => {
					list.push(list.length + 1);
					h.update(list);
				}
			},
			"Add Item"
		),
		h.button(
			{
				class: "px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600",
				onclick: () => {
					if (list.length > 0) {
						list.pop();
						h.update(list);
					}
				}
			},
			"Remove Item"
		),
		h.button(
			{
				class: "px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600",
				onclick: () => {
					sharedState.highlight = !sharedState.highlight;
					h.update(sharedState);
				}
			},
			"Toggle Highlight"
		)
	)
);

document.body.append(app);`,
			() => {
				const listState = exampleStates.list as { items: number[] };
				const sharedState = { highlight: false };
				return h.div(
					{ class: "space-y-4" },
					h.list(
						[listState.items, sharedState],
						(value: number, index: number) =>
							h.div(
								[value], // Each item has its own dependency on the item value
								{
									class: "p-2 mb-2 bg-white border border-gray-200 rounded",
									style: () => ({
										backgroundColor: sharedState.highlight
											? "#fef3c7"
											: "white",
									}),
								},
								() => `Item: ${value}, index: ${index}`,
							),
					),
					h.div(
						{ class: "flex flex-col sm:flex-row gap-2" },
						h.button(
							{
								class:
									"px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600",
								onclick: () => {
									listState.items.push(listState.items.length + 1);
									h.update(listState.items);
								},
							},
							"Add Item",
						),
						h.button(
							{
								class:
									"px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600",
								onclick: () => {
									if (listState.items.length > 0) {
										listState.items.pop();
										h.update(listState.items);
									}
								},
							},
							"Remove Item",
						),
						h.button(
							{
								class:
									"px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600",
								onclick: () => {
									sharedState.highlight = !sharedState.highlight;
									h.update(sharedState);
								},
							},
							"Toggle Highlight",
						),
					),
				);
			},
		),
		// h.element
		createExampleSection(
			"element",
			`import { h } from "zeroeffect";

const existingDiv = document.createElement("div");
const state = { count: 0 };

h.element(existingDiv)(
	[state],
	() => \`Count: \${state.count}\`
);

document.body.append(existingDiv);`,
			() => {
				const state = exampleStates.element as { count: number };
				const demoDiv = document.createElement("div");
				demoDiv.className = "p-2 border border-gray-300 rounded";
				h.element(demoDiv)([state], () => `Count: ${state.count}`);
				return demoDiv;
			},
		),
		// Todo List Example
		createExampleSection(
			"todo",
			`import { h } from "zeroeffect";

const todos = [];

// Input and add button
const inputGroup = h.div(
	h.input({
		id: "todo-input",
		type: "text",
		placeholder: "Enter todo item...",
		onkeydown: (e) => {
			if (e.key === "Enter") {
				const input = e.target;
				if (input.value.trim()) {
					todos.push({
						id: Date.now(),
						text: input.value.trim(),
						completed: false,
						renderTime: new Date().toLocaleTimeString()
					});
					input.value = "";
					h.update(todos);
				}
			}
		}
	}),
	h.button({
		onclick: () => {
			const input = document.getElementById(
				"todo-input"
			);
			if (input?.value.trim()) {
				todos.push({
					id: Date.now(),
					text: input.value.trim(),
					completed: false,
					renderTime: new Date().toLocaleTimeString()
				});
				input.value = "";
				h.update(todos);
			}
		}
	}, "Add")
);

// Render todo list
const todoList = h.list(
	[todos],
	(todo, index) =>
		h.div(
			[todo],
			{
				style: () => ({
					opacity: todo.completed ? 0.6 : 1,
					textDecoration: todo.completed
						? "line-through"
						: "none"
				})
			},
			h.input([todo], {
				type: "checkbox",
				checked: () => todo.completed,
				onchange: () => {
					todo.completed = !todo.completed;
					h.update(todos);
				}
			}),
			h.input([todo], {
				type: "text",
				value: () => todo.text,
				onblur: () => h.update(todo)
			}),
			h.span([todo], { class: "text-xs text-gray-500" }, () =>
				\`Rendered: \${todo.renderTime}\`
			),
			h.button({
				onclick: () => {
					todo.renderTime = new Date().toLocaleTimeString();
					h.update(todo);
				}
			}, "Re-render"),
			h.button({
				onclick: () => {
					todos.splice(index, 1);
					h.update(todos);
				}
			}, "Delete")
		)
);

const app = h.div({ class: "space-y-4" }, inputGroup, todoList);
document.body.append(app);`,
			() => {
				const todoState = exampleStates.todo as {
					todos: Array<{
						id: number;
						text: string;
						completed: boolean;
						renderTime: string;
					}>;
				};

				return h.div(
					{ class: "space-y-4" },
					h.div(
						{ class: "flex flex-col sm:flex-row gap-2 mb-4" },
						h.input({
							id: "doc-todo-input",
							type: "text",
							placeholder: "Enter todo item...",
							class: "flex-1 px-3 py-2 border border-gray-300 rounded text-sm",
							onkeydown: (e: KeyboardEvent) => {
								if (e.key === "Enter") {
									const input = e.target as HTMLInputElement;
									if (input.value.trim()) {
										todoState.todos.push({
											id: Date.now(),
											text: input.value.trim(),
											completed: false,
											renderTime: new Date().toLocaleTimeString(),
										});
										input.value = "";
										h.update(todoState.todos);
									}
								}
							},
						}),
						h.button(
							{
								class:
									"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap",
								onclick: () => {
									const input = document.getElementById(
										"doc-todo-input",
									) as HTMLInputElement;
									if (input?.value.trim()) {
										todoState.todos.push({
											id: Date.now(),
											text: input.value.trim(),
											completed: false,
											renderTime: new Date().toLocaleTimeString(),
										});
										input.value = "";
										h.update(todoState.todos);
									}
								},
							},
							"Add",
						),
					),
					h.list(
						[todoState.todos],
						(
							todo: {
								id: number;
								text: string;
								completed: boolean;
								renderTime: string;
							},
							index: number,
						) =>
							h.div(
								[todo],
								{
									class:
										"flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 mb-2 border border-gray-200 rounded",
									style: () => ({
										opacity: todo.completed ? 0.6 : 1,
										textDecoration: todo.completed ? "line-through" : "none",
									}),
								},
								h.input([todo], {
									type: "checkbox",
									checked: () => todo.completed,
									onchange: () => {
										todo.completed = !todo.completed;
										h.update(todoState.todos);
									},
								}),
								h.span([todo], { class: "flex-1 text-sm" }, () => todo.text),
								h.span(
									[todo],
									{ class: "text-xs text-gray-500" },
									() => `Rendered: ${todo.renderTime}`,
								),
								h.button(
									{
										class:
											"px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm whitespace-nowrap",
										onclick: () => {
											todo.renderTime = new Date().toLocaleTimeString();
											h.update(todo);
										},
									},
									"Re-render",
								),
								h.button(
									{
										class:
											"px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm whitespace-nowrap",
										onclick: () => {
											todoState.todos.splice(index, 1);
											h.update(todoState.todos);
										},
									},
									"Delete",
								),
							),
					),
				);
			},
		),
		// CSS Injection (moved to end)
		createExampleSection(
			"css",
			`import { h } from "zeroeffect";

h.css(\`
	.text-red-500 {
		color: red;
	}
	.text-blue-500 {
		color: blue;
	}
\`);

const app = h.div(
	h.p({ class: "text-red-500" }, "This is red text"),
	h.p({ class: "text-blue-500" }, "This is blue text")
);

document.body.append(app);`,
			() =>
				h.div(
					h.p({ class: "text-red-500" }, "This is red text"),
					h.p({ class: "text-blue-500" }, "This is blue text"),
				),
		),
		// Custom Tags (moved to end)
		createExampleSection(
			"customTags",
			`import { h } from "zeroeffect";

// Custom tags are supported
// In TypeScript, use type assertion to avoid type errors
const app = h.div(
	{ class: "space-y-4" },
	h["iconify-icon" as "div"]({
		icon: "material-symbols:agriculture",
		style: { fontSize: "48px" }
	}),
	h.div({ class: "text-sm text-gray-600" }, "Iconify icon above")
);

document.body.append(app);`,
			() =>
				h.div(
					{ class: "space-y-4" },
					(() => {
						const iconFn = h["iconify-icon"];
						return iconFn
							? iconFn({
									icon: "material-symbols:agriculture",
									style: { fontSize: "48px" },
								})
							: h.div("Iconify icon");
					})(),
					h.div({ class: "text-sm text-gray-600" }, "Iconify icon above"),
				),
		),
		// innerHTML (moved to end)
		createExampleSection(
			"innerHTML",
			`import { h } from "zeroeffect";

const app = h.div(
	{ class: "flex items-center gap-2" },
	h.innerHTML(
		\`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2m3.3 14.71L11 12.41V7h2v4.59l3.71 3.71z"/></svg>\`
	),
	h.span("SVG rendered via innerHTML")
);

document.body.append(app);`,
			() =>
				h.div(
					{ class: "flex items-center gap-2" },
					h.innerHTML(
						`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2m3.3 14.71L11 12.41V7h2v4.59l3.71 3.71z"/></svg>`,
					),
					h.span("SVG rendered via innerHTML"),
				),
		),
		// Falsy Values (moved to end)
		createExampleSection(
			"falsy",
			`import { h } from "zeroeffect";

const state = { show: true };

const app = h.div(
	{ class: "space-y-2" },
	h.div([state], () => (state.show ? "Visible" : false)),
	h.div("false"),
	h.div(0),
	h.div("0"),
	h.button(
		{
			class: "px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600",
			onclick: () => {
				state.show = !state.show;
				h.update(state);
			}
		},
		() => (state.show ? "Hide" : "Show")
	)
);

document.body.append(app);`,
			() => {
				const state = exampleStates.falsy as { show: boolean };
				return h.div(
					{ class: "space-y-2" },
					h.div([state], () => (state.show ? "Visible" : false)),
					h.div("false"),
					h.div(0),
					h.div("0"),
					h.button(
						{
							class:
								"px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600",
							onclick: () => {
								state.show = !state.show;
								h.update(state);
							},
						},
						() => (state.show ? "Hide" : "Show"),
					),
				);
			},
		),
	);
};

// Initialize Prism.js highlighting
function highlightCode() {
	if (typeof window !== "undefined" && "Prism" in window) {
		const prism = (window as { Prism?: { highlightAll: () => void } }).Prism;
		prism?.highlightAll();
	}
}

// Wait for DOM to be ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		const root = document.getElementById("root");
		if (root) {
			root.appendChild(DocumentPage());
			// Set initial title
			document.title = translations[langState.current].title;
			// Highlight code after a short delay to ensure Prism is loaded
			setTimeout(highlightCode, 100);
			// Also highlight on language change
			h.onUpdate(() => {
				setTimeout(highlightCode, 50);
			});
		}
	});
} else {
	const root = document.getElementById("root");
	if (root) {
		root.appendChild(DocumentPage());
		// Set initial title
		document.title = translations[langState.current].title;
		// Highlight code after a short delay
		setTimeout(highlightCode, 100);
		// Also highlight on language change
		h.onUpdate(() => {
			setTimeout(highlightCode, 50);
		});
	}
}
