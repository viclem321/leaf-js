import { runtimeState } from "./runtime.mjs";

/**

  🧠 Hooks System

  This file implements the internal hooks engine of leaf-js, providing all structures, types and functions for manage components hooks instance (including `useState` and `useEffect`).

**/




// Each component instance has its own "HooksInstance" object, which stores the current list of hooks (useState/useEffect) and keeps track of which hook is being evaluated during rendering.
// At each render, component are rely to his instance thanks to instanceKey. So its important to not forget to put key prop when necessary
export type HooksInstance = {
  // hooks manager
  hooks: HookEntry[];   // hooks: An array of HookEntry (can be a value or an effect object)
  hookIndex: number;    // Used to know which hook to read/write during render
};

export type HookEntry = any | HookEntryEffect;        // A slot in the `hooks` array. It can either store a value (for useState), or a HookEntryEffect (for useEffect).

export type HookEntryEffect = {                       // Stores the dependencies (`deps`) and the optional cleanup function of a useEffect hook.
  deps: any[];   cleanup?: () => void;
}


// Structure used to store effects that must be executed after the DOM is commited (at the end of the render)
export type Effect = {
callback: () => void | (() => void);
hookEffectEntry: HookEntryEffect;
}





// Enables a component to persist state across renders, by allowing to store variables inside the hook instance.
// Must be called inside a component function (like in React). Returns a tuple: [value, setValue].  Calling `setValue(newValue)` updates the state and schedules a re-render of the component.
// The component must be identifiable across renders for the state to persist.  This is typically done by providing a unique `key` prop if needed (especially in conditionals or lists).
export function useState<T>(initialValue: T): [T, (value: T) => void] {
  if (!runtimeState.currentHooksInstance) { throw new Error("useState called, but there isnt an activ Instance..."); }
  const instance = runtimeState.currentHooksInstance;   const i = instance.hookIndex;

  instance.hooks[i] = instance.hooks[i] ?? initialValue;  // if this hook exist (not the first render of this component), keep it, else create it with inital value


  // call this function for modify value of this hook
  const setState = (value: T) => {
    if (!instance) { throw new Error("setState must be called inside a component existant"); }
    instance.hooks[i] = value;
    runtimeState.schedulerRender.requestRender();
  };


  runtimeState.currentHooksInstance.hookIndex++;  // improve hookIndex for manage the next hook later
  return [instance.hooks[i], setState];           // return the hook reference + the setter
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






/**
  🧪 Example usage of useState and useEffect in a component (TSX):
    const [count, setCount] = useState(0);
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