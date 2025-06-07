
import { MiniElement, _fragment } from "./elements.mjs";
import { reconcile, diffVDOM } from "./vdom.mjs";
import { commitDOM } from "./commitDOM.mjs";
import { runtimeState } from "./runtime.mjs";





// thats the more important function (notice thats a sync function. Nothing else is execcuted during the render func). Important : Always call this func from runtimeState.schedulerRender
export function render(rootMiniElement: MiniElement, container: HTMLElement) {

  // saving last VDOM
  runtimeState.previousVDOM = runtimeState.actualVDOM || null;

  // create the new VDOM
  runtimeState.actualVDOM = reconcile( rootMiniElement, null, "0-", 0 );

  // Diff actualVDOM with previousVDOM (update actualVDOM modifTags)
  diffVDOM(runtimeState.actualVDOM, runtimeState.previousVDOM);

  // commit DOM (actualize the DOM with the actualVDOM). This function will also remove DOM elements that are not use anymore, so call effect cleanups, delete hookInstance and delete element from DOM
  commitDOM(runtimeState.actualVDOM, container);


  // execute all effects inside pending Effect and clean pendingEffect for next render. (at the end of the effect, stock cleanup, and if its the second time that your call the effect, call cleanup before)
  for (const effect of runtimeState.pendingEffects) {
    if (effect) {
      if (effect.hookEffectEntry.cleanup) effect.hookEffectEntry.cleanup();
      const ret = effect.callback();
      if (typeof ret === "function") effect.hookEffectEntry.cleanup = ret;
    }
  }
  runtimeState.pendingEffects = [];

}