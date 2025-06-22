# 🧪 Miniweb Demo

This folder contains a **simple demo application** built with the Miniweb framework.

Its purpose is to showcase and test the main features of Miniweb in a clear and minimal example, including:

- Functional components
- `useState` and `useEffect` hooks
- Conditional rendering
- Dynamic DOM updates
- Component mounting/unmounting
- add props inside components (css style, functions, key, or other)





## ▶️ How to Run

From the root of the project, install dependencies and compile both the engine and the demo:

```bash
yarn install
yarn compile-miniweb
yarn compile-demo
cd packages/demo
npx serve .
```

You can now open the demo in your browser at http://localhost:3000 (or whatever port serve uses).





## ✏️ How to Modify

You can edit the demo by modifying the source files in this folder, especially App.tsx.

After any changes, rebuild the demo:

```bash
yarn compile-demo
```

You're free to add your own components, try out edge cases, simulate mount/unmount cycles, test DOM updates and performance

This demo is meant to be your playground.






## 🔧 Demo Structure

This demo is written in TypeScript and compiled using Rollup with support for .tsx syntax.

Here's how it's structured:

- index.html :   A minimal HTML file that loads the app via a single `<script>` tag pointing to the bundled JavaScript. That's the file to serve to users, in production.

- main.tsx  :    The entry point of the app. This is where we:

    - Import and initialize the Miniweb engine.

    - Set the render function via scheduler.setRenderFunction(...).

    - Call the first render()(via the scheduler) to mount the root component(`<App/>`) inside the DOM #root container.

- App.tsx  :   The root React-style component of the app. This file contains the overall layout and the components used in the UI. It's the best place to experiment with new components or logic. Notice that every component (App, Header, Clock etc) are written using TSX syntax (transformed into functions at the typescript compilation), totally compatible with MiniWeb.


- App.tsx  :   This is the root component (`<App/>`) of the demo application. It defines the main layout and handles all interactive logic, including components like Header, Clock, and List.

All components are written using TSX syntax, which is compiled by TypeScript into plain JavaScript Miniweb functions. For example, when you write <Component prop1="hello"/>, it gets transformed into Miniweb.createElement( Component, { prop1: "hello" } ) during compilation, thanks to the project's tsconfig.json.

This file acts as a sandbox: you can freely experiment by adding components, testing state updates, or using hooks like useEffect. It's the best place to get hands-on with how Miniweb works in a real interface.

Note: All the demo code, including main.tsx, App.tsx, tsconfig.json, and the Rollup configuration, is heavily commented to maximize clarity and help you understand exactly what's happening at each step.






## 🔄 Integration with the Core

The demo uses the Miniweb framework located in packages/miniweb. It imports and interacts with the engine like any external app would:

import { render, _jsx, _fragment, useState, useEffect } from "@miniweb/core"

If you want to understand how Miniweb works internally, head over to the core engine README.