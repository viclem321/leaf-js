import { cleanupHooksInstance} from "./hooks.mjs";
import { _fragment } from "./elements.mjs";
import { FiberNode, ModifTag } from "./vdom.mjs";
import { runtimeState } from "./runtime.mjs";




export function commitDOM(rootFiber: FiberNode, container: HTMLElement) {
  // Manage all Fiber Nodes to delete
  commitDeletions(runtimeState.previousVDOMDeletionsNodes);
  // Actualize fiber DOM
  actualizeDOM(rootFiber);
  // Insert Fiber DOM in the real DOM
  insertInDOM(rootFiber, container);
}



// manage all FiberNodes to delete (execute hooks cleanup, delete instanceHook and remove DOM element) !!!!!!!!!!!!! WARNING ne pas oublier aussi de supprimer les hooksInstance des enfants de cette node
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

function cleanHooksRecursively(node: FiberNode) {
  // recursively call this function for each child
  for (const child of node.children) {
    cleanHooksRecursively(child);
  }
  // if hookInstance exist, call all effects cleanup and delete the hookInstance
  if(node.hookInstance) {
    cleanupHooksInstance(node.hookInstance);
    runtimeState.hooksInstances.delete(node.instanceKey);
  }
}




// this function actualize DOM with the actual FiberNode (function called recursively)
function actualizeDOM(fiber: FiberNode) {
  // if modifTag = PLACEMENT (new node), create a DOM element and attach it to parentDOM. if DOM element cant be create (because node.type is a component pe), just put fiber.dom to the parentDOM
  if(fiber.modifTag === ModifTag.PLACEMENT) {
    fiber.dom = createNewDOMElement(fiber);
  }
  // if modifTag = UPDATE (node already exist, but props changed), just update the props of the fiber.alternate.dom (if its a dom element), and reference this same DOM element (fiber.alternate.dom) in fiber.dom
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
  // if modifTag = NONE (node already exist and nothing changed), just reference fiber.alternate.dom to fiber.dom 
  else if(fiber.modifTag === ModifTag.NONE && fiber.alternate) {
    fiber.dom = fiber.alternate.dom;
  }
  else {
    throw new Error("Problem inside actualizeDOM: wrong ModifTag");
  }

  // actualize DOM of children
  for(const child of fiber.children) {
    actualizeDOM(child);
  }
}



function insertInDOM(fiber: FiberNode, parentDOM: Node) {

  if(fiber.modifTag === ModifTag.PLACEMENT) {
    if(fiber.dom) {
      const nextDOMElement = findNextDOMInTree(fiber, parentDOM);
      if(nextDOMElement) { parentDOM.insertBefore(fiber.dom, nextDOMElement); } else { parentDOM.appendChild(fiber.dom); }
    }
  }

  else if(fiber.modifTag === ModifTag.UPDATE && fiber.alternate) { ; }

  else if(fiber.modifTag === ModifTag.NONE && fiber.alternate) { ; }

  else { throw new Error("Problem inside realCommitDOM: wrong ModifTag"); }

  // actualize DOM of children
  for(const child of fiber.children) {
    insertInDOM(child, fiber.dom ?? parentDOM);
  }
}




function findNextDOMInTree(fiber: FiberNode, parentDOM: Node): Node | null {

  let parent = fiber.parent;   if (!parent) return null;
  const siblings = parent.children;
  const index = siblings.indexOf(fiber);

  // cherche le prochain DOM element dans les siblings 
  for (let i = index + 1; i < siblings.length; i++) {
    const foundNextDOM = findFirstDOMInFiber(siblings[i], parentDOM);
    if(foundNextDOM) { return foundNextDOM; }
  }

  // sinon, cherche le prochain DOM element dans le parent
  if(!parent.dom) { return findNextDOMInTree(parent, parentDOM); } 

  return null;

}



// find first DOM element in fiber and children of this fiber (if nothing found, return null)
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







// create a new DOM element if possible. Else, return null
function createNewDOMElement(fiber: FiberNode) : HTMLElement | DocumentFragment | Text | null  {


  // if fiber.type is invalid (bool, null, undifined)
  if(fiber.type === "nothing") {
    return document.createElement("div");  // a remplacer plutot qu'un div, il element innexistant
  }
  // else if fiber.type is a stringChild
  else if(fiber.type === "stringChild") {
    return document.createTextNode(fiber.content?.toString() ?? "string not valid");
  }
  // else if fiber.type is a component, no need to create a DOM element
  else if(typeof fiber.type === "function") {
    return null;
  }
  // else if fiber.type is a fragment
  else if(fiber.type === _fragment) {
    //       WARNING !!!!!!!!!!!!!!        : for the moment, fragments are just considerate as a non existant dom element. so dom = parent node
    // return document.createDocumentFragment();
    return null;
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



function updateDomProps(dom: Node | null | undefined, prevProps: any, nextProps: any) {
  if(dom instanceof HTMLElement) {
    // if props dont exist anymore, remove them from dom
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

function updateTextNodeValue(dom: Node | null | undefined, content: string | number) {
  if(dom instanceof Text) {
    dom.nodeValue = content.toString() ?? "string not valid";
  }
}


function addPropToDOM(dom: HTMLElement, key: string, value: any, lastValue: any) {
  if (key.startsWith("on") && typeof value === "function") {
    // Gestion des evenements connu pour la balise en question (onClick etc)
    const eventName = key.slice(2).toLowerCase();
    const isKnownEvent = `on${eventName}` in dom;
    if (!isKnownEvent) { console.warn(`[Miniweb Warning] Event '${eventName}' is not a known event on <${String(dom.tagName)}>`); }
    if(lastValue) {dom.removeEventListener(eventName, lastValue);}
    dom.addEventListener(eventName, value);
  } else if (key === "className") {
    // Gestion speciale pour className
    dom.setAttribute("class", value);
  } else if (key === "style" && typeof value === "object") {
    // Gestion speciale pour style (formatage d'un objet vers une chaine du genre "backgroundcolor:blue;color:white")
    const styleString = Object.entries(value)
        .map(([prop, val]) => `${prop.replace(/([A-Z])/g, "-$1").toLowerCase()}:${val}`)
        .join(";");
    dom.setAttribute("style", styleString);
  } else if (key in dom) {
    // Pour checked, value, disabled, etc (directement sur l'element), maniere plus propre d'ajouter des props si elles existent deja dans l'element en question
    (dom as any)[key] = value;
  } else {
    // Sinon on setAttribute normal
    dom.setAttribute(key, value);
  }
}

function removePropToDOM(dom: HTMLElement, key: string, value: any) {
  if (key.startsWith("on") && typeof value === "function") {
    // Gestion des evenements connu pour la balise en question (onClick etc)
    const eventName = key.slice(2).toLowerCase();
    const isKnownEvent = `on${eventName}` in dom;
    if (!isKnownEvent) { console.warn(`[Miniweb Warning] Event '${eventName}' is not a known event on <${String(dom.tagName)}>`); }
    dom.removeEventListener(eventName, value);
  } else if (key === "className") {
    // Gestion speciale pour className
    dom.removeAttribute("class");
  } else if (key === "style" && typeof value === "object") {
    dom.removeAttribute("style");
  } else if (key in dom) {
    // if key is a propertie of dom
    try {
      if (typeof (dom as any)[key] === "boolean") { (dom as any)[key] = false; } 
      else { (dom as any)[key] = ""; }
    } catch { throw new Error("Problem inside removePropToDOM: impossible to remove an atribut "); }
  } else {
    // Sinon on removeAttribute normal
    dom.removeAttribute(key);
  }
}


