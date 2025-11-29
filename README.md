# zeroeffect

A minimal reactive DOM library with zero magic, zero proxies, and zero virtual DOM.

Document: https://zeroeffect.vercel.app/
Usage Guide: [CLAUDE.md](CLAUDE.md)

## Core Concept

No Signal, no Proxy, no Virtual DOM. Just plain objects and explicit updates.

## Features

- ⚡ **Lightweight**: Minimal runtime, maximum performance
- 🎯 **Explicit**: Manual updates with `h.update()`
- 🔄 **Reactive**: Automatic dependency tracking
- 🎨 **Typed**: Full TypeScript support
- 📦 **Complete**: Lists, conditionals, virtual lists, lifecycle hooks
- ♻️ **Memory-safe**: WeakMap/WeakSet for automatic cleanup

## Basic Usage

```typescript
import { h } from "zeroeffect";

// State is just a plain object
const state = { count: 0 };

// Create element with reactive content
const div = h.div(
  [state], // First arg: dependencies array
  () => `Count: ${state.count}` // Reactive content function
);

// Update state and trigger re-render
state.count = 5;
h.update(state); // Manual update required
```

## Core API

### Creating Elements

```typescript
// Simple element
h.div("Hello")

// With attributes
h.div({ class: "greeting" }, "Hello")

// With reactive attributes
h.div({ class: () => state.active ? "active" : "inactive" })

// With content
h.button({ onclick: () => doSomething() }, "Click me")

// Nested elements
h.ul(
  h.li("Item 1"),
  h.li("Item 2")
)
```

### Reactive State

```typescript
const state = { count: 0, text: "hello" };

// Reactive content
h.div([state], () => `${state.text}: ${state.count}`)

// Reactive attributes
h.input({
  value: () => state.text,
  class: () => state.text.length > 0 ? "valid" : "invalid"
})
```

### Lists

```typescript
const items = [1, 2, 3];

// Simple list
h.list(items, (item) => h.div(`Item ${item}`))

// Reactive list items
const todos = [{ text: "Learn zeroeffect", done: false }];
h.list(todos, (todo) =>
  h.div(
    [todo],
    () => `${todo.text} - ${todo.done ? "✓" : "○"}`
  )
)
```

### Conditionals

```typescript
const state = { show: true };

h.if(
  [state],
  () => state.show,
  () => h.div("Visible"),
  () => h.div("Hidden")
)
```

### Lifecycle Hooks

```typescript
const element = h.div("Content");

// Mount
h.onMount(element, () => {
  console.log("Element mounted!");
});

// Update
h.onUpdate(element, () => {
  console.log("Element updated!");
});

// Remove
h.onRemove(element, () => {
  console.log("Element removed!");
});

// Subscribe to updates (returns unsubscribe function)
const unsubscribe = h.onUpdate(() => {
  console.log("Global update triggered!");
});
// Later: unsubscribe()
```

### Virtual Lists

```typescript
// For large lists (1000+ items)
h.virtualList(
  largeArray,
  { style: { height: "400px", overflow: "auto" } },
  (item) => h.div(item.name),
  { itemHeight: 50 }
)
```

### Binding to Existing Elements

```typescript
// Bind reactive behavior to existing DOM elements
const existingDiv = document.getElementById("my-div");
h.ref(existingDiv)(
  [state],
  { class: "dynamic" },
  () => state.content
);
```

### CSS and HTML

```typescript
// Inject CSS
h.css(`
  .button {
    padding: 10px;
    background: blue;
  }
`);

// Parse HTML string
const container = h.innerHTML("<div>HTML content</div>");
```

## Key Rules

1. **Dependencies**: First parameter as array `[state]` makes content reactive to that state
2. **Manual Updates**: Call `h.update(state)` after modifying state to update DOM
3. **Reactive Content**: Functions in content position execute on update
4. **Reactive Attributes**: Functions as attribute values execute on update
5. **Event Handlers**: Attributes starting with `on` (e.g., `onclick`) are event handlers, not reactive
6. **Cleanup**: Use the unsubscribe function returned by `h.onUpdate()` to prevent memory leaks

## Testing

All interactive elements should include `data-testid` attributes:

```typescript
h.button({
  'data-testid': 'submit-button',
  onclick: () => handleSubmit()
}, "Submit")
```

See [CLAUDE.txt](CLAUDE.txt) for detailed testing standards.

## Performance

- **Batched Updates**: Multiple `h.update()` calls in the same frame are batched together
- **Efficient Diffing**: Lists only re-render when length changes
- **Virtual Scrolling**: Large lists use virtual rendering
- **Memory Safe**: WeakMap/WeakSet ensure automatic cleanup

## License

MIT License. See [LICENSE](LICENSE) for details.
