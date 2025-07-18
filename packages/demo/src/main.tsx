import * as F from "leaf-js";     // import the engine
import { App } from "./App.js";         // import the root component




// Initialize the scheduler with the correct render function.
// This tells the scheduler: "Each time I call schedulerRender.requestRender(), you should execute this render function (F.render(...))."
F.runtimeState.schedulerRender.setRenderFunction(() => {
    F.render(<App />, document.getElementById("root")!);
  });



// Trigger the very first render.
// You should never call F.render directly, always go through the scheduler.  Why? Because one render can trigger another render (and so on). The scheduler's job is to check whether a render is already in progress. If yes, it queues the next one. If not, it starts rendering immediately.
F.runtimeState.schedulerRender.requestRender();







/**

🚀 main.tsx - The starting point of the entire app lifecycle in leaf-js.


This is the first javascript file to be executed by the client. It bootstraps the leaf-js demo by :

  - Importing the root component (`App`)
  - Setting the render function to be used by the scheduler. Scheduler is a small object that ensures that multiple renders do not occur at the same time (for more infos : leaf-js/src/Scheduler.mts)
  - Triggering the first render manually

**/
