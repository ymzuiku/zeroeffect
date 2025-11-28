import { h } from "../src";

const _reRenderCount = 0;

export const ExamplePage = () => {
	const state = {
		count: 0,
	};

	const other = {
		name: "John",
	};

	const getCount = () => {
		// mock api call, get count from api
		setTimeout(() => {
			state.count = 100;
			// 当主动更新 state 时，需要手动调用 h.update 更新视图
			h.update(state);
		}, 1000);
	};

	// 如果执行了 update，会触发这个回调
	h.onUpdate(() => {
		console.log("state changed", state);
		if (state.count === 100) {
			other.name = "Jane";
			h.update(other);
		}
	});

	getCount();

	// 永远只会打印一次
	console.log("re-render only once");

	// h.div 等等常用的所有标签函数，都是函数，返回一个 DOM 元素，一些特殊字符串也会被解析成标签, 比如 h['iconify-icon'] 会解析成 <iconify-icon> 标签
	// 只有白名单里的不会解析成标签函数：update, onUpdate, watch, list, if, 否则都会解析成标签函数
	return h.div(
		// 第一个参数如果时数组，就会作为依赖，当数组中的对象发生变化时，会触发函数进行响应
		// 当执行 h.update包含 state 时，会触发函数进行响应， 因为描述了 [state]
		h.div([state], { class: "text-2xl font-bold" }, () => state.count),
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
			() => other.name,
		),
		h.button(
			// 如果返回值是 false, null, undefined, NaN, '', 不会渲染，但是 'false', 0, '0' 会渲染
			state.count && "Click me",
		),
	);
};
