import { HooksInstance, Effect} from "./hooks.mjs";
import { LeafComponent, LeafChild, LeafElementType, LeafElement, _fragment } from "./elements.mjs";
import { runtimeState } from "./runtime.mjs";



/**    🌱 CREATE VIRTUAL DOM (Fiber Tree)
 

  This file contains the logic to build the Virtual DOM (aka Fiber Tree) from a tree of LeafElements returned by user-defined components.
  This is the first phase of a render: traversing the user's app starting from the root LeafElement (usually <App />), evaluating all components, and creating a tree of FiberNodes that represent the structure of the UI.
  Each component execution returns a LeafElement, which is then recursively evaluated into a tree of FiberNodes, storing info like type, props, children, DOM reference, instanceKey, etc.  This tree is later passed to the diff and commit phases.

  
  
  🔍 Step-by-step explanation of how the VDOM is created:

    Let's take a very simple example:
        function App() {
          return <div>
            <Component1 prop1="hello" key="test" />
            <Component2 />
          </div>
        }

    At compile time, thanks to the JSX transform, the code above becomes:
        function App() {
          return createElement("div", null,
            createElement(Component1, { prop1: "hello", key: "test" }),
            createElement(Component2, null)
          );
        }

    So what happens during VDOM construction?

      1. Rendering begins with: `createFiberTree(createElement(App))`
        → Since App is a component, it will be executed (App()) to return its child LeafElement.

      2. App returns a <div> element. A FiberNode is created to represent App, and we now call `createFiberTree(...)` again, this time for the <div> LeafElement.

      3. Since <div> is a native DOM tag (a string), no execution is needed. We immediately create a FiberNode for it, and recursively repeat the process for each of its children: Component1 and Component2.

      4. Component1 is a component, so it's executed to get its returned child LeafElement (perhaps a <button> or some other HTML structure). Then `createFiberTree(...)` is recursively called on that returned LeafElement, and a FiberNode is created and attached to the tree.

      5. The same happens for Component2.

    Throughout this process:
      - Each FiberNode is linked to its parent.
      - Children are collected in the `.children` array of each node.
      - Keys, instanceKeys, depth, path, and metadata are stored.

    The final result is a complete Fiber Tree, rooted at <App>, with nested nodes for every component and native element in the UI. This tree becomes `actualVDOM`, and is used in the next phase (diffing).


**/




// Structure of a FiberNode (a Node inside the Fiber Tree (VDOM))
export type FiberNode = {
    type: LeafElementType | null;       // if its a component, here store the function, else if its a nativ DOM element, store the element as a string ("div")

    content?: string | number;          // only used for string/number child element. Contain the string to print
    props: Record<string, any>;         // props (without key)

    children: FiberNode[];              // children Node(s)
    parent: FiberNode | null;           // parent Node

    alternate: FiberNode | null;        // reference the same node, but is the last VDOM (used in diffing phase)

    dom: Node | null;                   // Real DOM element (always null if element is a component or fragment)

    hookInstance?: HooksInstance;       // reference to the hookInstance (used if element is a component)

    instanceKey: string;                // allow to identify the node with a unique string

    modifTag?: ModifTag;                // tag used in diffing phase to know if node is new or if its already exist
};


export enum ModifTag {
    NONE,      // no change, reuse the previousDOM
    PLACEMENT, // new node (doesnt exist in last VDOM)
    UPDATE,    // node already exist but props or children changed
    DELETION   // node exist in previousVDOM but not exist anymore in new VDOM
}







// This function create the VDOM (Fiber Tree)
export function createFiberTree( element: LeafElement | LeafChild, parentFiber: FiberNode | null, parentInstanceKey: string, indexPath: number ):  FiberNode 
{
  // this fiber will be returned in all cases
  const fiber: FiberNode = {
      type: null,
      props: {},
      children: [], parent: parentFiber,
      alternate: null,
      dom: null,
      instanceKey: parentInstanceKey + indexPath
  };

  
  // if element is undifinied, null or boolean
  if (element === null || element === false || element === true || element === undefined) { fiber.type = "nothing"; return fiber; }

  // else if element is a string or a number
  else if (typeof element === "string"  || typeof element === "number") { fiber.type = "stringChild"; fiber.content = element; fiber.instanceKey = getInstanceKeyIfNotLeafElement(parentInstanceKey, indexPath); return fiber; }

  // else if element is a real LeafElement (a component, a real dom element or a fragment)
  else if (typeof element === "object" && element != null && "type" in element && element.type !== undefined) {

    fiber.type = (element as LeafElement).type;
    fiber.props = (element as LeafElement).props;
    fiber.instanceKey = getInstanceKeyIfLeafElement(parentInstanceKey, indexPath, element);

    // if element.type is a component
    if (typeof element.type === "function") {
      
      const component = element.type as LeafComponent;
      
      // retrieve hookInstance
      let instanceHook = runtimeState.hooksInstances.get(fiber.instanceKey);
      if (!instanceHook) {
          instanceHook = { hooks: [], hookIndex: 0 };
          runtimeState.hooksInstances.set(fiber.instanceKey, instanceHook);
      }
      fiber.hookInstance = instanceHook;
      
      // execute component, which will return a LeafChild
      runtimeState.currentHooksInstance = instanceHook;  instanceHook.hookIndex = 0;
      const propsWithChildren = { ...element.props, children: element.children }; // allow to use children inside component exec
      const renderedElement = component(propsWithChildren);    
      runtimeState.currentHooksInstance = null;
      
      // Recursively createFiberTree child
      fiber.children[0] = createFiberTree(renderedElement, fiber, fiber.instanceKey, 0);
      
      return fiber;
    }

    // if element.type is a fragment
    else if (element.type === _fragment) {
      // Reconcile children
      for (let i = 0; i < element.children.length; i++) {
        const childElement = element.children[i];
        const childFiber = createFiberTree(childElement as LeafChild, fiber, fiber.instanceKey, i);
        fiber.children.push(childFiber);
      }
      return fiber;
    }

    // if element.tyoe is a dom element ( a string like "div")
    else {
      // Reconcile children
      for (let i = 0; i < element.children.length; i++) {
        const childElement = element.children[i];
        const childFiber = createFiberTree(childElement as LeafElement, fiber, fiber.instanceKey, i);
        fiber.children.push(childFiber);
      }
      return fiber;
    }

  }

  // Error
  else { throw new Error("Problem inside reconciler : wrong element"); }

}












// These functions determine the correct instanceKey for a given element.
// If a `key` prop is provided, the instanceKey is set to that key. Otherwise, the instanceKey is derived from the element's path within the VDOM tree.

// ⚠️ Important: The only reliable way to guarantee a unique instanceKey is to explicitly provide a `key` prop. Without it, two different component instances may accidentally share the same instanceKey.
// For example:
//   bool1 ? <Header prop="1" /> : <Header prop="2" />
//   When `bool1` toggles, the new <Header /> component reuses the same position (path) in the VDOM, and therefore gets the same instanceKey, even though it's logically a different component instance.

function getInstanceKeyIfLeafElement( parentInstanceKey: string, index: number, element: LeafElement): string {
    const base = parentInstanceKey ? `${parentInstanceKey}-` : "";
    const key = element.key;
    const type = typeof element.type === "function" ? element.type.name || "anonymous" : String(element.type);

    if (key) { return `${base}key:${key}`; } 
    else { return `${base}${index}-${type}`; }
}

function getInstanceKeyIfNotLeafElement( parentInstanceKey: string, index: number): string {
    const base = parentInstanceKey ? `${parentInstanceKey}-` : ""; const type = "stringChild";
    return `${base}${index}-${type}`;
}
  
  