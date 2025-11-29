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
		lifecycle: {
			title: "生命周期管理",
			content:
				"zeroeffect 提供完整的生命周期管理：h.onMount() 在元素挂载时触发，h.onUpdate() 在状态更新时触发，h.onRemove() 在元素移除时触发。配合 h.ref() 可以实现完整的组件生命周期。",
		},
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
				"使用 h.list() 渲染列表。第一个参数是数据列表数组。第二个参数是渲染函数，接收 value 和 index。当列表长度变化时：新增 item 时不会重新渲染现有元素，只添加新元素；删除 item 时会重新渲染整个列表（这是为了简化使用，不需要 key，并且索引一直是正确的）。每个列表项元素可以有自己的依赖，当这些依赖变化时，只有对应的项会更新。",
		},
		virtualList: {
			title: "虚拟列表",
			content:
				'使用 h.virtualList() 渲染大量数据（10万+）。第一个参数是数据列表数组。第二个参数是容器属性（如 class、style）。第三个参数是渲染函数，接收 value 和 index。第四个参数是配置选项：itemHeight（固定高度、函数 (index) => number，或 "auto" 表示动态高度）、containerHeight（可选，默认使用父容器高度）、overscan（可选，预渲染项目数，默认5）、estimatedItemHeight（可选，动态高度模式的初始估算高度，默认50）。只渲染可见区域的项目，性能优异。数据变化时调用 h.update(items) 自动更新。',
		},
		element: {
			title: "绑定已有元素",
			content:
				"使用 h.ref() 可以给已有的 DOM 元素绑定响应式属性和依赖。也可以为新创建的元素绑定响应式属性。",
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
				"支持自定义标签，如 h['iconify-icon']。在 TypeScript 中，建议使用类型断言 h['iconify-icon' as 'div'] 来避免类型错误。只有白名单里的方法不会解析成标签函数：update, onUpdate, list, if, css, innerHTML, element, virtualList。",
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
		switchLang: "Chinese",
		lifecycle: {
			title: "Lifecycle Management",
			content:
				"zeroeffect provides complete lifecycle management: h.onMount() triggers when element is mounted, h.onUpdate() triggers on state updates, h.onRemove() triggers when element is removed. Combined with h.ref() for complete component lifecycle.",
		},
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
				"Use h.list() to render lists. The first parameter is the data list array. The second parameter is a render function that receives value and index. When list length changes: adding items does NOT re-render existing elements, only new items are added; removing items re-renders the entire list (this simplifies usage - no key needed, and indices are always correct). Each list item element can have its own dependencies - when those dependencies change, only that specific item updates.",
		},
		virtualList: {
			title: "Virtual List",
			content:
				'Use h.virtualList() to render large datasets (100k+ items). First parameter is the data list array. Second parameter is container attributes (e.g., class, style). Third parameter is render function (value, index). Fourth parameter is options: itemHeight (fixed number, function (index) => number, or "auto" for dynamic height), containerHeight (optional, defaults to parent), overscan (optional, default 5), estimatedItemHeight (optional, initial estimate for dynamic height mode, default 50). Only renders visible items for performance. Automatically updates when data changes via h.update(items).',
		},
		element: {
			title: "Binding Existing Elements",
			content:
				"Use h.ref() to bind reactive attributes and dependencies to existing DOM elements. Can also bind reactive properties to newly created elements.",
		},
		onUpdate: {
			title: "Update Callbacks",
			content:
				"Use h.onUpdate() to register update callbacks. Two usages: h.onUpdate(callback) for global update callbacks; h.onUpdate(element, callback) for element-specific callbacks with automatic cleanup when element is removed.",
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
				"Custom tags are supported, like h['iconify-icon']. In TypeScript, use type assertion h['iconify-icon' as 'div'] to avoid type errors. Only whitelisted methods won't be parsed as tag functions: update, onUpdate, list, if, css, innerHTML, element, virtualList.",
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
	lifecycle: { count: 0 },
	gettingStarted: { count: 0 },
	reactiveAttributes: { name: "John" },
	style: { count: 0 },
	conditional: { count: 0 },
	list: { items: [1, 2, 3, 4, 5] },
	virtualList: {
		items: Array.from({ length: 10_000 }, (_, i) => ({
			id: i,
			name: `Item ${i}`,
			value: Math.floor(Math.random() * 1000),
			lines: Math.floor(Math.random() * 5) + 1, // 1-5 行随机内容
		})),
	},
	element: { count: 0 },
	onUpdate: { count: 0, name: "John" },
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
		max-height: 600px;
		overflow-y: auto;
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
		max-height: 600px;
		overflow-y: auto;
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
		.doc-items-center-sm {
			align-items: center;
		}
	}
	
	/* Semantic classes for examples */
	.space-y-4 > * + * {
		margin-top: 1rem;
	}
	.space-y-2 > * + * {
		margin-top: 0.5rem;
	}
	
	.title-xl {
		font-size: 1.25rem;
		line-height: 1.75rem;
		font-weight: 700;
	}
	.title-lg {
		font-size: 1.125rem;
		line-height: 1.75rem;
		font-weight: 700;
	}
	.text-sm {
		font-size: 0.875rem;
		line-height: 1.25rem;
	}
	.text-xs {
		font-size: 0.75rem;
		line-height: 1rem;
	}
	.text-gray {
		color: #4b5563;
	}
	.text-gray-dark {
		color: #1f2937;
	}
	.text-red {
		color: #dc2626;
	}
	.text-green {
		color: #16a34a;
	}
	.text-blue {
		color: #2563eb;
	}
	.text-blue-dark {
		color: #1e40af;
	}
	.font-bold {
		font-weight: 700;
	}
	.font-semibold {
		font-weight: 600;
	}
	
	/* Buttons */
	.green-button {
		padding: 0.5rem 1rem;
		background-color: #22c55e;
		color: white;
		border-radius: 0.25rem;
		border: none;
		cursor: pointer;
	}
	.green-button:hover {
		background-color: #16a34a;
	}
	.red-button {
		padding: 0.5rem 1rem;
		background-color: #ef4444;
		color: white;
		border-radius: 0.25rem;
		border: none;
		cursor: pointer;
	}
	.red-button:hover {
		background-color: #dc2626;
	}
	.blue-button {
		padding: 0.5rem 1rem;
		background-color: #3b82f6;
		color: white;
		border-radius: 0.25rem;
		border: none;
		cursor: pointer;
	}
	.blue-button:hover {
		background-color: #2563eb;
	}
	.purple-button {
		padding: 0.5rem 1rem;
		background-color: #a855f7;
		color: white;
		border-radius: 0.25rem;
		border: none;
		cursor: pointer;
	}
	.purple-button:hover {
		background-color: #9333ea;
	}
	.teal-button {
		padding: 0.5rem 1rem;
		background-color: #14b8a6;
		color: white;
		border-radius: 0.25rem;
		border: none;
		cursor: pointer;
	}
	.teal-button:hover {
		background-color: #0d9488;
	}
	.yellow-button {
		padding: 0.25rem 0.75rem;
		background-color: #eab308;
		color: white;
		border-radius: 0.25rem;
		border: none;
		cursor: pointer;
		font-size: 0.875rem;
	}
	.yellow-button:hover {
		background-color: #ca8a04;
	}
	.pink-button {
		padding: 0.5rem 1rem;
		background-color: #ec4899;
		color: white;
		border-radius: 0.25rem;
		border: none;
		cursor: pointer;
	}
	.pink-button:hover {
		background-color: #db2777;
	}
	.red-button-sm {
		padding: 0.25rem 0.75rem;
		background-color: #ef4444;
		color: white;
		border-radius: 0.25rem;
		border: none;
		cursor: pointer;
		font-size: 0.875rem;
	}
	.red-button-sm:hover {
		background-color: #dc2626;
	}
	
	/* Components */
	.card {
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		background-color: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
	}
	.list-item {
		padding: 0.75rem;
		border-bottom: 1px solid #e5e7eb;
	}
	.list-item:hover {
		background-color: #f9fafb;
	}
	.badge {
		padding: 0.25rem 0.5rem;
		background-color: #dbeafe;
		color: #1e40af;
		border-radius: 0.25rem;
		font-size: 0.875rem;
	}
	.input {
		flex: 1 1 0%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.25rem;
		font-size: 0.875rem;
	}
	
	/* Layout */
	.flex-row {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: center;
	}
	.flex-col {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.flex-between {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.flex-center {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.flex-1 {
		flex: 1 1 0%;
	}
	.ml-2 {
		margin-left: 0.5rem;
	}
	.mb-2 {
		margin-bottom: 0.5rem;
	}
	.mb-4 {
		margin-bottom: 1rem;
	}
	.nowrap {
		white-space: nowrap;
	}
	
	@media (min-width: 640px) {
		.flex-row-sm {
			flex-direction: row;
		}
		.flex-col-sm {
			flex-direction: column;
		}
	}
`);

// Create example section component
function createExampleSection(
	id: string,
	codeExample: string,
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
						codeExample,
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

Document: https://zeroeffect.vercel.app/

## Core Concept

No Signal, no Proxy, no Virtual DOM.

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

// No update
h.div([], {
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
  items, // First parameter is the data list array
  (item, index) => h.div([item], () => \`Item: \${item}\`) // Render function
);
// When items.length changes, list re-renders
// Individual items update when their own dependencies change

// Virtual list (for large datasets, 100k+ items)
h.virtualList(
  items, // First parameter is the data list array
  { class: "h-full overflow-y-auto" }, // Container attributes - REQUIRED
  (item, index) => h.div([item], () => \`Item: \${item}\`) // Render function
);

// h.ref - Bind reactive properties to elements
// Pattern 1: Bind to newly created element
const div = h.div();
h.ref(div)(
  [state],
  { class: "text-2xl" },
  () => \`Count: \${state.count}\`
);

// Pattern 2: Bind to existing element
const existingDiv = document.getElementById("my-div");
h.ref(existingDiv)([state], () => state.content);

// h.onUpdate - Register update callbacks
// Pattern 1: Element-specific callback with lifecycle management (classic pattern)
const App = () => {
  const div = h.div();
  const state = { count: 0 };

  h.onUpdate(div, () => {
    console.log("State updated");
  });

  h.onMount(div, () => {
    console.log("Element mounted");
  });

  h.onRemove(div, () => {
    console.log("Element removed");
  });

  return h.ref(div)([state], { onclick: () => {
    state.count++;
    h.update(state);
  }}, () => \`Count: \${state.count}\`);
};

// Pattern 2: Global callback (returns unsubscribe function)
const unsubscribe = h.onUpdate(() => {
  console.log("Any state update!");
});
// Later: unsubscribe() to stop listening
\`\`\`

## Special Methods

- \`h.update(state)\` - Manually trigger update for state
- \`h.onUpdate(callback | element, callback?)\` - Register update callback
  - \`h.onUpdate(callback)\`: Global update callback, returns unsubscribe function
  - \`h.onUpdate(element, callback)\`: Element-specific callback, auto-cleanup on remove
- \`h.css(styles)\` - Inject CSS into head
- \`h.innerHTML(html)\` - Render HTML string
- \`h.if(deps, condition, renderFn, elseRenderFn?)\` - Conditional rendering
  - \`deps\`: Dependencies array
  - \`condition\`: Function returning truthy/falsy
  - \`renderFn\`: Function returning element when condition is true
  - \`elseRenderFn\`: Optional function returning element when condition is false (if omitted, returns hidden span)
- \`h.list(dataList, renderFn)\` - List rendering
  - **First parameter MUST be the data list array**
  - \`renderFn(value, index)\`: Function that returns element for each item
  - **Each item element can have its own dependencies** (e.g., \`h.div([item], ...)\` makes each item reactive to its own data)
  - List re-renders when array length changes
  - Individual items update when their own dependencies change
- \`h.virtualList(items, attrs, renderFn, options?)\` - Virtual list for large datasets (100k+ items)
  - Dynamic height mode: measures actual rendered heights and caches them for accurate scrolling
- \`h.ref(element)\` - Bind reactive properties to existing or new elements

## Important Notes

- Multiple \`h.update()\` calls in same frame are batched
- Falsy values (\`false\`, \`null\`, \`undefined\`, \`NaN\`, \`''\`) don't render
- Custom tags: \`h["custom-tag"]()\` works, but reserved methods don't: \`update\`, \`onUpdate\`, \`list\`, \`if\`, \`css\`, \`innerHTML\`, \`ref\`, \`virtualList\`
- **TypeScript**: For custom tags, use type assertion: \`h["iconify-icon" as "div"]({ ... })\` to avoid type errors
- Elements must be in DOM for updates to work
- Don't call \`h.update()\` inside \`h.onUpdate\` callbacks (causes circular calls!)`;

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
			{
				class: "doc-claude-button",
				onclick: () => {
					window.open("https://github.com/ymzuiku/zeroeffect", "_blank");
				},
			},
			"GitHub",
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
		// Lifecycle Management - Complete component lifecycle example
		createExampleSection(
			"lifecycle",
			`import { h } from "zeroeffect";

// Classic component pattern with complete lifecycle management
const App = ()=>{
  const div = h.div();
  const state = {
    count:0
  }

  // Register lifecycle callbacks
  h.onUpdate(div, ()=>{
    console.log('on state update')
  })

  h.onMount(div, ()=>{
    console.log('on div mount')
  })

  h.onRemove(div, ()=>{
    console.log('on div remove')
  })

  const handleOnClick = ()=>{
    state.count++;
    h.update(state)
  }

  // Bind reactive properties to the element
  return h.ref(div)([state], { class: 'primary', onclick: handleOnClick }, () => \`Count: \${state.count}\`);
}

document.body.append(App());`,
			() => {
				const state = exampleStates.lifecycle as { count: number };

				const div = h.div();

				// Register lifecycle callbacks
				h.onUpdate(div, () => {
					console.log("on state update");
				});

				h.onMount(div, () => {
					console.log("on div mount");
				});

				h.onRemove(div, () => {
					console.log("on div remove");
				});

				const handleOnClick = () => {
					state.count++;
					h.update(state);
				};

				// Bind reactive properties to the element
				const app = h.ref(div)(
					[state],
					{
						class: "title-lg mb-2 green-button",
						onclick: handleOnClick,
					},
					() => `Count: ${state.count}`,
				);

				return h.div(
					{ class: "space-y-2" },
					app,
					h.div(
						{ class: "text-sm text-gray" },
						"Complete lifecycle: onMount → onUpdate → onRemove",
					),
				);
			},
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
		{ class: "title-xl" },
		() => \`Count: \${state.count}\`
	),
	h.button(
		{
			class: "green-button",
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
					h.div([state], { class: "title-xl" }, () => `Count: ${state.count}`),
					h.button(
						{
							class: "green-button",
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
					? "text-red font-bold"
					: "text-blue font-bold",
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
									? "text-red font-bold"
									: "text-blue font-bold",
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
		// Conditional Rendering
		createExampleSection(
			"conditional",
			`import { h } from "zeroeffect";

const state = { count: 0 };

const app = h.div(
	{ class: "space-y-4" },
	h.div(
		[state],
		{ class: "title-lg mb-2" },
		() => \`Count: \${state.count}\`
	),
	// With else function
	h.if(
		[state],
		() => state.count % 2 === 0,
		() => h.div({ class: "text-green font-bold" }, "Even"),
		() => h.div({ class: "text-red font-bold" }, "Odd")
	),
	// Without else function (returns hidden span when false)
	h.if(
		[state],
		() => state.count % 2 === 0,
		() => h.div({ class: "text-blue" }, "I am even (no else)")
	),
	h.button(
		{
			class: "teal-button",
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
						{ class: "title-lg mb-2" },
						() => `Count: ${state.count}`,
					),
					h.if(
						[state],
						() => state.count % 2 === 0,
						() => h.div({ class: "text-green font-bold" }, "Even"),
						() => h.div({ class: "text-red font-bold" }, "Odd"),
					),
					h.if(
						[state],
						() => state.count % 2 === 0,
						() => h.div({ class: "text-blue" }, "I am even (no else)"),
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
// Note: Adding items does NOT re-render existing elements (only new items are added)
//       Removing items re-renders the entire list (simplifies usage - no key needed, indices are always correct)
const app = h.div(
	{ class: "space-y-4" },
	h.list(
		[list, sharedState],
		(value, index) =>
			h.div(
				[value],
				// Each item can have its own dependencies
				{
					class: "card",
					style: () => ({
						backgroundColor: sharedState.highlight ? "#fef3c7" : "white"
					})
				},
				() => \`Item: \${value}, index: \${index}\`
			)
	),
	h.div(
		{ class: "flex-col flex-row-sm" },
		h.button(
			{
				class: "green-button",
				onclick: () => {
					list.push(list.length + 1);
					h.update(list);
					// Adding item: existing elements won't re-render
				}
			},
			"Add Item"
		),
		h.button(
			{
				class: "red-button",
				onclick: () => {
					if (list.length > 0) {
						list.pop();
						h.update(list);
						// Removing item: entire list will re-render
						// (simplifies usage - no key needed, indices are always correct)
					}
				}
			},
			"Remove Item"
		),
		h.button(
			{
				class: "yellow-button",
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
					h.list(listState.items, (value: number, index: number) =>
						h.div(
							[value], // Each item has its own dependency on the item value
							{
								class:
									"doc-p-2 doc-mb-2 doc-bg-white doc-border doc-border-gray-200 doc-rounded",
								style: () => ({
									backgroundColor: sharedState.highlight ? "#fef3c7" : "white",
								}),
							},
							() => `Item: ${value}, index: ${index}`,
						),
					),
					h.div(
						{ class: "flex-col flex-row-sm" },
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
		// Virtual List Rendering
		createExampleSection(
			"virtualList",
			`import { h } from "zeroeffect";

const items = Array.from({ length: 100000 }, (_, i) => ({
	id: i,
	name: \`Item \${i}\`,
	value: Math.floor(Math.random() * 1000),
	lines: Math.floor(Math.random() * 5) + 1 // 1-5 lines of random content
}));

// Virtual list for large datasets (100k+ items)
// Only renders visible items for performance
const app = h.div(
	{ class: "space-y-4" },
	h.div(
		{ class: "flex-center mb-4" },
		h.button(
			{
				class: "green-button",
				onclick: () => {
					const newId = items.length;
					items.push({
						id: newId,
						name: \`Item \${newId}\`,
						value: Math.floor(Math.random() * 1000),
						lines: Math.floor(Math.random() * 5) + 1
					});
					h.update(items);
				}
			},
			"Add Item"
		),
		h.button(
			{
				class: "red-button",
				onclick: () => {
					if (items.length > 0) {
						items.pop();
						h.update(items);
					}
				}
			},
			"Remove Last"
		),
		h.span(
			[items],
			{ class: "text-sm font-semibold" },
			() => \`Total: \${items.length.toLocaleString()} items\`
		)
	),
	h.virtualList(
		[items],
		{ class: "h-full overflow-y-auto" },
		(item, index) =>
			h.div(
				[item],
				{
					class: "list-item",
					style: () => ({
						backgroundColor: index % 2 === 0 ? "#f9fafb" : "#ffffff"
					})
				},
				h.div(
					{ class: "flex-between mb-2" },
					h.div(
						{ class: "flex-1" },
						h.span({ class: "font-semibold text-gray-dark" }, \`#\${item.id}\`),
						h.span({ class: "ml-2 text-gray" }, item.name)
					),
					h.div(
						{ class: "flex-center" },
						h.span(
							{
								class: "badge"
							},
							\`Value: \${item.value}\`
						),
						h.button(
							{
								class: "red-button-sm",
								onclick: () => {
									const itemIndex = items.findIndex(i => i.id === item.id);
									if (itemIndex !== -1) {
										items.splice(itemIndex, 1);
										h.update(items);
									}
								}
							},
							"Delete"
						)
					)
				),
				// 根据 lines 属性显示不同数量的内容行
				...Array.from({ length: item.lines }, (_, i) =>
					h.p(
						{ class: "text-sm text-gray mb-1" },
						\`Line \${i + 1} of \${item.lines}: This is dynamic content that makes each item have different heights.\`
					)
				)
			)
	)
);

document.body.append(app);`,
			() => {
				const virtualListState = exampleStates.virtualList as {
					items: Array<{
						id: number;
						name: string;
						value: number;
						lines: number;
					}>;
				};
				return h.div(
					{ class: "space-y-4 flex-1 h-[500px] flex flex-col" },
					h.div(
						{
							class:
								"doc-flex doc-flex-col doc-flex-row-sm doc-gap-2 doc-items-center doc-mb-4",
						},
						h.button(
							{
								class:
									"px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 whitespace-nowrap",
								onclick: () => {
									const newId = virtualListState.items.length;
									virtualListState.items.push({
										id: newId,
										name: `Item ${newId}`,
										value: Math.floor(Math.random() * 1000),
										lines: Math.floor(Math.random() * 5) + 1,
									});
									h.update(virtualListState.items);
								},
							},
							"Add Item",
						),
						h.button(
							{
								class:
									"px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 whitespace-nowrap",
								onclick: () => {
									if (virtualListState.items.length > 0) {
										virtualListState.items.pop();
										h.update(virtualListState.items);
									}
								},
							},
							"Remove Last",
						),
						h.span(
							[virtualListState.items],
							{ class: "text-sm font-semibold" },
							() =>
								`Total: ${virtualListState.items.length.toLocaleString()} items`,
						),
					),
					// h.div({ class: "flex-1 none bg-red-600" }, "flex-1 none"),
					h.virtualList(
						virtualListState.items,
						{ class: "flex-1" },
						(item, index) => {
							return h.div(
								[item],
								{
									class: "list-item",
									style: () => ({
										backgroundColor: index % 2 === 0 ? "#f9fafb" : "#ffffff",
									}),
								},
								h.div(
									{ class: "flex-between mb-2" },
									h.div(
										{ class: "flex-1" },
										h.span(
											{ class: "font-semibold text-gray-dark" },
											`#${item.id}`,
										),
										h.span({ class: "ml-2 text-gray" }, item.name),
									),
									h.div(
										{ class: "flex-center" },
										h.span(
											{
												class: "badge",
											},
											`Value: ${item.value}`,
										),
										h.button(
											{
												class: "red-button-sm",
												onclick: () => {
													const itemIndex = virtualListState.items.findIndex(
														(i) => i.id === item.id,
													);
													if (itemIndex !== -1) {
														virtualListState.items.splice(itemIndex, 1);
														h.update(virtualListState.items);
													}
												},
											},
											"Delete",
										),
									),
								),
								// 根据 lines 属性显示不同数量的内容行
								...Array.from({ length: item.lines }, (_, i) =>
									h.p(
										{ class: "text-sm text-gray mb-1" },
										`Line ${i + 1} of ${item.lines}: This is dynamic content that makes each item have different heights.`,
									),
								),
							);
						},
					),
				);
			},
		),
		// h.ref
		createExampleSection(
			"element",
			`import { h } from "zeroeffect";

const state = { count: 0 };
const other = { name: "John" };

// Pattern 1: Bind reactive properties to a newly created element
const div = h.div();
h.ref(div)(
	[state],
	{ class: "title-lg" },
	() => \`Count: \${state.count}\`,
	h.span([state], () => (state.count % 2 === 0 ? "Even" : "Odd"))
);

// Pattern 2: Bind reactive properties to an existing element
const existingDiv = document.createElement("div");
h.ref(existingDiv)(
	[other],
	{ class: "text-blue" },
	() => \`Name: \${other.name}\`
);

document.body.append(div, existingDiv);`,
			() => {
				const state = exampleStates.element as { count: number };
				const other = { name: "John" };

				// Pattern 1: Create new element and bind
				const div = h.div();
				h.ref(div)(
					[state],
					{ class: "title-lg" },
					() => `Count: ${state.count}`,
					h.span([state], () => (state.count % 2 === 0 ? "Even" : "Odd")),
				);

				// Pattern 2: Bind to existing element
				const existingDiv = document.createElement("div");
				existingDiv.className =
					"doc-p-2 doc-border doc-border-gray-300 doc-rounded";
				h.ref(existingDiv)(
					[other],
					{ class: "text-blue" },
					() => `Name: ${other.name}`,
				);

				return h.div(
					{ class: "space-y-2" },
					div,
					h.div(
						{ class: "flex-gap-2" },
						h.button(
							{
								class: "green-button",
								onclick: () => {
									state.count++;
									h.update(state);
								},
							},
							"Increment",
						),
						h.button(
							{
								class: "blue-button",
								onclick: () => {
									other.name = other.name === "John" ? "Jane" : "John";
									h.update(other);
								},
							},
							"Toggle Name",
						),
					),
					existingDiv,
				);
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
			h.span([todo], { class: "text-xs text-gray" }, () =>
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
						{
							class: "flex-col flex-row-sm mb-4",
						},
						h.input({
							id: "doc-todo-input",
							type: "text",
							placeholder: "Enter todo item...",
							class:
								"doc-flex-1 doc-px-3 doc-py-2 doc-border doc-border-gray-300 doc-rounded doc-text-sm",
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
						todoState.todos,
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
										"doc-flex doc-flex-col doc-flex-row-sm doc-items-start doc-items-center doc-gap-2 doc-p-2 doc-mb-2 doc-border doc-border-gray-200 doc-rounded",
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
									{ class: "text-xs text-gray" },
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
	h.p({ class: "text-red" }, "This is red text"),
	h.p({ class: "text-blue" }, "This is blue text")
);

document.body.append(app);`,
			() =>
				h.div(
					h.p({ class: "text-red" }, "This is red text"),
					h.p({ class: "text-blue" }, "This is blue text"),
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
	h.div({ class: "text-sm text-gray" }, "Iconify icon above")
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
					h.div({ class: "text-sm text-gray" }, "Iconify icon above"),
				),
		),
		// innerHTML (moved to end)
		createExampleSection(
			"innerHTML",
			`import { h } from "zeroeffect";

const app = h.div(
	{ class: "flex-center" },
	h.innerHTML(
		\`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2m3.3 14.71L11 12.41V7h2v4.59l3.71 3.71z"/></svg>\`
	),
	h.span("SVG rendered via innerHTML")
);

document.body.append(app);`,
			() =>
				h.div(
					{ class: "flex-center" },
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
			class: "pink-button",
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
							class: "pink-button",
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
		// Style Objects and Functions (moved to end)
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
			class: "purple-button",
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
							class: "purple-button",
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
	);
};

// Initialize Prism.js highlighting
function highlightCode() {
	if (typeof window !== "undefined" && "Prism" in window) {
		const prism = (window as { Prism?: { highlightAll: () => void } }).Prism;
		prism?.highlightAll();
	}
}

const root = document.getElementById("root");
if (root) {
	root.appendChild(DocumentPage());
	// Set initial title
	document.title = translations[langState.current].title;
	// Highlight code after a short delay
	setTimeout(highlightCode, 100);
}
