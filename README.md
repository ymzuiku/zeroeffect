# no-no-no Usage Guide for Claude

## Core Concept

No Signal, no Proxy, no Virtual DOM.

## Basic Usage

```typescript
import { h } from "./src";

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

## Key Rules

1. **Dependencies**: First parameter as array `[state]` makes content reactive to that state
2. **Manual Updates**: Call `h.update(state)` after modifying state to update DOM
3. **Reactive Content**: Functions in content position execute on update
4. **Reactive Attributes**: Functions as attribute values execute on update
5. **Event Handlers**: Attributes starting with `on` (e.g., `onclick`) are event handlers, not reactive

## Common Patterns

```typescript
// Reactive content
h.div([state], () => `Value: ${state.value}`);

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
  (item, index) => h.div([item], () => `Item: ${item}`) // Each item can have its own dependencies
);
// When items.length changes, list re-renders
// Individual items update when their own dependencies change

// Bind to existing element
h.element(existingDiv)([state], () => state.text);
```

## Special Methods

- `h.update(state)` - Manually trigger update for state
- `h.onUpdate(callback)` - Register update callback
- `h.css(styles)` - Inject CSS into head
- `h.innerHTML(html)` - Render HTML string
- `h.if(deps, condition, renderFn, elseRenderFn?)` - Conditional rendering
  - `deps`: Dependencies array
  - `condition`: Function returning truthy/falsy
  - `renderFn`: Function returning element when condition is true
  - `elseRenderFn`: Optional function returning element when condition is false (if omitted, returns hidden span)
- `h.list(deps, renderFn)` - List rendering
  - **First dependency MUST be the array to render** (e.g., `[items, otherState]` where `items` is the list)
  - Other dependencies are optional and shared across all items
  - `renderFn(value, index)`: Function that returns element for each item
  - **Each item element can have its own dependencies** (e.g., `h.div([item], ...)` makes each item reactive to its own data)
  - List re-renders when array length changes
  - Individual items update when their own dependencies change
- `h.element(element)` - Bind reactive properties to existing element

## Important Notes

- Multiple `h.update()` calls in same frame are batched
- Falsy values (`false`, `null`, `undefined`, `NaN`, `''`) don't render
- Custom tags: `h["custom-tag"]()` works, but reserved methods don't: `update`, `onUpdate`, `list`, `if`, `css`, `innerHTML`, `element`
- **TypeScript**: For custom tags, use type assertion: `h["iconify-icon" as "div"]({ ... })` to avoid type errors
- Elements must be in DOM for updates to work
