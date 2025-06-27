/**

  🧱 Elements System

  This file defines how elements are represented internally in leaf-js before being turned into real DOM nodes. These structures are created when you use TSX syntax like: <MyComponent foo="bar" />

  ➤ LeafElement is the temporary, high-level structure returned by JSX/TSX, before the virtual DOM (Fiber Tree) is constructed.
  ➤ LeafElements are created via the createElement() function, which is automatically injected by the TypeScript compiler when you use JSX syntax (see tsconfig.json).

 **/



export type LeafChild = LeafElement | string | number | boolean | null | undefined;    // The types that a LeafElement can contain as children (other elements, strings, null, etc).

export type LeafElementType = string | LeafComponent | symbol;                         // Either a native tag name (e.g., "div"), a component function, or a fragment symbol.

export type LeafElement = {                                                            // The core object representing an element to be rendered.
  type: LeafElementType;         // "div", MyComponent, or _fragment
  props: Record<string, any>;    // attributes or props passed
  children: LeafChild[];         // an array of LeafChild (recursively)
  key: string | undefined;       // used for identifying elements in lists
};

export type LeafComponent = (props: any) => LeafElement;      // A function that takes props and returns a LeafElement. Typical component.






// This is the function automatically used by TSX to create LeafElements. 
// For example: <Component1 foo="bar"> becomes createElement(Component1, { foo: "bar" }), which return a LeafElement { type: Component1, props: {foo: "bar"}, children: [] }
export function createElement( type: LeafElementType, props: Record<string, any> = {}, ...children: LeafChild[] ): LeafElement 
{
  const { key, ...rest } = props ?? {};
  return {
      type,
      props: rest || {},
      children: children.flat(),
      key: key !== undefined ? String(key) : undefined
  };
}




export const _jsx = createElement;                    // Alias to support JSX transforms
export const _fragment = Symbol("fragment");          // A special symbol used to represent fragments: <>...</>