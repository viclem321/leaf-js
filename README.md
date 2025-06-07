# MiniWeb

Miniweb is a small, educational JavaScript framework built from scratch — in the spirit of libraries like React — with the goal of helping both myself and others better understand how such frameworks work under the hood.

This project is not meant for production use, but rather as a learning tool or playground. It implements a virtual DOM, fiber-based reconciliation, hooks (useState, useEffect), component rendering, and more.

There may be missing features, incomplete behavior, or even bugs. If you spot something wrong or have suggestions for improvements, feel free to open an issue or a pull request — I’ll be happy to review and respond quickly.

A small demo app is included in this repository to showcase how Miniweb works in practice. It includes common usage patterns such as components, state updates, and effects.

Miniweb was inspired by Effectual, a project that reimplements a React-like framework from scratch. I discovered it while participating in a CTF event. While I did not use any of its code, the idea of building my own similar engine was born from that discovery — and I’m grateful for it.



# How To use it?

To run fast the demo locally :
    yarn install
    yarn compile-miniweb
    yarn compile-demo
    cd package/demo
    npx serve .
