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

#### h.if 使用示例

```typescript
// 1. 基础条件渲染
const state = { show: true };
const visible = h.if(
  [state],
  () => state.show,
  () => h.div("内容可见")
);

// 2. 带 else 的条件渲染
const state2 = { isLoggedIn: false };
const content = h.if(
  [state2],
  () => state2.isLoggedIn,
  () => h.div("欢迎回来！"),  // 条件为真
  () => h.div("请登录")       // 条件为假
);

// 3. 嵌套条件渲染
const state3 = { outer: true, inner: false };
const nested = h.if(
  [state3],
  () => state3.outer,
  () => h.if(
    [state3],
    () => state3.inner,
    () => h.div("内外都显示"),
    () => h.div("内层隐藏")
  )
);

// 4. 与事件处理器结合
const state4 = { isExpanded: false };
const toggleContent = h.if(
  [state4],
  () => state4.isExpanded,
  () => h.div(
    { class: "expanded-content" },
    "展开的内容",
    h.button({
      onclick: () => {
        state4.isExpanded = false;
        h.update(state4);
      }
    }, "收起")
  ),
  () => h.button({
    onclick: () => {
      state4.isExpanded = true;
      h.update(state4);
    }
  }, "展开")
);

// 关键特性：
// - 返回初始的 span 元素，添加到 DOM 后会根据条件替换
// - 只有当条件返回值真正改变时才重新渲染
// - 条件为假且无 else 时，返回隐藏的 span 元素
```

#### h.list 使用示例

```typescript
// 1. 基础列表渲染
const list = [1, 2, 3];
const listElement = h.list(
  list,
  (value) => h.div(`项目: ${value}`)
);

// 2. 带索引的列表
const items = ['a', 'b', 'c'];
const numberedList = h.list(
  items,
  (value, index) => h.div(`${index + 1}. ${value}`)
);

// 3. 复杂对象列表
const todos = [
  { id: 1, text: '学习 TypeScript', completed: false },
  { id: 2, text: '练习零特效', completed: true },
  { id: 3, text: '构建应用', completed: false }
];

const todoList = h.list(
  todos,
  (todo) => h.div(
    { class: 'todo-item' },
    h.input({
      type: 'checkbox',
      checked: () => todo.completed,
      onchange: () => {
        todo.completed = !todo.completed;
        h.update(todo);
      }
    }),
    h.span(() => todo.text)
  )
);

// 4. 嵌套列表
const categories = [
  { name: '水果', items: ['苹果', '香蕉', '橙子'] },
  { name: '蔬菜', items: ['胡萝卜', '芹菜', '生菜'] }
];

const categoryList = h.list(
  categories,
  (category) => h.div(
    h.h3(() => category.name),
    h.ul(
      h.list(
        category.items,
        (item) => h.li(() => item)
      )
    )
  )
);

// 5. 响应式列表项
const state = { filter: 'all' };
const items2 = [
  { id: 1, text: '任务1', category: 'work' },
  { id: 2, text: '任务2', category: 'personal' },
  { id: 3, text: '任务3', category: 'work' }
];

const filteredList = h.list(
  items2,
  (item) => h.div(
    [state, item],  // 多个依赖项
    () => `${item.text} (${item.category}) - ${state.filter}`
  )
);

// 6. 列表增删操作
const list2 = [1, 2, 3, 4, 5];

// 添加元素
const addItem = () => {
  list2.push(list2.length + 1);
  h.update(list2);
};

// 删除元素
const removeItem = (index: number) => {
  list2.splice(index, 1);
  h.update(list2);
};

// 清空列表
const clearList = () => {
  list2.length = 0;
  h.update(list2);
};

// 7. 带样式的列表项
const users = [
  { id: 1, name: 'Alice', active: true },
  { id: 2, name: 'Bob', active: false },
  { id: 3, name: 'Charlie', active: true }
];

const userList = h.list(
  users,
  (user) => h.div(
    [user],
    {
      style: () => ({
        backgroundColor: user.active ? '#4CAF50' : '#ccc',
        padding: '10px',
        margin: '5px',
        borderRadius: '4px'
      }),
      class: 'user-item'
    },
    () => user.name
  )
);

// 8. 虚拟列表（大数据量）
const largeList = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  title: `Item ${i}`,
  description: `Description for item ${i}`
}));

const virtualContainer = h.virtualList(
  largeList,
  { style: { height: '500px', overflow: 'auto' } },
  (item) => h.div(
    { style: { padding: '10px', borderBottom: '1px solid #eee' } },
    h.h4(() => item.title),
    h.p(() => item.description)
  ),
  {
    itemHeight: 60,  // 固定高度
    overscan: 10     // 缓冲区项目数
  }
);

// 关键特性：
// - 高效更新：只在列表长度变化时重新渲染
// - 差分渲染：新增项目只渲染新项，不重新渲染所有项
// - 空列表返回隐藏的 span 占位符
// - 支持 TypeScript 泛型类型推断
// - 列表项内部可以有自己的依赖项
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
