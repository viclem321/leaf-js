


type RenderFn = () => void;

export class MiniScheduler {
  private isRendering = false;
  private isRenderQueued = false;
  private renderFn: RenderFn | null = null;

  setRenderFunction(fn: RenderFn) {
    this.renderFn = fn;
  }

  // each time a render is needed, call this one
  requestRender() {
    if (this.isRendering) {
        this.isRenderQueued = true;
    }
    else {
        this.performRender();
    }
    return;
  }


  // manage a render (put isRendering to True, execute the render, put isRendering to False, and execute other renders if queued)
  performRender() {
    if (!this.renderFn) throw new Error("No render function registered");
    if (this.isRendering) throw new Error("call performRender while isRendering == true. Error?");

    this.isRendering = true; this.isRenderQueued = false;

    try { this.renderFn(); } 
    finally {
      this.isRendering = false;
      // Si un nouveau render a ete demande entre-temps
      if (this.isRenderQueued) {
        this.performRender();
      }
    }
  }



  isRenderingNow() {
    return this.isRendering;
  }
}
