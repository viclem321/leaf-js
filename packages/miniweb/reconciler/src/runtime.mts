import { HooksInstance, Effect} from "./hooks.mjs";
import { MiniScheduler } from "./miniSchedulerRender.mjs";
import { FiberNode } from "./vdom.mjs";



// it is a singleton whose purpose is to manage renderings


export type RuntimeState = {
  hooksInstances: Map<string, HooksInstance>;   currentHooksInstance: HooksInstance | null;
  previousVDOM: FiberNode | null; previousVDOMDeletionsNodes: FiberNode[]; 
  actualVDOM: FiberNode | null;
  pendingEffects: Effect[];
  schedulerRender: MiniScheduler;
};



export const runtimeState: RuntimeState = {
  hooksInstances: new Map<string, HooksInstance>(), currentHooksInstance: null,    // hooks instances (maped with instanceKey)
  previousVDOM: null, previousVDOMDeletionsNodes: [], // notice all nodes to delete at the end of this render. 
  actualVDOM: null,                                // thats the actual Virtual DOM                            
  pendingEffects: [],  // all effects awaiting to be executed
  schedulerRender: new MiniScheduler(),  // each time you want to render, call schedulerRender.requestRender()
};