import { runtimeState } from "./runtime.mjs";



// HOOKS TYPES -----------------
export type HooksInstance = {
  // hooks manager
  hooks: HookEntry[]; hookIndex: number; 
};

export type HookEntry = any | HookEntryEffect;

export type HookEntryEffect = {
  deps: any[];   cleanup?: () => void;
  }

// Effect structure use for keep effects in runtimeState.pendantEffect
export type Effect = {
callback: () => void | (() => void);
hookEffectEntry: HookEntryEffect;
}









// variable to get and set as hook that allow to manage variables along multiple renders. variables are kept inside a tableau inside the singleton
export function useState<T>(initialValue: T): [T, (value: T) => void] {
  if (!runtimeState.currentHooksInstance) { throw new Error("useState called, but there isnt an activ Instance..."); }
  const instance = runtimeState.currentHooksInstance;   const i = instance.hookIndex;

  // if this hook exist, keep it, else create it with inital value
  instance.hooks[i] = instance.hooks[i] ?? initialValue;

  // call this function for actualize value of the hook
  const setState = (value: T) => {
    if (!instance) { throw new Error("setState must be called inside a component existant"); }
    instance.hooks[i] = value;
    runtimeState.schedulerRender.requestRender();
  };

  // improve hookIndex for manage the next hook later
  runtimeState.currentHooksInstance.hookIndex++;
  // return the hook reference + the setter
  return [instance.hooks[i], setState];
}




// manage effects. deps are kept in hook, and deps are compare with oldDep. If it changed, effect is send to queue Effect for being executed after the render. if cleanup already exist, it is executed before
export function useEffect(fn: () => void | (() => void), deps: any[]) {

  // get current instance
  if (!runtimeState.currentHooksInstance) { throw new Error("useEffect must be called inside a component"); }
  const instance = runtimeState.currentHooksInstance;  const i = instance.hookIndex;

  if (!instance.hooks[i]) { instance.hooks[i] = { deps: undefined, cleanup: undefined }; }

  // get previous dependencies with old values
  const prevDeps = instance.hooks[i]?.deps;
  // verify if previous deps value === new deps values
  const hasChanged = !deps || !prevDeps || deps.some((d, i) => d !== prevDeps[i]);

  if (hasChanged) {
    // if changed, add Effect to pendingEffects
    runtimeState.pendingEffects.push({ callback: fn, hookEffectEntry: instance.hooks[i] });
  }
  
  // actualize prevDeps and prepare next hook
  instance.hooks[i].deps = deps;
  // improve hookIndex for manage the next hook later
  instance.hookIndex++;
}






// call all cleanups of a instance (before remove the instance)
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