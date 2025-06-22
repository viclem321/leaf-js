import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import css from "rollup-plugin-import-css";



export default [
    {
        input: "src/main.tsx",     // entry point for rollup (the file to compile is main.tsx)
        output: {                  // the output of the compilation will be located in dist/bundle.mjs. This is the final JavaScript file, the one that will be distributed to clients.
            file: "dist/bundle.mjs",
            format: "esm",
            sourcemap: true,
        },
        plugins: [nodeResolve(), typescript(), css({ inject: true })],
    },
];



/**
 🛠️ Rollup Configuration
 
In this project, Rollup is the tool responsible for building the demo application. It's triggered when you run `yarn compile-demo` from the root of the project.
 
Rollup is a JavaScript module bundler. It takes a set of JS/TS/TSX modules, applies any necessary transformations (like TypeScript compilation), and outputs a single optimized bundle, here written to the `/dist` directory.

This file (`rollup.config.mjs`) defines how the bundling works. Plugins are used to extend Rollup's behavior:
    - `@rollup/plugin-node-resolve` allows importing packages from `node_modules`
    - `@rollup/plugin-typescript` compiles TypeScript and TSX files into JavaScript. It automatically uses the configuration from `./tsconfig.json`
    - `rollup-plugin-import-css` lets you import CSS files directly in your code, and injects them into the document at runtime
This setup allows the demo to be written using TypeScript and modern JSX, while keeping the output lean, browser-ready, and easy to debug (thanks to sourcemaps).

To summarize, in this projet, the compilation is done in this way : `yarn compile-demo` > `rollup -c rollup.config.mjs` > Rollup uses the TypeScript plugin to compile `.ts/.tsx` modules to `.js` modules  >  All modules are bundled into a single output: `/dist/bundle.mjs` by rollup.
**/