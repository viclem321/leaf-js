import { HooksInstance, Effect} from "./hooks.mjs";
import { MiniScheduler } from "./miniSchedulerRender.mjs";
import { FiberNode } from "./buildVDOM.mjs";



/** 🧠 RUNTIME STATE

  This module contains the central runtime state of Miniweb. It holds global data used throughout the rendering lifecycle.
  This state is reset/updated at each render cycle and is not meant to be persistent outside the current app session.
  Think of `runtimeState` as a singleton: it stores all essential information about the current render cycle. Because there's only one shared runtime, Miniweb does not support multiple concurrent renders. Running multiple renders in parallel could corrupt this shared state and lead to unexpected behavior.

**/




export type RuntimeState = {
  hooksInstances: Map<string, HooksInstance>;   currentHooksInstance: HooksInstance | null;
  previousVDOM: FiberNode | null; previousVDOMDeletionsNodes: FiberNode[]; 
  actualVDOM: FiberNode | null;
  pendingEffects: Effect[];
  schedulerRender: MiniScheduler;
};




// That's the Singleton vvv
export const runtimeState: RuntimeState = {

  hooksInstances: new Map<string, HooksInstance>(),       // All hook instances, keyed by the unique instanceKey of each component. This allows Miniweb to keep state (useState, useEffect, etc.) across renders.
  currentHooksInstance: null,                             // Currently executing hook instance (used internally during rendering).
  
  actualVDOM: null,                                       // The Virtual DOM being built for the current render.  
  previousVDOM: null,                                     // The Virtual DOM from the previous render. Used during the diffing phase to detect changes.
  previousVDOMDeletionsNodes: [],                         // Nodes (FiberNodes) detected during diffing as deleted. These will be removed from the real DOM during the commit phase.                          
  
  pendingEffects: [],                                     // Effects (from useEffect) that are queued to run after the DOM commit.

  schedulerRender: new MiniScheduler(),                   // A tiny scheduler that prevents redundant renders. To trigger a render, always use: schedulerRender.requestRender()
};