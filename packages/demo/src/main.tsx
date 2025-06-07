import * as F from "@miniweb/core";
import { App } from "./App.js";



// initialize the shedulerRender with the good function (the render function).
F.runtimeState.schedulerRender.setRenderFunction(() => {
    F.render(<App />, document.getElementById("root")!);
  });
// execute the very first render
F.runtimeState.schedulerRender.requestRender();
