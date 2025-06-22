# MiniWeb

Miniweb is a small, educational JavaScript framework built from scratch, in the spirit of libraries like React, with the goal of helping both myself and others better understand how such frameworks work under the hood.

This project is not meant for production use, but rather as a learning tool or playground. It implements a virtual DOM, fiber-based reconciliation, hooks (useState, useEffect), component rendering, and more.





## 🧪 Quick Start (demo)

To get started quickly, Miniweb includes a small demo app located in [`packages/demo`](./packages/demo).

This demo showcases the main features of the framework, including components, state updates, effect hooks, and dynamic rendering.

### ▶️ Run the demo locally

```bash
yarn install
yarn compile-miniweb
yarn compile-demo
cd packages/demo
npx serve .
```
Open the browser, and you're good to go!

### 🧪 Customize

You can easily modify the demo source code to experiment with your own components and ideas. Don't forget to recompile if you make changes:
```bash
yarn compile-demo
```

You can also build a brand-new site using Miniweb as a base, the demo gives you a simple starting point.







## ⚙️ Core Engine (How It Works)

The full source code for the Miniweb engine is located in [`packages/miniweb`](./packages/miniweb). The architecture is designed to be:

- 📚 Easy to read
- 💡 Pedagogical
- 🧩 Modular and extensible

The codebase is thoroughly **commented**, and the logic follows the internal steps of React-style rendering: virtual DOM creation, fiber reconciliation, scheduling, and DOM updates.

If you want to dive into the internals and understand how frameworks like React work, or even build your own, this is the place to look.

See [`packages/miniweb/README.md`](./packages/miniweb/README.md) for a full breakdown of the internal structure.






## Contributing & Feedback

There may be missing features, incomplete behavior, or even bugs. If you spot something wrong or have suggestions for improvements, feel free to open an issue or a pull request, I'll be happy to review and respond quickly.



## FAQ

Why not just use React?
Because Miniweb is about learning, not replacing. The goal is to build something from scratch and understand the inner mechanics of frameworks like React.

What's missing?
No devtools, no concurrent rendering, no advanced diffing (yet). But everything is modular and can be extended.



## Credits

Miniweb was inspired by Effectual, a project that reimplements a React-like framework from scratch. I discovered it while participating in a CTF event. While I did not use any of its code, the idea of building my own similar engine was born from that discovery, and I'm grateful for it.
