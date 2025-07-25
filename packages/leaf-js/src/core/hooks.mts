import { runtimeState } from "./runtime.mjs";

/**

  🧠 Hooks System

  This file implements the internal hooks engine of leaf-js (including `useState` and `useEffect`).

  As a reminder, hooks are special functions that you can call inside functional components to add extra behavior

  For the moment, implemented hooks are : useState() , useRef() and useEffect().

**/







// HooksInstance is a structure that stores persistent data for a specific component instance across renders. Each component instance in the VDOM is associated with its own HooksInstance via an instanceKey.
// Inside this structure, the component instance can store datas, and retrieve them in the next renders. Most hooks (like useState, useEffect, etc.) use it in their implementation. 
// For example, useState saves its state value into the HooksInstance during the first render,  and retrieves it during subsequent renders. The hookIndex is incremented after each hook call to ensure each hook accesses the correct slot in the hooks array.
// Important: During each render, a component is linked to its corresponding HooksInstance using instanceKey. So InstanceKey should always be unique for a component instance (see the `getInstanceKeyIfLeafElement` function in buildVDOM.mts for more details).
export type HooksInstance = {
  hooks: HookEntry[];   // hooks: An array of HookEntry
  hookIndex: number;    // Used to know which hook is currently read/write during render
};

export type HookEntry = any | HookEntryEffect;        // A slot in the `hooks` array. It can store a value (or a set of values) belonging to a hook










// Enables a component to persist a mutable reference across renders, by allowing to store variables inside the Hooksinstance.
// Must be called inside a component function (like in React). Returns a tuple: [value, setValue].  Calling `setValue(newValue)` updates the state and schedules a re-render of the component.
export function useState<T>(initialValue: T): [T, (value: T) => void] {
  if (!runtimeState.currentHooksInstance) { throw new Error("useState called, but there isnt an activ Instance..."); }
  const instance = runtimeState.currentHooksInstance;   const i = instance.hookIndex;

  instance.hooks[i] = instance.hooks[i] ?? initialValue;  // if this hook exist, keep it, otherwise create it with inital value


  // call this function for modify value of this hook
  const setState = (value: T) => {
    if (!instance) { throw new Error("setState must be called inside a component existant"); }
    instance.hooks[i] = value;
    runtimeState.schedulerRender.requestRender();
  };


  runtimeState.currentHooksInstance.hookIndex++;  // improve hookIndex for next hooks
  return [instance.hooks[i], setState];           // return the hook reference + the setter
}








// Enables a component to persist a mutable reference across renders, by allowing to store variables inside the Hooksinstance. Unlike useState, updating `.current` does not trigger a re-render.
// Returns an object with a single `.current` property that can hold any value. 
// Typically used to store values that should survive across renders without affecting rendering logic (like timers, DOM refs, etc.).
// Note: In React, useRef also enables usage of the `ref` prop to access DOM elements. This functionality is not yet implemented here.
export function useRef<T>(initialValue: T): { current: T } {
  if (!runtimeState.currentHooksInstance) { throw new Error("useRef called, but there isnt an activ Instance..."); }
  const instance = runtimeState.currentHooksInstance;   const i = instance.hookIndex;

  instance.hooks[i] = instance.hooks[i] ?? { current: initialValue };  // if this entryHook exist, keep it, otherwise create it with inital value

  runtimeState.currentHooksInstance.hookIndex++;                       // improve hookIndex for next hooks
  return instance.hooks[i];
}







// Declare a side-effect (a function) to be run after the actual render. Works similarly to React.
// The effect is executed only when dependencies (`deps`) change since the last render.  If the effect returns a function, it will be used as a cleanup, and automatically called before the effect re-runs or when the component unmounts.
// Effects are not run during the render phase, they are queued inside runtimeState.pendingEffects, and executed after the render.
export function useEffect(fn: () => void | (() => void), deps: any[]) {

  // get current instance
  if (!runtimeState.currentHooksInstance) { throw new Error("useEffect must be called inside a component"); }
  const instance = runtimeState.currentHooksInstance;  const i = instance.hookIndex;
  if (!instance.hooks[i]) { instance.hooks[i] = { deps: undefined, cleanup: undefined }; }

  const prevDeps = instance.hooks[i]?.deps;      // get previous dependencies with old values
  const hasChanged = !deps || !prevDeps || deps.some((d, i) => d !== prevDeps[i]);   // verify if deps are changed since the last render (if deps = [], hasChanged = true only at the first render of this component)

  if (hasChanged) {        // if changed, add Effect to pendingEffects (for execute the effect at the end of the render)
    runtimeState.pendingEffects.push({ callback: fn, hookEffectEntry: instance.hooks[i] });
  }
  

  instance.hooks[i].deps = deps;                // actualize prevDeps and prepare next hook (deps are kept inside hook Instance)
  instance.hookIndex++;                         // improve hookIndex for manage the next hook later
}



export type HookEntryEffect = {                       // Stores the dependencies (`deps`) and the optional cleanup function of a useEffect hook.
  deps: any[];   cleanup?: () => void;
}

// Structure used to store effects that must be executed after the DOM is commited (at the end of the render)
export type Effect = {
  callback: () => void | (() => void);
  hookEffectEntry: HookEntryEffect;
}








/**
  🧪 Example usage of useState and useEffect in a component (TSX):
    const [count, setCount] = useState(0);
    const timer = useRef(null);
    useEffect(() => { console.log("Mounted"); return () => console.log("Cleaned up because Unmount"); }, []);
    return ...
*/


















// Called when a component is removed from the virtual DOM. This clears all its associated hooks and calls any remaining cleanup functions.
export function cleanupHooksInstance(instance?: HooksInstance) {
  if (!instance) return;
  for (const hook of instance.hooks) {
    if (hook && typeof hook === "object" && "cleanup" in hook && typeof hook.cleanup === "function") {
      try {
        hook.cleanup();
      } catch (e) {
        console.warn("Error during cleanup:", e);
      }
    }
  }
}