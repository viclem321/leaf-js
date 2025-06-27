import { HooksInstance, Effect} from "./hooks.mjs";
import { LeafComponent, LeafChild, LeafElementType, LeafElement, _fragment } from "./elements.mjs";
import { FiberNode, ModifTag } from "./buildVDOM.mjs";
import { runtimeState } from "./runtime.mjs";



/**  🔍 COMPARE VIRTUAL DOMS (Diffing)

  This file implements the second phase of rendering: virtual DOM diffing.
  Its purpose is to compare the newly generated Fiber Tree (actualVDOM) with the previous  from the last render (previousVDOM), and detect what has changed.

  This process updates the `modifTag` property of each FiberNode:
    - ModifTag.PLACEMENT: the node is new (needs to be inserted in the DOM)
    - ModifTag.UPDATE: the node already exists but has changed (props, content, etc.)
    - ModifTag.DELETION: the node existed but is now gone (this value is never used, deletions are managed differently)
    - ModifTag.NONE: no change

  The output of this phase is the same actualVDOM tree, but with each node annotated with the right modification tag. This is used in the commit phase to determine exactly what to do with the real DOM.

**/




// Entry point. Recursively diff each node, starting from the root.
export function diffVDOM(actualVDOM: FiberNode, previousVDOM: FiberNode | null) {
  diffNodes(actualVDOM, previousVDOM, ModifTag.NONE)
}




// Compare two nodes of the same position in the tree, and update `modifTag` on `actualNode`
// Also recurses through children, matching them by key and type
function diffNodes(actualNode: FiberNode, previousNode: FiberNode | null, parentModifTag: ModifTag) {
  // If parent is a new Node, children are new nodes too (modifTag = PLACEMENT)
  if(parentModifTag == ModifTag.PLACEMENT) {
    actualNode.modifTag = ModifTag.PLACEMENT;
    for (const child of actualNode.children) {
      diffNodes(child, null, actualNode.modifTag);
    }
  }
  // else if parent is not a new node (already exist in last VDOM)
  else if(parentModifTag == ModifTag.NONE || parentModifTag == ModifTag.UPDATE) {
    // if there isnt a node with same instanceKey, modifTag = PLACEMENT
    if(!previousNode) {
      actualNode.modifTag = ModifTag.PLACEMENT;
      // manage children recursively
      for (const child of actualNode.children) {
        diffNodes(child, null, actualNode.modifTag);
      }
    }
    // else if there is a node with the same instanceKey
    else {
      actualNode.alternate = previousNode;
      // if props and content are equal (node is exactly the same), modifTag = NONE
      if( previousNode.type === actualNode.type && propsAreEqual(previousNode, actualNode) && previousNode.content == actualNode.content ) {
        actualNode.modifTag = ModifTag.NONE;
      }
      // else, modifTag = UPDATE
      else {
        actualNode.modifTag = ModifTag.UPDATE;
      }
      // We build a map of the previous node's children, using their instanceKey. Then, for each child in actualNode, we try to find a matching child from the previous list: If a match is found, we call (recursively) diffnodes(child, previousChild). If no match is found, we call diffNodes(child, null), which will lead to a PLACEMENT tag for this one.
      const previousChildrenMap = new Map<string, FiberNode>();
      for (const prevChild of previousNode.children) {
        previousChildrenMap.set(prevChild.instanceKey, prevChild);
      }
      const allInstanceKeyUsed = new Set<string>();
      for (const child of actualNode.children) {
        allInstanceKeyUsed.add(child.instanceKey);
        const prevChild = previousChildrenMap.get(child.instanceKey);
        if (prevChild) {
          diffNodes(child, prevChild, actualNode.modifTag);
        } else {
          diffNodes(child, null, actualNode.modifTag);
        }
      }
      // After the loop, any unmatched children from the previous tree are marked as DELETION for a real deletion in the DOM at the next phase(in fact, they are stored in runtimeState.previousVDOMDeletionsNodes, DELETION tag isnt used).
      for (const previousChild of previousNode.children) {
        if(!allInstanceKeyUsed.has(previousChild.instanceKey)) {
          runtimeState.previousVDOMDeletionsNodes.push(previousChild);
        }
      }
    }
  }
  else {
    throw new Error("Problem inside diffNodes : wrong parentModifTag");     // if parent modifTag is not Placement, None or Update, there is probably a error
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


