
/**      SCHEDULER - Controls render frequency and prevents redundant renders.

  The scheduler ensures that only one render runs at a time.
  If multiple setState calls happen in quick succession, they are batched and cause only one render per tick.

**/




// Type for the render function to execute
type RenderFn = () => void;






export class MiniScheduler {

  private renderFn: RenderFn | null = null;    // the render function to call (usually passed at startup)
  private isRendering = false;                 // true if a render is currently running
  private isRenderQueued = false;              // true if a render is waiting in the queue for being running


  // register the render function (usually Miniweb.render). Must be called before using requestRender
  setRenderFunction(fn: RenderFn) {
    this.renderFn = fn;
  }

  
  // public method to request a render.  
  // this is what should be called every time something triggers a render (e.g., setState). It ensures we never start a render while one is already in progress
  requestRender() {
    if (this.isRendering) {
      // if a render is currently running, mark that we need to rerun it afterwards
      this.isRenderQueued = true;
    }
    else {
      // if nothing is rendering, go ahead and start.
      this.performRender();
    }
    return;
  }




  // internal method that actually runs the render.
  // if a render was requested during this execution, it re-triggers automatically at the end
  performRender() {
    if (!this.renderFn) throw new Error("No render function registered");
    if (this.isRendering) throw new Error("call performRender while isRendering == true. Error?");

    this.isRendering = true; this.isRenderQueued = false;

    try { this.renderFn(); }    // run the actual render function
    finally {
      this.isRendering = false;
      if (this.isRenderQueued) {
        // if something triggered a render during this one, perform it again
        this.performRender();
      }
    }
  }



}
