type Attributes = Record<string, unknown>;
type Content =
	| string
	| number
	| HTMLElement
	| (() => string | number | HTMLElement | null | undefined | false);
type Dependencies = unknown[];

// 标签函数类型 - 支持可变参数
type TagFunction = (
	...args: Array<Dependencies | Attributes | Content | Content[]>
) => HTMLElement;

// 常用 HTML 标签，提供更好的类型提示
interface HTagElements {
	// 结构元素
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

	// 文本元素
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

	// 列表元素
	ul: TagFunction;
	ol: TagFunction;
	li: TagFunction;
	dl: TagFunction;
	dt: TagFunction;
	dd: TagFunction;

	// 表单元素
	form: TagFunction;
	input: TagFunction;
	button: TagFunction;
	textarea: TagFunction;
	select: TagFunction;
	option: TagFunction;
	label: TagFunction;
	fieldset: TagFunction;
	legend: TagFunction;

	// 表格元素
	table: TagFunction;
	thead: TagFunction;
	tbody: TagFunction;
	tfoot: TagFunction;
	tr: TagFunction;
	th: TagFunction;
	td: TagFunction;
	caption: TagFunction;

	// 媒体元素
	img: TagFunction;
	video: TagFunction;
	audio: TagFunction;
	canvas: TagFunction;
	svg: TagFunction;

	// 链接元素
	a: TagFunction;
	link: TagFunction;

	// 其他常用元素
	br: TagFunction;
	hr: TagFunction;
	meta: TagFunction;
	title: TagFunction;
	script: TagFunction;
	style: TagFunction;
	iframe: TagFunction;
	embed: TagFunction;
	object: TagFunction;

	// 支持自定义标签的动态访问索引签名
	// 注意：TypeScript 的索引签名允许 undefined，但我们的 Proxy 总是返回 TagFunction
	[key: string]: TagFunction | undefined;
}

// 检查值是否应该被渲染（不会渲染的假值）
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

// 将内容渲染到 DOM 节点
function renderContent(content: Content): Node[] {
	if (typeof content === "function") {
		const result = content();
		if (!shouldRender(result)) {
			return [];
		}
		if (result instanceof HTMLElement) {
			// 检查是否为列表元素（索引 0）
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
		// 检查是否为列表元素（索引 0）
		const listIndex = content.getAttribute("data-ns-list");
		if (listIndex === "0") {
			insertListRemainingElements(content);
		}
		return [content];
	}
	return [document.createTextNode(String(content))];
}

// 在第一个元素后插入剩余的列表元素
function insertListRemainingElements(firstElement: HTMLElement): void {
	// 使用 WeakMap 查找响应式信息
	const info = listFirstElementMap.get(firstElement);
	if (!info?.isList || !info.listElements) {
		return;
	}

	const listElements = info.listElements;
	const parent = firstElement.parentNode;

	// 如果第一个元素尚未在 DOM 中，安排在下一帧插入
	if (!parent) {
		// 防止重复调度
		if (!scheduledInsertions.has(firstElement)) {
			scheduledInsertions.add(firstElement);
			requestAnimationFrame(() => {
				scheduledInsertions.delete(firstElement);
				insertListRemainingElements(firstElement);
			});
		}
		return;
	}

	// 按顺序插入元素
	let lastInserted = firstElement;
	for (let i = 1; i < listElements.size; i++) {
		const element = listElements.get(i);
		if (element && !element.parentNode) {
			// 在 lastInserted 之后插入
			parent.insertBefore(element, lastInserted.nextSibling);
			lastInserted = element;
		}
	}
}

// 直接将样式对象应用到 element.style
function applyStyleObject(
	element: HTMLElement,
	style: Record<string, string | number>,
): void {
	for (const [key, value] of Object.entries(style)) {
		// 使用 JavaScript 样式 API 直接设置样式属性
		// 使用索引签名动态访问样式属性
		(element.style as unknown as Record<string, string>)[key] = String(value);
	}
}

// 将响应式属性应用到元素（在初始渲染和更新时调用）
function applyAttributes(
	element: HTMLElement,
	attrs: Attributes,
	skipEvents = false,
): void {
	for (const [key, value] of Object.entries(attrs)) {
		if (key.startsWith("on") && typeof value === "function") {
			// 事件处理器 - 如果 skipEvents 为 true 则跳过（已添加）
			if (!skipEvents) {
				const eventName = key.slice(2).toLowerCase();
				element.addEventListener(eventName, value as EventListener);
			}
		} else if (typeof value === "function") {
			// 响应式属性 - 执行函数并设置结果
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
					// 样式对象 - 直接应用到 element.style
					applyStyleObject(element, result as Record<string, string | number>);
				}
			} else if (
				key === "value" &&
				(element instanceof HTMLInputElement ||
					element instanceof HTMLTextAreaElement ||
					element instanceof HTMLSelectElement)
			) {
				// 对于 input/textarea/select 元素，直接设置 value 属性
				element.value = String(result ?? "");
			} else if (key === "checked" && element instanceof HTMLInputElement) {
				// 对于 checkbox/radio 输入框，设置 checked 属性
				element.checked = Boolean(result);
			} else {
				element.setAttribute(key, String(result ?? ""));
			}
		} else {
			// 静态属性
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
					// 样式对象 - 直接应用到 element.style
					applyStyleObject(element, value as Record<string, string | number>);
				}
			} else if (
				key === "value" &&
				(element instanceof HTMLInputElement ||
					element instanceof HTMLTextAreaElement ||
					element instanceof HTMLSelectElement)
			) {
				// 对于 input/textarea/select 元素，直接设置 value 属性
				element.value = String(value ?? "");
			} else if (key === "checked" && element instanceof HTMLInputElement) {
				// 对于 checkbox/radio 输入框，设置 checked 属性
				element.checked = Boolean(value);
			} else {
				element.setAttribute(key, String(value ?? ""));
			}
		}
	}
}

// 创建响应式元素
function createReactiveElement(
	tagName: string,
	deps: Dependencies | null,
	attrs: Attributes | null,
	content: Content | Content[] | null,
): HTMLElement {
	const element = document.createElement(tagName);
	const container = document.createDocumentFragment();

	// 跟踪此元素的依赖项
	if (deps) {
		for (const dep of deps) {
			// 转换为对象作为 Map 键（对象通过引用跟踪）
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

	// 初始渲染 - 应用所有属性包括事件处理器
	if (attrs) {
		applyAttributes(element, attrs);
	}

	if (content) {
		const contents = Array.isArray(content) ? content : [content];
		// 跟踪需要插入的列表首元素
		const listFirstElements: HTMLElement[] = [];

		for (const item of contents) {
			const nodes = renderContent(item);
			for (const node of nodes) {
				container.appendChild(node);
				// 检查是否为列表首元素
				if (
					node instanceof HTMLElement &&
					node.getAttribute("data-ns-list") === "0"
				) {
					listFirstElements.push(node);
				}
			}
		}
		element.appendChild(container);

		// 为所有列表首元素插入剩余元素
		for (const firstElement of listFirstElements) {
			insertListRemainingElements(firstElement);
		}
	}

	return element;
}

// 响应式元素信息
interface ReactiveElementInfo {
	element: HTMLElement;
	attrs: Attributes;
	content: Content | Content[] | null;
	tagName: string;
	isConditional?: boolean;
	condition?: () => unknown; // 返回值不需要是布尔值，只需真值/假值
	renderFn?: () => HTMLElement;
	elseRenderFn?: () => HTMLElement; // 可选的 else 渲染函数
	conditionalPlaceholder?: HTMLElement; // 条件渲染的当前占位符元素
	lastConditionValue?: unknown; // 检测变化的最后一个条件值
	isList?: boolean;
	listData?: unknown[]; // 数组数据（deps 的第一个元素）
	listDeps?: unknown[]; // 除列表外的其他依赖项
	listRenderFn?: (value: unknown, index: number) => HTMLElement; // 列表项的渲染函数
	listElements?: Map<number, HTMLElement>; // 索引到渲染元素的映射
	listPlaceholder?: HTMLElement; // 列表渲染的当前占位符元素（首元素或 span）
	isVirtualList?: boolean;
	virtualListUpdate?: () => void; // 虚拟列表的更新函数
}

// 依赖项到响应式元素的映射
// 使用 WeakMap 进行对象标识跟踪
// 当状态对象被垃圾回收时，WeakMap 自动清理
const reactiveElements = new WeakMap<object, Set<ReactiveElementInfo>>();

// 列表首元素到其响应式信息的映射（用于插入剩余元素）
const listFirstElementMap = new WeakMap<HTMLElement, ReactiveElementInfo>();

// 用于跟踪已安排插入元素的集合（防止重复 requestAnimationFrame）
const scheduledInsertions = new WeakSet<HTMLElement>();

// 更新回调 - 使用 Map 避免内存泄漏（WeakMap 不支持 keys() 方法）
const updateCallbacks = new Map<() => void, boolean>();

// 防止 on 更新回调中无限递归的标志
let isInCallback = false;

// 跟踪元素移除回调的 WeakMap
const removeCallbacks = new WeakMap<HTMLElement, Set<() => void>>();

// 跟踪元素挂载回调的 WeakMap
const mountCallbacks = new WeakMap<
	HTMLElement,
	{ callback: () => void; hasTriggered: boolean }
>();

// 检测元素移除的全局 MutationObserver
const removalObserver = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		const removedNodes = Array.from(mutation.removedNodes);
		for (const node of removedNodes) {
			// 检查移除的节点是否是具有移除回调的 HTMLElement
			if (node instanceof HTMLElement) {
				const callbacks = removeCallbacks.get(node);
				if (callbacks) {
					// 执行此元素的所有回调
					for (const callback of callbacks) {
						try {
							callback();
						} catch (error) {
							console.error("Error in onRemove callback:", error);
						}
					}
					// 清理
					removeCallbacks.delete(node);
				}
			}
		}
	}
});

// 检测元素挂载的全局 MutationObserver
const mountObserver = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		const addedNodes = Array.from(mutation.addedNodes);
		for (const node of addedNodes) {
			// 检查添加的节点是否是具有挂载回调的 HTMLElement
			if (node instanceof HTMLElement) {
				const callbackInfo = mountCallbacks.get(node);
				if (callbackInfo && !callbackInfo.hasTriggered) {
					// 标记为已触发以防止重复执行
					callbackInfo.hasTriggered = true;

					try {
						callbackInfo.callback();
					} catch (error) {
						console.error("Error in onMount callback:", error);
					}

					// 清理 after execution
					mountCallbacks.delete(node);
				}
			}
		}
	}
});

// DOM 准备后开始观察
if (document.readyState === "loading") {
	document.addEventListener(
		"DOMContentLoaded",
		() => {
			removalObserver.observe(document.body, {
				childList: true,
				subtree: true,
			});
			mountObserver.observe(document.body, {
				childList: true,
				subtree: true,
			});
		},
		{ once: true },
	);
} else {
	removalObserver.observe(document.body, {
		childList: true,
		subtree: true,
	});
	mountObserver.observe(document.body, {
		childList: true,
		subtree: true,
	});
}

// 需要更新的状态集合 - 使用 Set（WeakSet 不支持 size/clear/iteration）
const pendingUpdates = new Set<unknown>();

// 跟踪是否已安排批量更新的标志
let updateScheduled = false;

// 处理状态对象的更新
function processUpdate(state: unknown): void {
	// 只有对象才能作为 WeakMap 的键
	if (typeof state === "object" && state !== null) {
		const elements = reactiveElements.get(state as object);
		if (!elements) {
			return;
		}

		// 一次处理有效元素的更新并清理过期元素
		const staleElements: ReactiveElementInfo[] = [];
		for (const info of elements) {
			// 检查元素是否仍连接到 DOM
			if (!info.element.isConnected) {
				staleElements.push(info);
				continue;
			}

			// 处理条件渲染
			if (info.isConditional && info.condition && info.renderFn) {
				updateConditional(
					info,
					info.condition,
					info.renderFn,
					info.elseRenderFn,
				);
				continue;
			}

			// 处理虚拟列表渲染
			if (info.isVirtualList && info.virtualListUpdate) {
				// 如果状态是数组，更新虚拟列表数据引用
				const currentState = virtualListInstances.get(info.element);
				if (currentState) {
					// 如果触发的状态是数组，使用它作为新数据
					// 否则保持当前数据
					if (Array.isArray(state)) {
						currentState.listData = state as unknown[];
					}
				}
				info.virtualListUpdate();
				continue;
			}

			// 处理列表渲染
			if (
				info.isList &&
				info.listData &&
				info.listRenderFn &&
				info.listElements
			) {
				// 从触发更新的状态更新列表数据
				// 如果状态是列表本身，使用它；否则保持当前列表
				const newListData = Array.isArray(state)
					? (state as unknown[])
					: info.listData;
				updateList(info, newListData, info.listRenderFn, info.listElements);
				// 更新存储的列表数据
				info.listData = newListData;
				continue;
			}

			// 清除现有内容
			info.element.textContent = "";

			// 重新应用属性（跳过事件处理器，因为已经添加）
			applyAttributes(info.element, info.attrs, true);

			// 重新渲染内容
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

		// 清理 stale elements after processing
		for (const stale of staleElements) {
			elements.delete(stale);
		}
	}
}

// 批量处理所有待处理的更新
function flushUpdates(): void {
	if (pendingUpdates.size === 0) {
		updateScheduled = false;
		return;
	}

	// 收集所有要更新的状态
	const statesToUpdate: unknown[] = [];
	for (const state of pendingUpdates) {
		statesToUpdate.push(state);
	}
	pendingUpdates.clear();
	updateScheduled = false;

	// 处理所有更新
	for (const state of statesToUpdate) {
		processUpdate(state);
	}

	// 触发更新回调
	isInCallback = true;
	try {
		for (const callback of updateCallbacks.keys()) {
			callback();
		}
	} finally {
		isInCallback = false;
	}

	// 如果在回调期间排定了新更新，安排另一次刷新
	if (pendingUpdates.size > 0) {
		scheduleUpdate();
	}
}

// 安排下一帧的批量更新
function scheduleUpdate(): void {
	if (updateScheduled) {
		return;
	}
	updateScheduled = true;

	// 使用 requestAnimationFrame 以获得更好的性能（在下次重绘前运行）
	if (typeof requestAnimationFrame !== "undefined") {
		requestAnimationFrame(flushUpdates);
	} else {
		// 在没有 requestAnimationFrame 的环境中的后备方案
		setTimeout(flushUpdates, 0);
	}
}

// 更新函数 - 收集要更新的状态并安排下一帧的批量更新
function update(state: unknown): void {
	// 将状态添加到待处理更新
	pendingUpdates.add(state);

	// 如果我们在回调中，还不要安排更新
	// 更新将在回调完成后处理（在 flushUpdates 或下次 scheduleUpdate 中）
	if (isInCallback) {
		return;
	}

	// 安排下一帧的批量更新
	// 这将同一帧中的多个 update() 调用批量处理
	scheduleUpdate();
}

// 更新回调 - 支持全局更新和元素绑定更新
// 如果第一个参数是函数，订阅全局更新
// 如果第一个参数是 HTMLElement，订阅更新并自动清理
function onUpdate(callback: () => void): () => void;
function onUpdate(element: HTMLElement, callback: () => void): () => void;
function onUpdate(
	param1: (() => void) | HTMLElement,
	param2?: () => void,
): () => void {
	// 重载 1: onUpdate(callback)
	if (typeof param1 === "function") {
		updateCallbacks.set(param1, true);
		return () => updateCallbacks.delete(param1);
	}

	// 重载 2: onUpdate(element, callback)
	const element = param1 as HTMLElement;
	const callback = param2 as () => void;

	// 订阅全局更新
	updateCallbacks.set(callback, true);
	const unsubscribeGlobalUpdate = () => updateCallbacks.delete(callback);

	// 元素移除时自动取消订阅
	const unsubscribeRemove = onRemove(element, () => {
		unsubscribeGlobalUpdate();
	});

	// 返回一个取消订阅两者的函数
	return () => {
		unsubscribeGlobalUpdate();
		unsubscribeRemove();
	};
}

// 监听元素从 DOM 移除
// 返回一个取消订阅函数
function onRemove(element: HTMLElement, callback: () => void): () => void {
	const callbacks = removeCallbacks.get(element) || new Set<() => void>();
	callbacks.add(callback);
	removeCallbacks.set(element, callbacks);

	// 返回取消订阅函数
	return () => {
		const cbs = removeCallbacks.get(element);
		if (cbs) {
			cbs.delete(callback);
			if (cbs.size === 0) {
				removeCallbacks.delete(element);
			}
		}
	};
}

// 监听元素挂载/插入 DOM
// 元素挂载时触发一次回调，然后自动移除监听器
// 返回一个取消订阅函数
function onMount(element: HTMLElement, callback: () => void): () => void {
	// 存储回调信息
	mountCallbacks.set(element, {
		callback,
		hasTriggered: false,
	});

	// 如果元素已在 DOM 中，立即触发
	if (element.isConnected) {
		const callbackInfo = mountCallbacks.get(element);
		if (callbackInfo && !callbackInfo.hasTriggered) {
			callbackInfo.hasTriggered = true;

			try {
				callback();
			} catch (error) {
				console.error("Error in onMount callback:", error);
			}

			// 清理 immediately
			mountCallbacks.delete(element);
		}
	}

	// 返回取消订阅函数
	return () => {
		mountCallbacks.delete(element);
	};
}

// 为给定标签名创建标签函数
function createTagFunction(tagName: string): TagFunction {
	return (...args) => {
		// 确定传递了哪些参数
		let deps: Dependencies | null = null;
		let attrs: Attributes | null = null;
		let finalContent: Content | Content[] | null = null;

		if (args.length === 0) {
			// 无参数
			return createReactiveElement(tagName, null, null, null);
		}

		const firstArg = args[0];
		const secondArg = args[1];

		if (Array.isArray(firstArg) && firstArg.length > 0) {
			// 检查第一个数组是依赖项（包含对象）还是内容（包含 HTMLElement/函数/字符串）
			const isDependencies = firstArg.every(
				(item) =>
					typeof item === "object" &&
					item !== null &&
					!(item instanceof HTMLElement) &&
					typeof item !== "function",
			);

			if (isDependencies) {
				// 第一个参数是依赖项数组
				deps = firstArg as Dependencies;
				if (
					secondArg &&
					typeof secondArg === "object" &&
					!Array.isArray(secondArg) &&
					!(secondArg instanceof HTMLElement) &&
					typeof secondArg !== "function"
				) {
					// 第二个参数是属性
					attrs = secondArg as Attributes;
					// 剩余参数是内容
					if (args.length > 2) {
						finalContent = args.slice(2) as Content[];
					} else {
						finalContent = null;
					}
				} else {
					// 第二个参数是内容，剩余参数也是内容
					if (args.length > 1) {
						finalContent = args.slice(1) as Content[];
					} else {
						finalContent = null;
					}
				}
			} else {
				// 第一个数组是内容（子元素数组）
				finalContent = firstArg as Content[];
			}
		} else if (
			firstArg &&
			typeof firstArg === "object" &&
			!Array.isArray(firstArg) &&
			!(firstArg instanceof HTMLElement) &&
			typeof firstArg !== "function"
		) {
			// 第一个参数是属性
			attrs = firstArg as Attributes;
			// 剩余参数是内容
			if (args.length > 1) {
				finalContent = args.slice(1) as Content[];
			} else {
				finalContent = null;
			}
		} else {
			// 第一个参数是内容，所有参数都是内容（多个子元素）
			if (args.length === 1) {
				finalContent = firstArg as Content | Content[] | null;
			} else {
				finalContent = args as Content[];
			}
		}

		return createReactiveElement(tagName, deps, attrs, finalContent);
	};
}

// CSS 函数 - 创建样式标签并插入 head
function css(styles: string): void {
	const styleElement = document.createElement("style");
	styleElement.textContent = styles;
	document.head.appendChild(styleElement);
}

// innerHTML 函数 - 创建 div 元素并设置其 innerHTML
function innerHTML(html: string): HTMLElement {
	const div = document.createElement("div");
	div.innerHTML = html;
	return div;
}

// If 函数 - 基于条件的条件渲染
// 第一个参数必须是数组 (dependencies)
// 第二个参数必须是函数（条件）- 返回真值/假值
// 第三个参数必须是函数（条件为真时渲染）
// 第四个参数是可选函数（条件为假时渲染）
function ifConditional(
	deps: Dependencies,
	condition: () => unknown,
	renderFn: () => HTMLElement,
	elseRenderFn?: () => HTMLElement,
): HTMLElement {
	const initialElement = document.createElement("span");
	initialElement.style.display = "none";

	// 跟踪此条件元素的依赖项
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

// 更新条件渲染
function updateConditional(
	reactiveInfo: ReactiveElementInfo,
	condition: () => unknown,
	renderFn: () => HTMLElement,
	elseRenderFn?: () => HTMLElement,
): void {
	const conditionResult = condition();
	const shouldRender = Boolean(conditionResult);

	// 检查条件值是否已更改
	if (reactiveInfo.lastConditionValue === conditionResult) {
		// 条件值未更改，无需重新渲染
		return;
	}

	// 更新最后一个条件值
	reactiveInfo.lastConditionValue = conditionResult;

	const currentPlaceholder = reactiveInfo.conditionalPlaceholder;
	if (!currentPlaceholder) {
		// 如果未设置则初始化占位符
		const initialPlaceholder = document.createElement("div");
		reactiveInfo.conditionalPlaceholder = initialPlaceholder;
		reactiveInfo.element = initialPlaceholder;
		return;
	}

	const parent = currentPlaceholder.parentNode;

	if (!parent) {
		// 占位符尚未在 DOM 中，只更新引用
		if (shouldRender) {
			const newElement = renderFn();
			reactiveInfo.conditionalPlaceholder = newElement;
			reactiveInfo.element = newElement;
		} else if (elseRenderFn) {
			const newElement = elseRenderFn();
			reactiveInfo.conditionalPlaceholder = newElement;
			reactiveInfo.element = newElement;
		} else {
			// 创建 span 占位符
			const spanPlaceholder = document.createElement("span");
			spanPlaceholder.style.display = "none";
			reactiveInfo.conditionalPlaceholder = spanPlaceholder;
			reactiveInfo.element = spanPlaceholder;
		}
		return;
	}

	if (shouldRender) {
		// 条件为真 - 用实际元素替换占位符
		const newElement = renderFn();
		parent.replaceChild(newElement, currentPlaceholder);
		// 更新引用 - 新元素成为占位符
		reactiveInfo.conditionalPlaceholder = newElement;
		reactiveInfo.element = newElement;
	} else if (elseRenderFn) {
		// 条件为假但有 else 函数 - 用 else 元素替换
		const newElement = elseRenderFn();
		parent.replaceChild(newElement, currentPlaceholder);
		reactiveInfo.conditionalPlaceholder = newElement;
		reactiveInfo.element = newElement;
	} else {
		// 条件为假且没有 else 函数 - 用 span 占位符替换
		const spanPlaceholder = document.createElement("span");
		spanPlaceholder.style.display = "none";
		parent.replaceChild(spanPlaceholder, currentPlaceholder);
		reactiveInfo.conditionalPlaceholder = spanPlaceholder;
		reactiveInfo.element = spanPlaceholder;
	}
}

// 列表函数 - 高效差分渲染列表项
// 第一个参数是数据列表（数组）
// 第二个参数是接收（value, index）的渲染函数
// 类型推断：从 dataList 数组推断 T
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
	// 第一个参数必须是数组
	if (!Array.isArray(dataList)) {
		throw new Error("h.list: 第一个参数必须是数组");
	}

	const listData = dataList as T[];
	const otherDeps: unknown[] = [];
	// 转换 renderFn 以匹配内部类型签名
	const renderFnInternal = renderFn as (
		value: unknown,
		index: number,
	) => HTMLElement;

	// 存储列表元素以进行高效更新
	const listElements = new Map<number, HTMLElement>();

	// 创建初始占位符 - 将被实际元素替换
	let initialPlaceholder: HTMLElement;
	if (listData.length === 0) {
		// 空列表 - 创建隐藏的 span
		initialPlaceholder = document.createElement("span");
		initialPlaceholder.style.display = "none";
		initialPlaceholder.setAttribute("data-ns-list", "0");
	} else {
		// 非空列表 - 使用首元素作为占位符
		initialPlaceholder = renderFnInternal(listData[0], 0);
		initialPlaceholder.setAttribute("data-ns-list", "0");
		// 存储首元素
		listElements.set(0, initialPlaceholder);
		// 渲染剩余元素并存储它们
		// 它们将在第一个元素被 renderContent 处理时插入
		for (let i = 1; i < listData.length; i++) {
			const element = renderFnInternal(listData[i], i);
			listElements.set(i, element);
		}
	}

	// 跟踪依赖项（列表和其他 deps）
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

	// 存储从首元素到响应式信息的映射
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

// 更新列表渲染 - 仅管理长度变化以获得最佳性能
// 当长度变化时，重新同步整个列表以确保正确性
function updateList(
	reactiveInfo: ReactiveElementInfo,
	newListData: unknown[],
	renderFn: (value: unknown, index: number) => HTMLElement,
	listElements: Map<number, HTMLElement>,
): void {
	const currentPlaceholder = reactiveInfo.listPlaceholder;
	if (!currentPlaceholder) {
		// 如果未设置则初始化
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
			// 渲染剩余元素
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

	// 仅在长度更改时更新
	if (newLength !== currentLength) {
		const parent = currentPlaceholder.parentNode;

		if (newLength === 0) {
			// 列表变为空 - 用 span 占位符替换
			const spanPlaceholder = document.createElement("span");
			spanPlaceholder.style.display = "none";
			spanPlaceholder.setAttribute("data-ns-list", "0");

			if (parent) {
				// 首先，收集要移除的其他列表元素（不包括 currentPlaceholder）
				const elementsToRemove: HTMLElement[] = [];

				// 移除所有在 listElements map 中的元素（除 currentPlaceholder）
				for (let i = 1; i < currentLength; i++) {
					const listElement = listElements.get(i);
					if (listElement && listElement.parentNode === parent) {
						elementsToRemove.push(listElement);
					}
				}

				// 首先移除其他列表元素
				for (const elem of elementsToRemove) {
					if (elem.parentNode === parent) {
						parent.removeChild(elem);
					}
				}

				// 然后用 span 占位符替换 currentPlaceholder
				// 替换前检查 currentPlaceholder 是否仍在 DOM 中
				if (currentPlaceholder.parentNode === parent) {
					parent.replaceChild(spanPlaceholder, currentPlaceholder);
				} else {
					// 如果 currentPlaceholder 已被移除，只追加 span
					parent.appendChild(spanPlaceholder);
				}
			}

			listElements.clear();
			reactiveInfo.listPlaceholder = spanPlaceholder;
			reactiveInfo.element = spanPlaceholder;
		} else if (currentLength === 0) {
			// 列表为空，现在有项目 - 用首元素替换 span
			const firstElement = renderFn(newListData[0], 0);
			firstElement.setAttribute("data-ns-list", "0");
			listElements.set(0, firstElement);

			if (parent) {
				parent.replaceChild(firstElement, currentPlaceholder);
				// 在首元素后插入剩余元素
				let lastInserted = firstElement;
				for (let i = 1; i < newLength; i++) {
					const element = renderFn(newListData[i], i);
					listElements.set(i, element);
					parent.insertBefore(element, lastInserted.nextSibling);
					lastInserted = element;
				}
			} else {
				// 尚未在 DOM 中，只存储引用
				for (let i = 1; i < newLength; i++) {
					const element = renderFn(newListData[i], i);
					listElements.set(i, element);
				}
			}

			reactiveInfo.listPlaceholder = firstElement;
			reactiveInfo.element = firstElement;
		} else if (newLength > currentLength) {
			// 列表长度增加 - 只添加新项目，不重新渲染现有项目
			// 找到要插入其后的最后一个现有元素
			let lastInserted: HTMLElement | null = null;
			if (parent) {
				// 找到 DOM 中存在的最后一个列表元素
				for (let i = currentLength - 1; i >= 0; i--) {
					const listElement = listElements.get(i);
					if (listElement && listElement.parentNode === parent) {
						lastInserted = listElement;
						break;
					}
				}
			}

			// 仅渲染和插入新项目（从 currentLength 到 newLength-1）
			for (let i = currentLength; i < newLength; i++) {
				const element = renderFn(newListData[i], i);
				listElements.set(i, element);
				if (parent && lastInserted) {
					parent.insertBefore(element, lastInserted.nextSibling);
					lastInserted = element;
				} else if (parent && !lastInserted) {
					// 如果没有找到 lastInserted，在 currentPlaceholder 后插入
					parent.insertBefore(element, currentPlaceholder.nextSibling);
					lastInserted = element;
				}
			}
		} else {
			// 列表长度减少 - 重新渲染所有项目（保持现有逻辑）
			// 移除元素前保存插入点
			// 我们需要找到最后一个列表元素之后的节点，而不是第一个
			let insertBeforeNode: Node | null = null;
			if (parent && currentPlaceholder.parentNode === parent) {
				// 找到最后一个列表元素以获得正确的插入点
				let lastListElement: HTMLElement | null = null;
				for (let i = currentLength - 1; i >= 0; i--) {
					const listElement = listElements.get(i);
					if (listElement && listElement.parentNode === parent) {
						lastListElement = listElement;
						break;
					}
				}
				// 如果我们找到最后一个元素，使用其 nextSibling
				// 否则，回退到 currentPlaceholder.nextSibling
				if (lastListElement) {
					insertBeforeNode = lastListElement.nextSibling;
				} else {
					insertBeforeNode = currentPlaceholder.nextSibling;
				}
			}

			// 仅移除现有的列表元素（在 listElements map 中）
			if (parent) {
				const elementsToRemove: HTMLElement[] = [];

				// 收集所有需要移除的列表元素
				for (let i = 0; i < currentLength; i++) {
					const listElement = listElements.get(i);
					if (listElement && listElement.parentNode === parent) {
						elementsToRemove.push(listElement);
					}
				}

				// 移除所有收集的元素
				for (const elem of elementsToRemove) {
					if (elem.parentNode === parent) {
						parent.removeChild(elem);
					}
				}
			}

			listElements.clear();

			// 重新渲染所有项目
			const firstElement = renderFn(newListData[0], 0);
			firstElement.setAttribute("data-ns-list", "0");
			listElements.set(0, firstElement);

			if (parent) {
				// 在原始位置插入，而不是末尾
				// 使用前验证 insertBeforeNode 是否仍是父级的子元素
				if (insertBeforeNode && insertBeforeNode.parentNode === parent) {
					parent.insertBefore(firstElement, insertBeforeNode);
				} else if (insertBeforeNode === null) {
					// 如果 insertBeforeNode 为空，意味着列表在末尾
					parent.appendChild(firstElement);
				} else {
					// insertBeforeNode 存在但不再是父级的子元素
					// 这不应该发生，但回退到 appendChild
					parent.appendChild(firstElement);
				}
			}

			// 按顺序插入剩余元素
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
	// 如果长度相等，则无需更改 - 单个项目将通过其自己的依赖项更新
}

// ref 函数 - 将响应式属性和依赖项绑定到现有元素
function ref(existingElement: HTMLElement): TagFunction {
	return (
		...args: Array<Dependencies | Attributes | Content | Content[]>
	): HTMLElement => {
		// 解析参数（与 createTagFunction 相同）
		let deps: Dependencies | null = null;
		let attrs: Attributes | null = null;
		let content: Content | Content[] | null = null;

		for (const arg of args) {
			if (Array.isArray(arg) && arg.length > 0) {
				// 检查是否为依赖项数组（第一个元素是对象/数组）
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

		// 跟踪此元素的依赖项 (same as createReactiveElement)
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

		// 应用属性（包括事件处理器）
		if (attrs) {
			applyAttributes(existingElement, attrs);
		}

		// 应用内容（替换现有内容）
		if (content !== null) {
			// 清除现有内容
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

// 虚拟列表类型和函数
type VirtualListOptions = {
	/** Item height (fixed number), function to get height, or "auto" for dynamic height measurement */
	itemHeight: number | ((index: number) => number) | "auto";
	/** 容器高度，默认为父级高度 */
	containerHeight?: number;
	/** Number of items to render outside viewport (before and after), default 6 */
	overscan?: number;
	/** 滚动容器元素，如果未提供则使用返回的容器 */
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
	itemHeights: Map<number, number>; // 缓存每个项目的实际高度（用于动态高度模式）
	estimatedHeight: number; // 估计高度（用于未测量的项目）
};

// 存储虚拟列表实例以进行更新
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
	// 验证第一个参数必须是数组
	if (!Array.isArray(items)) {
		throw new Error("h.virtualList: 第一个参数必须是数组");
	}

	const listData = items as T[];
	const otherDeps: unknown[] = [];
	const renderFnInternal = renderFn as (
		value: unknown,
		index: number,
	) => HTMLElement;

	// 必须传递 attrs 参数，用于设置容器 div 属性

	// 配置选项（提供默认值）
	const {
		itemHeight = "auto",
		containerHeight: initialContainerHeight,
		overscan = 6,
		scrollContainer: externalScrollContainer,
		estimatedItemHeight = 150,
	} = options || {};

	// 确定是否是动态高度模式
	const isDynamicHeight = itemHeight === "auto";

	// 计算项目高度的函数
	const getItemHeight = (index: number, useCache = true): number => {
		if (isDynamicHeight) {
			// 动态高度模式：优先使用缓存，否则使用估计高度
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

	// 计算总高度
	const calculateTotalHeight = (data: unknown[]): number => {
		if (isDynamicHeight) {
			// 动态高度模式：使用缓存高度 + 估计高度
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

	// 计算每个项目的偏移量
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

	// 确保选项不为空
	const finalOptions = options || {
		itemHeight: "auto",
		overscan: 6,
		estimatedItemHeight: 150,
	};

	// 状态
	const state: VirtualListState = {
		scrollTop: 0,
		// 初始高度为 0，等待父级容器高度检测
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

	// 创建容器
	const container = document.createElement("div");
	container.style.position = "relative";
	container.style.overflow = "auto";

	// 应用用户提供的 attrs
	applyAttributes(container, attrs);

	if (initialContainerHeight) {
		container.style.height = `${initialContainerHeight}px`;
	}

	// 创建内容容器
	const contentContainer = document.createElement("div");
	contentContainer.style.position = "relative";
	container.appendChild(contentContainer);

	// 计算最大高度限制（屏幕高度的 2 倍）
	const maxHeight = typeof window !== "undefined" ? window.innerHeight * 2 : 0;

	// 节流器：在滚动期间检测高度
	let resizeThrottleId: number | null = null;
	const throttledHeightCheck = () => {
		if (resizeThrottleId === null) {
			resizeThrottleId = requestAnimationFrame(() => {
				resizeThrottleId = null;
				// 检测容器高度变化
				const currentHeight = container.offsetHeight;
				if (currentHeight > 0) {
					// 限制高度不超过屏幕高度的 2 倍
					const newHeight = Math.min(currentHeight, maxHeight);
					if (newHeight !== state.containerHeight) {
						state.containerHeight = newHeight;
						container.style.height = `${newHeight}px`;
						// 重新渲染可见项目
						renderVisibleItems(state.listData);
					}
				}
			});
		}
	};

	// 高度检测函数：等待容器准备就绪
	const checkContainerHeight = (): void => {
		// 首先尝试读取容器自己的 offsetHeight
		const containerOffsetHeight = container.offsetHeight;

		if (initialContainerHeight) {
			// 如果设置了初始高度，直接使用
			state.containerHeight = initialContainerHeight;
			container.style.height = `${initialContainerHeight}px`;
		} else if (containerOffsetHeight > 0) {
			// 如果容器有明确高度，使用它
			const newHeight = Math.min(containerOffsetHeight, maxHeight);
			if (newHeight !== state.containerHeight) {
				state.containerHeight = newHeight;
				container.style.height = `${newHeight}px`;
			}
		} else {
			// 容器没有高度，尝试读取父级容器高度
			const parentHeight = container.parentElement?.clientHeight || 0;
			if (parentHeight === 0) {
				// 父级容器还没有高度，继续等待下一帧
				requestAnimationFrame(checkContainerHeight);
				return;
			}
			// 限制高度不超过屏幕高度的 2 倍
			const newHeight = Math.min(parentHeight, maxHeight);
			if (newHeight !== state.containerHeight) {
				state.containerHeight = newHeight;
				container.style.height = `${newHeight}px`;
			}
		}

		// 初始渲染
		renderVisibleItems(state.listData);
	};

	// 将内容容器设置到状态
	state.contentContainer = contentContainer;

	// 计算可见范围
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

		// 二进制搜索起始索引
		if (isDynamicHeight || typeof itemHeight === "function") {
			// 可变高度：使用二进制搜索
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

			// 查找结束索引
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
			// 固定高度：直接计算
			start = Math.floor(viewportTop / itemHeight);
			end = Math.min(Math.ceil(viewportBottom / itemHeight), data.length - 1);
		}

		// 应用overscan
		start = Math.max(0, start - overscan);
		end = Math.min(data.length - 1, end + overscan);

		return { start, end };
	};

	// 渲染可见项目
	const renderVisibleItems = (data: unknown[]): void => {
		const { start, end } = calculateVisibleRange(data);
		state.startIndex = start;
		state.endIndex = end;

		// 移除旧的可见项目
		for (const item of state.visibleItems) {
			if (item.parentNode === contentContainer) {
				contentContainer.removeChild(item);
			}
		}
		state.visibleItems = [];

		// 创建顶部间距
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

		// 渲染可见项目
		for (let i = start; i <= end; i++) {
			const item = renderFnInternal(data[i], i);
			item.style.position = "absolute";
			item.style.top = `${getItemOffset(i, data)}px`;
			item.style.left = "0";
			item.style.right = "0";
			contentContainer.appendChild(item);
			state.visibleItems.push(item);
		}

		// 动态 height 模式：测量并缓存实际高度
		if (isDynamicHeight && state.visibleItems.length > 0) {
			// 使用 requestAnimationFrame 确保 DOM 被渲染
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
							// 高度已更改，更新缓存
							state.itemHeights.set(actualIndex, measuredHeight);
							needsUpdate = true;
						}
					}
				}

				// 更新估计高度（使用测量项目的平均值）
				if (needsUpdate && state.itemHeights.size > 0) {
					let sum = 0;
					let count = 0;
					for (const height of state.itemHeights.values()) {
						sum += height;
						count++;
					}
					state.estimatedHeight = Math.round(sum / count);

					// 重新计算总高度并更新布局
					state.totalHeight = calculateTotalHeight(data);
					contentContainer.style.height = `${state.totalHeight}px`;

					// 更新所有可见项目的位置
					for (let idx = 0; idx < state.visibleItems.length; idx++) {
						const item = state.visibleItems[idx];
						if (!item) continue;
						const actualIndex = currentStart + idx;
						item.style.top = `${getItemOffset(actualIndex, data)}px`;
					}

					// 更新间距
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

		// 创建底部间距
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

		// 更新内容容器的总高度
		state.totalHeight = calculateTotalHeight(data);
		contentContainer.style.height = `${state.totalHeight}px`;
	};

	// 处理滚动
	const handleScroll = (): void => {
		const scrollContainer = externalScrollContainer || container;
		state.scrollTop = scrollContainer.scrollTop;

		// 在滚动期间检查高度
		throttledHeightCheck();

		if (state.rafId === null) {
			state.rafId = requestAnimationFrame(() => {
				state.rafId = null;
				renderVisibleItems(state.listData);
			});
		}
	};

	// 更新函数（数据更改时调用）
	const updateVirtualList = (newData: unknown[]): void => {
		state.listData = newData;
		// 动态高度模式：清除不再存在的高度缓存
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

	// 初始化
	const init = (): void => {
		// 设置总高度
		state.totalHeight = calculateTotalHeight(listData as unknown[]);
		contentContainer.style.height = `${state.totalHeight}px`;

		// 添加滚动监听器
		const scrollContainer = externalScrollContainer || container;
		scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

		// 开始检测容器高度（等待父级准备就绪）
		checkContainerHeight();
	};

	// 初始化
	init();

	// 存储状态以进行更新
	virtualListInstances.set(container, state);

	// 注册到响应式系统，数据数组更改时更新
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

// 不应是标签函数的方法白名单
const WHITELIST = new Set([
	"update",
	"onUpdate",
	"onRemove",
	"onMount",
	"watch",
	"list",
	"if",
	"css",
	"innerHTML",
	"ref",
	"virtualList",
]);

// 动态标签访问的代理处理器
const handler: ProxyHandler<HObject> = {
	get(
		target,
		prop: string,
	):
		| TagFunction
		| typeof update
		| typeof onUpdate
		| typeof onRemove
		| typeof onMount
		| typeof css
		| typeof innerHTML
		| typeof ifConditional
		| typeof list
		| typeof ref
		| typeof virtualList {
		if (WHITELIST.has(prop)) {
			if (prop === "update") {
				return update;
			}
			if (prop === "onUpdate") {
				return onUpdate;
			}
			if (prop === "onRemove") {
				return onRemove;
			}
			if (prop === "onMount") {
				return onMount;
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
			if (prop === "ref") {
				return ref;
			}
			if (prop === "virtualList") {
				return virtualList;
			}
			// 对于 watch - 目前返回无操作函数
			return (() => {}) as TagFunction;
		}
		// 按需创建标签函数
		if (!target[prop]) {
			target[prop] = createTagFunction(prop);
		}
		// 始终为标签名返回 TagFunction
		return target[prop] as TagFunction;
	},
};

// 具有所有方法和标签函数的 H 对象接口
// 使用交叉类型允许特殊方法覆盖索引签名
// Record<string, TagFunction> 确保所有字符串键返回 TagFunction
type HObject = {
	// 特殊方法（这些具有特定类型）
	update: typeof update;
	onUpdate: typeof onUpdate;
	onRemove: typeof onRemove;
	onMount: typeof onMount;
	css: typeof css;
	innerHTML: typeof innerHTML;
	if: typeof ifConditional;
	list: typeof list;
	ref: typeof ref;
	virtualList: typeof virtualList;
} & HTagElements & {
		// 动态标签的索引签名 - 始终通过 Proxy 返回 TagFunction
		[key: string]:
			| TagFunction
			| typeof update
			| typeof onUpdate
			| typeof onRemove
			| typeof onMount
			| typeof css
			| typeof innerHTML
			| typeof ifConditional
			| typeof list
			| typeof ref
			| typeof virtualList;
	};

// 使用代理创建 h 对象
const _h = new Proxy<HObject>({} as HObject, handler);

// 处理 noUncheckedIndexedAccess 的导出类型
// 我们需要显式定义类型以覆盖索引签名行为
// 关键是使用没有 noUncheckedIndexedAccess 行为的类型
type HExport = {
	// 特殊方法
	update: typeof update;
	onUpdate: typeof onUpdate;
	onRemove: typeof onRemove;
	onMount: typeof onMount;
	css: typeof css;
	innerHTML: typeof innerHTML;
	if: typeof ifConditional;
	list: typeof list;
	ref: typeof ref;
	virtualList: typeof virtualList;
} & HTagElements & {
		// 明确返回 TagFunction 的索引签名（不是 TagFunction | undefined）
		// 这覆盖了来自 noUncheckedIndexedAccess 的默认行为
		[key: string]:
			| TagFunction
			| typeof update
			| typeof onUpdate
			| typeof onRemove
			| typeof onMount
			| typeof css
			| typeof innerHTML
			| typeof ifConditional
			| typeof list
			| typeof ref
			| typeof virtualList;
	};

const h = _h as unknown as HExport;

export { h };
export type { HObject };
