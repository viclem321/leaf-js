// EXPORT ALL AS F ---------------------------------------------------------------------------------------



// ELEMENTS TYPES ------------------------------------
export type MiniComponent = (props: any) => MiniElement;

export type MiniChild = MiniElement | string | number | boolean | null | undefined;

export type MiniElementType = string | MiniComponent | symbol;

export type MiniElement = {
  type: MiniElementType;
  props: Record<string, any>;
  children: MiniChild[];
  key: string | undefined;
};



// HOOKS TYPES ----------------------------------
export type HooksInstance = {
  // hooks manager
  hooks: HookEntry[]; hookIndex: number; 
} | undefined;

type HookEntryEffect = {
  deps: any[];   cleanup?: () => void;
}
type HookEntry = any | HookEntryEffect;

// Effect
type Effect = {
  callback: () => void | (() => void);
  hookEffectEntry: HookEntryEffect;
} | undefined;






// ALL VAR OF THIS SINGLETON. need to be clean between each render
  // the current Root component (App)
let currentComponent: () => MiniElement;
  // all components context (with hooks)
const hooksInstances = new Map<string, HooksInstance>();  let currentInstance: HooksInstance | null = null;
const usedIds = new Set<string>(); // will notice every component used in the actual render (for compare it with the last render)
// all effect awaiting to be executed
let pendingEffects: Effect[] = [];






// thats the engine
export const MiniWeb = {


  // take a component and create a vNode (a element in the vDOm)
  createElement( type: MiniElementType, props: Record<string, any> = {}, ...children: MiniChild[] ): MiniElement 
  {
    const { key, ...rest } = props ?? {};
    return {
      type,
      props: rest || {},
      children: children.flat().filter(c => c !== false && c !== true && c != null && c != undefined),
      key: key !== undefined ? String(key) : undefined
    };
  },


    
  // variable to get and set as hook that allow to manage variables along multiple renders. variables are kept inside a tableau inside the singleton
  useState<T>(initialValue: T): [T, (value: T) => void] {
    if (!currentInstance) { throw new Error("useState must be called inside a component"); }
    const instance = currentInstance;  const i = instance.hookIndex;

    // if this hook exist, keep it, else create it with inital value
    instance.hooks[i] = instance.hooks[i] ?? initialValue;

    // call this function for actualize value of the hook
    const setState = (value: T) => {
      if (!instance) { throw new Error("setState must be called inside a component existant"); }
      instance.hooks[i] = value;
      MiniWeb.render(currentComponent!, document.getElementById("root")!);  // a optimiser plus tard, pour re render uniquement ce composant et ses composants enfant
    };

    // improve hookIndex for manage the next hook later
    currentInstance.hookIndex++;
    // return the hook reference + the setter
    return [currentInstance.hooks[i], setState];
  },

  // manage effects. deps are kept in hook, and deps are compare with oldDep. If it changed, effect is send to queue Effect for being executed after the render. if cleanup already exist, it is executed before
  useEffect(fn: () => void | (() => void), deps: any[]) {

    // get current instance
    if (!currentInstance) { throw new Error("useState must be called inside a component"); }
    const instance = currentInstance;  const i = instance.hookIndex;

    if (!instance.hooks[i]) { instance.hooks[i] = { deps: undefined, cleanup: undefined }; }

    // get previous dependencies with old values
    const prevDeps = instance.hooks[i]?.deps;
    // verify if previous deps value === new deps values
    const hasChanged = !deps || !prevDeps || deps.some((d, i) => d !== prevDeps[i]);
  
    if (hasChanged) {
      // if changed, add Effect to pendingEffects
      pendingEffects.push({ callback: fn, hookEffectEntry: instance.hooks[i] });
      // declencher un render???
    }
    
    // actualize prevDeps and prepare next hook
    instance.hooks[i].deps = deps;
    instance.hookIndex++;
  },




  // call all cleanup of a instance (before remove the instance)
  cleanupHooksInstance(instance: HooksInstance) {
    if (!instance) return;
    for (const hook of instance.hooks) {
      if (hook && typeof hook === "object" && "cleanup" in hook && typeof hook.cleanup === "function") {
        try {
          hook.cleanup();
        } catch (e) {
          console.warn("Error during cleanup:", e);
        }
      }
    }
  },




  
  // render the root component 
  render(component: () => MiniElement, container: HTMLElement) {
    currentComponent = component;
    usedIds.clear();
    const element = this._renderElement(component(), "0");
    container.innerHTML = "";
    container.appendChild(element);

    // execute all effect inside pending Effect (with queueMicrotask), and clean pendingEffect
    for (const effect of pendingEffects) {
      if(effect) 
        { 
          queueMicrotask( () => {
            if(effect.hookEffectEntry.cleanup) { effect.hookEffectEntry.cleanup(); }
            const retEffect = effect.callback();
            if(typeof retEffect === "function") { effect.hookEffectEntry.cleanup = retEffect; }
          });
        }
    }
    pendingEffects = [];

    // compare usedIds with last render and remove instancesHooks if not anymore used
    for (const id of hooksInstances.keys()) {
      if (!usedIds.has(id)) {
        const instance = hooksInstances.get(id);
        this.cleanupHooksInstance(instance);
        hooksInstances.delete(id);
      }
    }
  },

  // transform the node and all childrens into a real Dom component
  _renderElement(node: MiniElement | MiniChild, idPath: string): HTMLElement | Text | DocumentFragment {

    // if element is undifinied, null or boolean
    if (node === null || node === false || node === true || node === undefined) { return document.createElement("div"); }

    // if the element is just a string or number
    else if (typeof node === "string"  || typeof node === "number") return document.createTextNode(node.toString());

    // if node is a custom element (like App, Button etc)
    else if (typeof node.type === "function") {

      const component = node.type as Function;

      // find existing instance for this component, or create one
      const instanceKey = 'key' in node && node.key  ?  `${node.type.toString()}::${node.key}`  :  idPath;
      let instance = hooksInstances.get(instanceKey);   if (!instance) {   instance = { hooks: [], hookIndex: 0 };  hooksInstances.set(instanceKey, instance);   }

      // actualize currentInstance, and put index to 0 before execute the component
      currentInstance = instance; instance.hookIndex = 0;

      // execution du composant + recuperation de la node enfant
      const childNode = component(node.props);
      // add the id inside useIds for later compare with last render
      usedIds.add(instanceKey);
      // render l'element enfant
      const rendered = this._renderElement(childNode, idPath + "-0");
      currentInstance = null;
      return rendered;
    }

    // if node is a fragment (<>)
    else if (node.type === _fragment) {
      // create the fragment DOM
      const fragment = document.createDocumentFragment();
      // create all child DOM elements with unique path, and ad them to fragment DOM child
      node.children?.forEach((child, index) => {
        const childPath = idPath + "-" + index;
        fragment.appendChild(this._renderElement(child, childPath));
      });
      return fragment;
    }

    // if node is a basic DOM element (like div etc)
    else {
      const el = document.createElement(node.type as string);  // here could add a verification

      // Transfert de toutes les props du virtual DOM vers les props du vrai DOM de l'element
      for (const [key, value] of Object.entries(node.props || {})) {
        if (key.startsWith("on") && typeof value === "function") {
          // Gestion des evenements connu pour la balise en question (onClick etc)
          const eventName = key.slice(2).toLowerCase();
          const isKnownEvent = `on${eventName}` in document.createElement(node.type as string);
          if (!isKnownEvent) { console.warn(`[Miniweb Warning] Event '${eventName}' is not a known event on <${String(node.type)}>`); }
          el.addEventListener(eventName, value);
        } else if (key === "className") {
          // Gestion speciale pour className
          el.setAttribute("class", value);
        } else if (key === "style" && typeof value === "object") {
          // Gestion speciale pour style (formatage d'un objet vers une chaine du genre "backgroundcolor:blue;color:white")
          const styleString = Object.entries(value)
            .map(([prop, val]) => `${prop.replace(/([A-Z])/g, "-$1").toLowerCase()}:${val}`)
            .join(";");
          el.setAttribute("style", styleString);
        } else if (key in el) {
          // Pour checked, value, disabled, etc (directement sur l'element), maniere plus propre d'ajouter des props si elles existent deja dans l'element en question
          (el as any)[key] = value;
        } else {
          // Sinon on setAttribute normal
          el.setAttribute(key, value);
        }
      }
      // creation du DOM element de chaque enfant avec son idPath unique, et ajout comme child de cette element
      node.children?.forEach((child, index) => {
        const childPath = idPath + "-" + index;
        el.appendChild(this._renderElement(child, childPath));
      });

      return el;
    }
  },

};



export const _jsx = MiniWeb.createElement;
export const _fragment = Symbol("fragment");
