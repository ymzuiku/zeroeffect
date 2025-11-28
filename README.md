# zeroeffect Usage Guide for Claude

Document: https://zeroeffect.vercel.app/

CLAUDE: [CLAUDE.md](CLAUDE.txt)

## Core Concept

No Signal, no Proxy, no Virtual DOM.

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

## Key Rules

1. **Dependencies**: First parameter as array `[state]` makes content reactive to that state
2. **Manual Updates**: Call `h.update(state)` after modifying state to update DOM
3. **Reactive Content**: Functions in content position execute on update
4. **Reactive Attributes**: Functions as attribute values execute on update
5. **Event Handlers**: Attributes starting with `on` (e.g., `onclick`) are event handlers, not reactive

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
