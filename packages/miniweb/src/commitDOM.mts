import { cleanupHooksInstance} from "./hooks.mjs";
import { _fragment } from "./elements.mjs";
import { FiberNode, ModifTag } from "./buildVDOM.mjs";
import { runtimeState } from "./runtime.mjs";



/**   COMMIT DOM PHASE

  This file contains the final stage of the rendering process: updating the real DOM based on the result of the diffing phase. It includes:

    1. 🔥 commitDeletions():
      Traverses the list of nodes (from previousVDOM) marked for removal (runtimeState.previousVDOMDeletionsNodes), and for each:
        - Removes the associated real DOM node from the document
        - Cleans up hooks (e.g. useEffect cleanups)
        - Deletes the associated hook instance (runtimeState.hooksInstances)

    2. 🔧 actualizeDOM():
      Recursively traverses the new virtual DOM (Fiber tree) and:
        - Creates real DOM elements for any fiber marked as PLACEMENT and stores it in fiber.dom
        - Put a reference to the previous fiber.dom in fiber.domDOM for any fiber marked as UPDATE/NONE
        - Updates attributes, props and event listeners for nodes marked as UPDATE
        - If the node doesnt represent a real DOM element (e.g. a component), just put fiber.dom = null
      Note: This does not insert anything into the actual real DOM tree yet, it only prepares it by filling fiber.dom in each node.
    
    2. 🔧 actualizeDOM():
      Recursively traverses the new virtual DOM (Fiber tree) and:
        - For any node marked as PLACEMENT, creates a new real DOM element and stores it in fiber.dom
        - For nodes marked as UPDATE or NONE, simply assigns the existing DOM from the previous fiber (if any) into fiber.dom
        - For fibers that do not correspond to real DOM elements components (e.g. components), fiber.dom is set to `null`
        - Props, attributes, and event listeners are updated (inside the real DOM) only for fibers marked as UPDATE
      Note: This phase doesn't insert anything into the actual DOM tree. It only prepares each fiber by populating the fiber.dom property with a fully configured DOM node (or null).

    3. 🏗️ insertInDOM():
      Performs the real insertion of DOM nodes into the document. It walks the fiber tree and for each node:
      If it's new (PLACEMENT), it tries to insert it at the correct position using insertBefore (instead of always appendChild). This ensures correct order even when elements are dynamically added/removed

**/




// Entry point for the commit phase. Applies deletions, updates DOM references, and inserts DOM into container.
export function commitDOM(rootFiber: FiberNode, container: HTMLElement) {
  // Manage all Fiber Nodes to delete
  commitDeletions(runtimeState.previousVDOMDeletionsNodes);
  // Actualize fiber DOM
  actualizeDOM(rootFiber);
  // Insert Fiber DOM in the real DOM
  insertInDOM(rootFiber, container);
}






// Recursively removes all DOM nodes marked for deletion (from the previous VDOM) and cleans up hooks. That's a recursive processus (that mean children of the nodes to delete are deleted too)
function commitDeletions(deletions: FiberNode[]) {
  for (const fiber of deletions) {
    // execute cleanup and delete hookInstance 
    cleanHooksRecursively(fiber);
    // remove node from DOM
    removeDOMNodeRecursively(fiber);
  }
  // clean previousVDOMDeletionsNodes for the next render
  runtimeState.previousVDOMDeletionsNodes = [];
}

// Cleans up all hooks (and their effects) recursively for the given node and its children.
function cleanHooksRecursively(node: FiberNode) {
  // recursively call this function for children
  for (const child of node.children) {
    cleanHooksRecursively(child);
  }
  // if hookInstance exist, call each effects cleanup and delete the hookInstance
  if(node.hookInstance) {
    cleanupHooksInstance(node.hookInstance);
    runtimeState.hooksInstances.delete(node.instanceKey);
  }
}

// Recursively removes the actual DOM nodes corresponding to a fiber and its subtree.
function removeDOMNodeRecursively(node: FiberNode) {
  if (node.dom instanceof Node) {
    if(node.dom.parentNode) node.dom.parentNode.removeChild(node.dom);
  }
  else {
    for(const child of node.children) {
      removeDOMNodeRecursively(child);
    }
  }
}







// Walks the fiber tree and populates fiber.dom by creating/updating the corresponding DOM nodes.
function actualizeDOM(fiber: FiberNode) {
  // if modifTag = PLACEMENT (new node), create a DOM element and attach it to parentDOM. if DOM element cant be create (because node.type is a component eg), put fiber.dom to null
  if(fiber.modifTag === ModifTag.PLACEMENT) {
    fiber.dom = createNewDOMElement(fiber);
  }
  // if the node is marked as UPDATE, it means the DOM element already exists (in fiber.alternate). Update its props (if it's a real DOM node), and reuse the same element by assigning it to fiber.dom
  else if(fiber.modifTag === ModifTag.UPDATE && fiber.alternate) {
    if(fiber.type === "nothing") { ; }
    else if(fiber.type === "stringChild") { updateTextNodeValue(fiber.alternate.dom, fiber.content ?? ""); }
    else if(typeof fiber.type === "string") {
      updateDomProps(fiber.alternate.dom, fiber.alternate.props, fiber.props);
    }
    else if(fiber.type === _fragment) { ; }
    else if(typeof fiber.type === "function") { ; }
    else { throw new Error("Problem inside actualizeDOM (modifTaf UPDATE): wrong fiber.type "); }
    fiber.dom = fiber.alternate.dom;
  }
  // if modifTag = NONE (node already exist and nothing changed), just reuse the same element by assigning it to fiber.dom
  else if(fiber.modifTag === ModifTag.NONE && fiber.alternate) {
    fiber.dom = fiber.alternate.dom;
  }
  else {
    throw new Error("Problem inside actualizeDOM: wrong ModifTag");
  }

  // recurse into children
  for(const child of fiber.children) {
    actualizeDOM(child);
  }
}

function updateTextNodeValue(dom: Node | null | undefined, content: string | number) {
  if(dom instanceof Text) {
    dom.nodeValue = content.toString() ?? "string not valid";
  }
}









// Recursively inserts fiber.dom into the real DOM, maintaining the correct visual order
function insertInDOM(fiber: FiberNode, parentDOM: Node) {

  if(fiber.modifTag === ModifTag.PLACEMENT) {
    if(fiber.dom) {
      const nextDOMElement = findNextDOMInTree(fiber, parentDOM);   // attempt to find the next DOM node that is already mounted (i.e., the next sibling DOM node)
      if(nextDOMElement) { parentDOM.insertBefore(fiber.dom, nextDOMElement); } else { parentDOM.appendChild(fiber.dom); }   // insert this fiber's DOM before the next one if found, otherwise append at the end
    }
  }

  else if(fiber.modifTag === ModifTag.UPDATE && fiber.alternate) { ; }

  else if(fiber.modifTag === ModifTag.NONE && fiber.alternate) { ; }

  else { throw new Error("Problem inside realCommitDOM: wrong ModifTag"); }

  // recurse into children, using fiber.dom as the new parent if available
  for(const child of fiber.children) {
    insertInDOM(child, fiber.dom ?? parentDOM);
  }
}

// Searches for the next DOM node (already inserted into the real DOM) that should follow fiber
// First, checks siblings to the right of fiber. If none are found, recurses upward through the parent chain
function findNextDOMInTree(fiber: FiberNode, parentDOM: Node): Node | null {

  let parent = fiber.parent;   if (!parent) return null;
  const siblings = parent.children;
  const index = siblings.indexOf(fiber);

  // look forward in the sibling list to find the next mounted DOM node (including their children, recursively)
  for (let i = index + 1; i < siblings.length; i++) {
    const foundNextDOM = findFirstDOMInFiber(siblings[i], parentDOM);
    if(foundNextDOM) { return foundNextDOM; }
  }

  // if no suitable DOM node is found in siblings, move up and repeat
  if(!parent.dom) { return findNextDOMInTree(parent, parentDOM); } 

  return null;

}

// Recursively finds the first real DOM node in a fiber's subtree (if it exists in parentDOM)
function findFirstDOMInFiber(fiber: FiberNode, parentDOM: Node): Node | null {
  if(fiber.dom?.parentNode && fiber.dom?.parentNode === parentDOM) { return fiber.dom; }
  else if (fiber.dom) return null;
  else {

    for (const child of fiber.children || []) {
      const dom = findFirstDOMInFiber(child, parentDOM);
      if (dom) return dom;
    }

    return null;
  }
}










// Creates a new real DOM element (HTMLElement, Text, (or Fragment)) from a fiber, and applies initial props.  If the DOM element can't be creates, return null
function createNewDOMElement(fiber: FiberNode) : HTMLElement | DocumentFragment | Text | null  {


  // if fiber.type is invalid (bool, null, undifined), return a void div
  if(fiber.type === "nothing") {
    return document.createElement("div");                                                 // !!!! to be replaced later. a div element, that's too visible
  }
  // else if fiber.type is a stringChild, return a DOM text node
  else if(fiber.type === "stringChild") {
    return document.createTextNode(fiber.content?.toString() ?? "string not valid");
  }
  // else if fiber.type is a component, no need to create a DOM element (return null)
  else if(typeof fiber.type === "function") {
    return null;
  }
  // else if fiber.type is a fragment, return null          ( !!!! Warning : for the moment, fragments are just considerate as a non existant dom element. This is something that may need to be changed.)
  else if(fiber.type === _fragment) {
    return null;       // return document.createDocumentFragment();
  }
  // else if fiber.type is a real DOM element (div, span etc)
  else if(typeof fiber.type === "string") {
    // create DOM element
    const dom = document.createElement(fiber.type);  if(dom instanceof HTMLUnknownElement) { throw new Error("Problem inside createNewDOMElement: this type is not a valid DOM element."); }
    // transfert all props from fiber node to DOM element
    for (const [key, value] of Object.entries(fiber.props || {})) {
      addPropToDOM(dom, key, value, null);
    }
    return dom;
  }
  // if something else (probably an error)
  else {
    throw new Error("Problem inside createNewDOMElement: wrong fiber type");
  }

}


// Add props inside a real DOM element
function addPropToDOM(dom: HTMLElement, key: string, value: any, lastValue: any) {
  if (key.startsWith("on") && typeof value === "function") {
    // management of events known for the tag in question (onClick etc)
    const eventName = key.slice(2).toLowerCase();
    const isKnownEvent = `on${eventName}` in dom;
    if (!isKnownEvent) { console.warn(`[Miniweb Warning] Event '${eventName}' is not a known event on <${String(dom.tagName)}>`); }
    if(lastValue) {dom.removeEventListener(eventName, lastValue);}
    dom.addEventListener(eventName, value);
  } else if (key === "className") {
    // special handling for className
    dom.setAttribute("class", value);
  } else if (key === "style" && typeof value === "object") {
    // special handling for style ( formatting an object to a string like "backgroundcolor:blue;color:white" )
    const styleString = Object.entries(value)
        .map(([prop, val]) => `${prop.replace(/([A-Z])/g, "-$1").toLowerCase()}:${val}`)
        .join(";");
    dom.setAttribute("style", styleString);
  } else if (key in dom) {
    // for checked, value, disabled, etc. Cleaner way to add props if they already exist in the tag
    (dom as any)[key] = value;
  } else {
    // else, we do an normal setAttribute
    dom.setAttribute(key, value);
  }
}

// Remove props from a real DOM element
function removePropToDOM(dom: HTMLElement, key: string, value: any) {
  if (key.startsWith("on") && typeof value === "function") {
    // management of events known for the tag in question (onClick etc)
    const eventName = key.slice(2).toLowerCase();
    const isKnownEvent = `on${eventName}` in dom;
    if (!isKnownEvent) { console.warn(`[Miniweb Warning] Event '${eventName}' is not a known event on <${String(dom.tagName)}>`); }
    dom.removeEventListener(eventName, value);
  } else if (key === "className") {
    // special handling for className
    dom.removeAttribute("class");
  } else if (key === "style" && typeof value === "object") {
    dom.removeAttribute("style");
  } else if (key in dom) {
    // if key is a propertie of dom
    try {
      if (typeof (dom as any)[key] === "boolean") { (dom as any)[key] = false; } 
      else { (dom as any)[key] = ""; }
    } catch { throw new Error("Problem inside removePropToDOM: impossible to remove an attribut "); }
  } else {
    // else, we do an normal removeAttribute
    dom.removeAttribute(key);
  }
}


// Update props of a real DOM element
function updateDomProps(dom: Node | null | undefined, prevProps: any, nextProps: any) {
  if(dom instanceof HTMLElement) {
    // if props doesn't exist anymore, remove them from dom
    for (const key in prevProps) {
      if (!(key in nextProps)) {
        removePropToDOM(dom, key, prevProps[key]);
      }
    }
    // if there are new props (or updated props), insert the new props in DOM
    for (const key in nextProps) {
      if (prevProps[key] !== nextProps[key]) {
        addPropToDOM(dom, key, nextProps[key], prevProps[key]);
      }
    }
  }
}





