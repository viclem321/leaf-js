# 🧠 Miniweb Core

This is the core engine of the Miniweb framework, the part responsible for rendering components, managing the virtual DOM, executing hooks, handling updates, and committing changes to the real DOM.

Unlike production frameworks like React, Miniweb is intentionally simple, fully documented, and written with learning in mind. Its goal is not performance or feature-completeness, but transparency.

Whether you're a beginner curious about how frameworks work under the hood, or an advanced developer wanting to build your own tools, this is where to look.

All the core logic is contained in this folder, no black magic, no hidden steps.
<br><br>







## ⚙️ Important concepts to understand


Miniweb follows a simplified version of how modern frameworks like React operate. Below is a high-level overview of the main concepts behind its internal mechanics:


    - Component :
        Components in Miniweb are simple functions written in TSX/JSX that return a MiniElement (see next section for details about MiniElement).
        If you look at the return value of your components, you will not directly see a MiniElement, but rather a tag containing another component (<Component1/>), or a known html tag (<div>). In fact, at compile time, typescript takes care of transforming this tag into a call to the Miniweb.createElement(Component1) function, which returns a MiniElement containing all the information about Component1.
        From there, Miniweb uses the MiniElement to building the app tree recursively.
        📄 See ../packages/demo/App.tsx and src/elements.mts.
    

    -MiniElement :
        A MiniElement is a lightweight, temporary object created by Miniweb.createElement(...). It represents whether a component like <Component1 /> or a native DOM element like <div>.
        It contains the metadata needed to run the component (if needed) and build a Fiber Node (see below for details about Fiber Nodes).
        Metadata contained are : the type (string or function), the props, and the children.
        ⚠️ MiniElements are not the virtual DOM yet, they are a simplified structure used to describe what to render and to help build the actual Fiber tree.
        📄 see src/element.mts



    - Virtual DOM (Fiber Tree) :
        The virtual DOM in Miniweb is an in-memory tree built from MiniElements. It represents the full structure of the UI at a given time.
        During the rendering phase, Miniweb recursively executes components and transforms the resulting MiniElements into a FiberNode tree, also called the virtual DOM.
        This structure allows Miniweb to later compare two versions of the tree (diffing), detect changes, and update the real DOM efficiently.
        📄 See src/vdom.mts
    

    - Fiber Node :
        A FiberNode is the core structure used to represent each element in the virtual DOM.
        Each FiberNode contains:
            type: the tag name or component function
            props: the props passed to the element
            children: child FiberNodes
            dom: a reference to the actual DOM element (if created)
            modifTag: used during the diffing phase to mark additions, updates, or deletions
            instanceKey: a stable key used to identify a element across renders
        ⚠️ Don't confuse MiniElement with FiberNode: MiniElement is a temporary structure created by createElement(...) while FiberNode is the real node in the virtual DOM used for diffing and rendering
        📄 See src/vdom.mts


    - Diffing (Reconciliation) :
        Once the new fiber tree (virtual DOM) is constructed, Miniweb compares it with the previous one. This process identifies changes: New nodes = PLACEMENT, Modified props = UPDATE, Missing nodes = marked for DELETION
        The result is a new fiber tree where each node is tagged with a modifTag that drives the DOM update.
        📄 See src/vdom.mts


    - Commit Phase :
        After diffing, the real DOM is updated: new DOM elements are created and inserted, updated props are synced, Removed elements are detached, and cleanup (hooks, effects) is performed.
        This is the final part of the render cycle.
        📄 See src/commitDOM.mts


    - InstanceKey (Component identity):
        Each component in Miniweb is uniquely identified using an instanceKey. This key is determined based on the explicit key prop provided by the user (preferred), or, if no key is given, the component's exact path in the virtual DOM tree.
        This identity allows Miniweb to persist internal data (like hooks) between renders, even when the component is re-executed.
        ⚠️ Important: When rendering conditional branches or lists of components of the same type, always use a key prop. This ensures Miniweb can match components across renders and preserve their state correctly.


    - Hooks: useState & useEffect
        Hooks are persistent values bound to a component's lifecycle across renders.
        Each component is identified by an instanceKey, which allows Miniweb to associate the right hook data during execution.
            useState: holds reactive state
            useEffect: manages side effects and supports cleanup on unmount
        Hooks are automatically destroyed when the component associate unmounts.
        📄 See src/hooks.mts


    - Scheduler :
        A simple scheduling mechanism prevents multiple redundant renders and ensures updates are batched using microtasks. A render is only triggered once per tick, even if setState is called many times.
        Important: Always use the scheduler to run a render (calling miniweb.render directly may cause conflicts).
        📄 See src/miniSchedulerRender.mts
<br><br>






##  Recap of a Render Cycle : 


When scheduler.render() is called, Miniweb performs the rendering in 4 main steps:

    1. Scheduling :
    The scheduler checks whether a render is already in progress. If not, it calls the main render() function, else it queues the render.

    2. Building the Virtual DOM : 
    The root component (typically <App />) is run.
    Miniweb recursively walks through each component and its children, calling reconcile(...) to generate a new virtual DOM tree made of FiberNodes.
    This phase executes user-defined components and builds up the structure of the UI.

    3. Diffing (Reconciliation) :
    The new virtual DOM is compared with the previous one using the diff(...) function.
    For each node, Miniweb determines whether it is new, needs to be updated, or should be removed, by tagging it with a modifTag.

    4. Commit Phase (Updating the Real DOM) :
    Finally, commitDOM(...) applies the changes to the actual DOM based on the tagged FiberNodes. New elements are created and inserted, updated props are synced, removed elements are deleted, cleanup is performed (e.g. for unmounted effects)



✅ The engine is unopinionated, there is no JSX parser, no router, no complex lifecycle. It's all written from scratch and fully understandable in a few files.

