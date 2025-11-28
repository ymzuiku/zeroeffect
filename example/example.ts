import { h } from "../src";

// 会创建一个 style 标签，并插入到 head 中
h.css(`
	.text-red-500 {
		color: red;
	}
	.text-blue-500 {
		color: blue;
	}
`);

export const ExamplePage = () => {
	// 只需要普通的对象即可
	const state = {
		count: 0,
	};

	const other = {
		name: "John",
	};

	// 列表数据，也是普通的数组
	const list = [1, 2, 3, 4, 5];

	// Todo List 数据
	const todos: Array<{ id: number; text: string; completed: boolean }> = [
		{ id: 1, text: "学习 TypeScript", completed: false },
		{ id: 2, text: "实现响应式 DOM 库", completed: true },
		{ id: 3, text: "编写文档", completed: false },
	];

	const getCount = () => {
		// mock api call, get count from api
		state.count = 100;
		// 当主动更新 state 时，需要手动调用 h.update 更新视图
		h.update(state);
		// 同帧下，update 多次，会合并成一次更新
		h.update(state);
	};

	// 如果执行了 update，会触发这个回调
	h.onUpdate(() => {
		console.log("state changed", state);
		if (state.count === 100) {
			other.name = "Jane";
		}
		// 不要在 onUpdate 无条件使用 update， 会导致循环调用
		// h.update(other);
	});

	getCount();

	// 永远只会打印一次
	console.log("re-render only once");

	// h.div 等等常用的所有标签函数，都是函数，返回一个 DOM 元素，一些特殊字符串也会被解析成标签, 比如 h['iconify-icon'] 会解析成 <iconify-icon> 标签
	// 只有白名单里的不会解析成标签函数：update, onUpdate, watch, list, if, css, innerHTML, 否则都会解析成标签函数
	return h.div(
		// 第一个参数如果时数组，就会作为依赖，当数组中的对象发生变化时，会触发函数进行响应， 依赖可以有多个
		// 当执行 h.update包含 state 时，会触发函数进行响应， 因为描述了 [state]
		h.div(
			[state],
			{ class: "text-2xl font-bold" },
			() => `Count: ${state.count} -- ${new Date().toISOString()}`,
			h.span([state], () => (state.count % 2 === 0 ? "Even" : "Odd")),
		),
		// 支持自定义组件, TS 中由于类型系统 建议使用 as 断言成已知类型
		h["iconify-icon" as "div"]({
			icon: "material-symbols:agriculture",
		}),
		// 支持 innerHTML
		h.innerHTML(
			`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2m3.3 14.71L11 12.41V7h2v4.59l3.71 3.71z"/></svg>`,
		),
		// 当执行 h.update包含 other 时，会触发函数进行响应， 因为描述了 $: [other]
		h.div(
			[other],
			{
				// 任何属性如果是个函数，都会在更新时执行
				class: () => {
					if (other.name === "Jane") {
						return "text-red-500";
					}
					return "text-blue-500";
				},
				// on开头的属性不会触发更新，因为它们是事件处理函数
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
				// style 属性如果是个对象，会直接应用到元素上
				style: {
					// 注意，属性名需要用引号包裹
					backgroundColor: "red",
				},
				onclick: () => {
					state.count++;
					h.update(state);
				},
			},
			// 如果返回值是 false, null, undefined, NaN, '', 不会渲染，但是 'false', 0, '0' 会渲染
			() => state.count && "Click me",
		),
		h.span(
			[state],
			{
				// 同样的，style 属性如果是个函数，会在更新时执行
				style: () => ({
					backgroundColor: state.count % 2 === 0 ? "red" : "blue",
				}),
			},
			() => `Count: ${state.count} -- ${new Date().toISOString()}`,
		),
		// 支持 if 条件渲染, 如果条件为 true，则渲染内容，否则不渲染
		h.if(
			// 第一个参数必须是一个数组，表示依赖，要做类型约束
			[state],
			// 第二个参数必须是一个函数，表示条件，要做类型约束，返回不需要是 boolean，只要值为真就行
			() => state.count % 2 === 0,
			// 第三个参数必须是一个函数，真时，表示渲染内容
			() => h.div([state], "I am even"),
			// 如果有第4个参数，则会在条件为 false 时渲染
			() => h.div([state], "I am odd"),
		),
		h.list(
			// 第一个参数还是依赖，而且第一个参数数组的第一个参数需要是宿主, 可以有多个参数，其他参数只是普通依赖
			// 下一行的 list 即会当成依赖，又会作为 list 解析，并且会用它做类型推断
			// list 下的内容，不会触发更新，但是 list 长度变化了，会移除会新增元素
			[list, state],
			// 自动解析数组类型，value 是数组中的值，index 是索引
			(value, index) => h.div([value], `Item: ${value}, index: ${index}`),
		),
		// Todo List 示例
		h.div(
			{ class: "mt-8 p-4 border border-gray-300 rounded-lg" },
			h.h2({ class: "text-xl font-bold mb-4" }, "Todo List"),
			// 输入框和添加按钮
			h.div(
				{ class: "flex gap-2 mb-4" },
				h.input({
					id: "todo-input",
					type: "text",
					placeholder: "输入待办事项...",
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
					"添加",
				),
			),
			// 使用 h.list 渲染 todo 列表
			h.list([todos], (todo, index) =>
				h.div(
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
					// 可编辑的输入框 - value 使用函数形式使其响应式
					h.input([todo], {
						type: "text",
						value: () => todo.text, // 响应式 value
						class: "flex-1 px-2 py-1 border border-gray-300 rounded",
						style: () => ({
							textDecoration: todo.completed ? "line-through" : "none",
						}),
						oninput: (e: Event) => {
							const input = e.target as HTMLInputElement;
							todo.text = input.value;
							// 注意：这里不调用 h.update，因为输入时频繁更新会影响输入体验
							// 可以在 onblur 时更新，或者使用防抖
						},
						onblur: () => {
							// 失去焦点时更新视图（确保其他依赖此 todo 的元素也更新）
							h.update(todo);
						},
						onkeydown: (e: KeyboardEvent) => {
							if (e.key === "Enter") {
								(e.target as HTMLInputElement).blur();
							}
						},
					}),
					// 渲染时间显示，用于排查是否重绘
					h.span(
						[todo],
						{
							class: "text-xs text-gray-500",
							style: {
								fontFamily: "monospace",
							},
						},
						() =>
							`渲染时间: ${new Date().toLocaleTimeString()}.${Date.now() % 1000}`,
					),
					h.button(
						{
							class: "px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600",
							onclick: () => {
								todos.splice(index, 1);
								h.update(todos);
							},
						},
						"删除",
					),
				),
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
