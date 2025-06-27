
import { LeafElement, _fragment } from "./elements.mjs";
import { createFiberTree } from "./buildVDOM.mjs";
import { diffVDOM } from "./diff.mjs";
import { commitDOM } from "./commitDOM.mjs";
import { runtimeState } from "./runtime.mjs";


/** 🚀 MAIN RENDER FUNCTION

  This is the heart of leaf-js's rendering system.
  It performs a full synchronous render, transforming the app's component tree into DOM updates.
  This function should always be called via `runtimeState.schedulerRender.requestRender()`to avoid redundant executions and preserve batching behavior.


  This function does 5 key things:

    1. Saves the previous VDOM (`runtimeState.previousVDOM`)
    2. Builds a fresh new VDOM by evaluating all components (`createFiberTree(...)`)
    3. Compares the new VDOM to the previous one and tags nodes with changes (`diffVDOM(...)`)
    4. Commits the real DOM changes (creates, updates, deletes elements) (`commitDOM(...)`)
    5. Executes all pending `useEffect` callbacks and their optional cleanup

  
  Notes: This function is synchronous. Nothing else runs during the render. It is not concurrent or interruptible. At the end, the `runtimeState` is fully updated and ready for the next render.

**/




export function render(rootLeafElement: LeafElement, container: HTMLElement) {

  
  runtimeState.previousVDOM = runtimeState.actualVDOM || null;                // saving last VDOM

  runtimeState.actualVDOM = createFiberTree( rootLeafElement, null, "0-", 0 );      // create the new VDOM

  diffVDOM(runtimeState.actualVDOM, runtimeState.previousVDOM);               // Diff actualVDOM with previousVDOM (update actualVDOM modifTags)

  commitDOM(runtimeState.actualVDOM, container);                              // Commit the real DOM with the new Virtual DOM ( and if elements are removed; call cleanups and remove hookInstance of the element)


  // execute all effects stored inside runtimeState.pendingEffects
  for (const effect of runtimeState.pendingEffects) {
    if (effect) {
      if (effect.hookEffectEntry.cleanup) effect.hookEffectEntry.cleanup();   // execute the cleanup of the effect (only if the effect has already been executed)
      const ret = effect.callback();
      if (typeof ret === "function") effect.hookEffectEntry.cleanup = ret;    // execute effect
    }
  }
  runtimeState.pendingEffects = [];                                           // clean runtimeState.pendingEffects for the next render

}