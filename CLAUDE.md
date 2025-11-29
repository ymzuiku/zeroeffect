# 项目使用指南

## Lint 规则

每次修改完，都要执行 `bun lint`，修复所有 warn 和 error 错误。

## 代码规范

### 1. 注释规范
- src/index.ts 中**不能有英文**注释，所有注释必须使用中文
- 其他文件可以使用英文注释

### 2. 测试要求
- 所有交互式元素必须添加 `data-testid` 属性用于测试
- testid 使用 kebab-case 命名，包含组件/动作上下文
- 具体要求详见 CLAUDE.txt

### 3. 内存管理
- 使用 WeakMap/WeakSet 进行内存优化
- 所有订阅函数都返回取消订阅函数
- 生命周期钩子：onMount、onUpdate、onRemove

### 4. API 文档

#### 核心 API
```typescript
// 更新状态
h.update(state: unknown): void

// 订阅全局更新
h.onUpdate(callback: () => void): () => void

// 订阅元素更新（自动清理）
h.onUpdate(element: HTMLElement, callback: () => void): () => void

// 监听元素挂载
h.onMount(element: HTMLElement, callback: () => void): () => void

// 监听元素移除
h.onRemove(element: HTMLElement, callback: () => void): () => void

// 条件渲染
h.if(deps: Dependencies, condition: () => unknown, renderFn: () => HTMLElement, elseRenderFn?: () => HTMLElement): HTMLElement

// 列表渲染
h.list<T>(dataList: T[], renderFn: (value: T, index: number) => HTMLElement): HTMLElement

// 虚拟列表
h.virtualList<T>(items: T[], attrs: Attributes, renderFn: (value: T, index: number) => HTMLElement, options?: VirtualListOptions): HTMLElement

// 绑定到现有元素或新创建的元素
h.ref(existingElement: HTMLElement): TagFunction

// CSS 注入
h.css(styles: string): void

// HTML 字符串
h.innerHTML(html: string): HTMLElement
```

#### h.ref 使用示例

```typescript
// 1. 绑定到新创建的元素
const div = h.div();
h.ref(div)(
  [state],
  { class: "text-2xl font-bold" },
  () => `Count: ${state.count}`
);

// 2. 绑定到已有 DOM 元素
const existingDiv = document.getElementById("my-div");
h.ref(existingDiv)(
  [state],
  { class: "dynamic" },
  () => state.content
);
```

#### h.onUpdate 使用示例

```typescript
const div = h.div();

// 元素更新钩子 - 当任何状态更新时触发
h.onUpdate(div, () => {
  console.log("State changed", state);
  // 不要在 onUpdate 中无条件调用 h.update，会导致循环调用
  // 错误示例：h.update(state);
});

// 全局更新钩子 - 监听所有更新
const unsubscribe = h.onUpdate(() => {
  console.log("Global update triggered!");
});

// 手动取消订阅
unsubscribe();
```

#### HTML 标签
支持所有标准 HTML 标签：div, span, h1-h6, p, button, input, textarea, select, ul, ol, li, table, tr, td, th, img, video, audio, svg, a, form, label, fieldset, legend, section, article, header, footer, nav, aside, main, strong, em, b, i, u, code, pre, blockquote, dl, dt, dd, thead, tbody, tfoot, caption, link, br, hr, meta, title, script, style, iframe, embed, object, 以及自定义标签。

### 5. 使用示例

```typescript
import { h } from "zeroeffect";

// 基本使用
const state = { count: 0 };
const div = h.div(
  [state],
  () => `Count: ${state.count}`
);

// 更新
state.count = 5;
h.update(state);

// 事件处理
const button = h.button(
  {
    onclick: () => {
      state.count++;
      h.update(state);
    }
  },
  "Click me"
);

// 条件渲染
const content = h.if(
  [state],
  () => state.count > 0,
  () => h.div("Positive"),
  () => h.div("Zero or negative")
);

// 列表渲染
const list = [1, 2, 3];
const listElement = h.list(
  list,
  (item) => h.div(`Item: ${item}`)
);

// 生命周期钩子
const element = h.div("Test");
h.onMount(element, () => {
  console.log("Mounted!");
});

h.onUpdate(element, () => {
  console.log("Updated!");
});

h.onRemove(element, () => {
  console.log("Removed!");
});
```
