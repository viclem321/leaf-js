import { HooksInstance, Effect} from "./hooks.mjs";
import { MiniComponent, MiniChild, MiniElementType, MiniElement, _fragment } from "./elements.mjs";
import { runtimeState } from "./runtime.mjs";



export type FiberNode = {
  type: MiniElementType | null;

  content?: string | number;   // only for string/number element. Contain the string
  props: Record<string, any>;

  children: FiberNode[];
  parent: FiberNode | null;

  // alternate = previous fiber (pour le diffing). Pour le moment non utilise
  alternate: FiberNode | null;

  // DOM node si c'est un element reel
  dom: Node | null;

  // Pour les composants, reference vers le hookInstance associe a ce composant
  hookInstance?: HooksInstance;

  // Effets (utiles si on les detache du scheduler plus tard)
  effects?: Effect[];

  // Pour debug ou controle
  instanceKey: string;

  // node has changed ?
  modifTag?: ModifTag;
};


export enum ModifTag {
  NONE,      // no change, reuse the previousDOM
  PLACEMENT, // new node (doesnt exist in last VDOM)
  UPDATE,    // node already exist but props or children changed
  DELETION   // node exist in previousVDOM but not exist anymore in new VDOM
}


export function getInstanceKeyMiniElement( parentInstanceKey: string, index: number, element: MiniElement): string {
  const base = parentInstanceKey ? `${parentInstanceKey}-` : "";
  const key = element.key;
  const type = typeof element.type === "function" ? element.type.name || "anonymous" : String(element.type);

  if (key) { return `${base}key:${key}`; } 
  else { return `${base}${index}-${type}`; }
}
// for strings (number or string)
export function getInstanceKeyOther( parentInstanceKey: string, index: number): string {
  const base = parentInstanceKey ? `${parentInstanceKey}-` : ""; const type = "stringChild";
  return `${base}${index}-${type}`;
}







// this function execute components, create a VDOM and compare it with the last VDOM, and actualise the real DOM
export function reconcile( element: MiniElement | MiniChild, parentFiber: FiberNode | null, parentInstanceKey: string, indexPath: number ):  FiberNode 
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
  else if (typeof element === "string"  || typeof element === "number") { fiber.type = "stringChild"; fiber.content = element; fiber.instanceKey = getInstanceKeyOther(parentInstanceKey, indexPath); return fiber; }

  // else if element is a real MiniElement (a component, a real dom element or a fragment)
  else if (typeof element === "object" && element != null && "type" in element && element.type !== undefined) {

    fiber.type = (element as MiniElement).type;
    fiber.props = (element as MiniElement).props;
    fiber.instanceKey = getInstanceKeyMiniElement(parentInstanceKey, indexPath, element);

    // if element.type is a component
    if (typeof element.type === "function") {
      
      const component = element.type as MiniComponent;
      
      // recupere le hookInstance
      let instanceHook = runtimeState.hooksInstances.get(fiber.instanceKey);
      if (!instanceHook) {
          instanceHook = { hooks: [], hookIndex: 0 };
          runtimeState.hooksInstances.set(fiber.instanceKey, instanceHook);
      }
      fiber.hookInstance = instanceHook;
      
      // execution du composant, qui va renvoyer un MiniChild
      runtimeState.currentHooksInstance = instanceHook;  instanceHook.hookIndex = 0;
      const renderedElement = component(element.props);    
      runtimeState.currentHooksInstance = null;
      
      // Recursively reconcile child
      fiber.children[0] = reconcile(renderedElement, fiber, fiber.instanceKey, 0);
      
      return fiber;
    }

    // if element.type is a fragment
    else if (element.type === _fragment) {
      // Reconcile children
      for (let i = 0; i < element.children.length; i++) {
        const childElement = element.children[i];
        const childFiber = reconcile(childElement as MiniChild, fiber, fiber.instanceKey, i);
        fiber.children.push(childFiber);
      }
      return fiber;
    }

    // if element.tyoe is a dom element ( a string like "div")
    else {
      // Reconcile children
      for (let i = 0; i < element.children.length; i++) {
        const childElement = element.children[i];
        const childFiber = reconcile(childElement as MiniElement, fiber, fiber.instanceKey, i);
        fiber.children.push(childFiber);
      }
      return fiber;
    }

  }

  // Error
  else { throw new Error("Problem inside reconciler : wrong element"); }

}






// This function aim to compare the previous VDOM and the actual VDOM. Parse each FiberNode of the actual VDOM : if its a new node, put modifTag = PLACEMENT, if node already exist (instanceKey exist) but props changed, put modifTag = UPDATE, if node aalreadu exist and nothing changed, put modifTag = NONE.  Moreover, this function identifies all nodes in previous VDOM that are not used anymore (so that they and there hookInstance are removed at the end of the render)
export function diffVDOM(actualVDOM: FiberNode, previousVDOM: FiberNode | null) {
  diffNodes(actualVDOM, previousVDOM, ModifTag.NONE)
}


// diff a Node with a previous Node, called recursively. At the end, all the VDOM is actualise with the right modifTags. call this function with parentModifTag = NONE
function diffNodes(actualNode: FiberNode, previousNode: FiberNode | null, parentModifTag: ModifTag) {
  // If parent is a new Node, all children are new nodes too.
  if(parentModifTag == ModifTag.PLACEMENT) {
    actualNode.modifTag = ModifTag.PLACEMENT;
    for (const child of actualNode.children) {
      diffNodes(child, null, actualNode.modifTag);
    }
  }
  // else if parent is not a new node (already exist in last VDOM)
  else if(parentModifTag == ModifTag.NONE || parentModifTag == ModifTag.UPDATE) {
    // if there isnt a node with same instanceKey
    if(!previousNode) {
      actualNode.modifTag = ModifTag.PLACEMENT;
      for (const child of actualNode.children) {
        diffNodes(child, null, actualNode.modifTag);
      }
    }
    // else if there is a node with the same instanceKey
    else {
      actualNode.alternate = previousNode;
      // if props and content are equal (node is the same)
      if( previousNode.type === actualNode.type && propsAreEqual(previousNode, actualNode) && previousNode.content == actualNode.content ) {
        actualNode.modifTag = ModifTag.NONE;
      }
      // if props arent equal (node changed)
      else {
        actualNode.modifTag = ModifTag.UPDATE;
      }
      // diffNodes children
      const previousChildrenMap = new Map<string, FiberNode>();
      for (const prevChild of previousNode.children) {
        previousChildrenMap.set(prevChild.instanceKey, prevChild);
      }
      const allInstanceKeyUsed = new Set<string>();
        //if node with same instanceKey is find in previous children, diffNodes them, else, diffNodes actualNode alone
      for (const child of actualNode.children) {
        allInstanceKeyUsed.add(child.instanceKey);
        const prevChild = previousChildrenMap.get(child.instanceKey);
        if (prevChild) {
          diffNodes(child, prevChild, actualNode.modifTag);
        } else {
          diffNodes(child, null, actualNode.modifTag);
        }
      }
        // parse previous children and verify if there are nodes that not exist anymore
      for (const previousChild of previousNode.children) {
        // if one node is found, add it in previousVDOMDeletion (only it, not children. children's node are manage recursively in commitDeletion)
        if(!allInstanceKeyUsed.has(previousChild.instanceKey)) {
          runtimeState.previousVDOMDeletionsNodes.push(previousChild);
        }
      }
    }
  }
  // if parent modifTag is not Placement, None or Update, there is probably a error
  else {
    throw new Error("Problem inside diffNodes : wrong parentModifTag");
  }
}







// verify if props between 2 Nodes are equals
function propsAreEqual(prevProps: Record<string, any>, nextProps: Record<string, any>): boolean {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) return false;

  for (const key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) return false;
  }

  return true;
}


