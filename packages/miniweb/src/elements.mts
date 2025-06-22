/**

  🧱 Elements System

  This file defines how elements are represented internally in MiniWeb before being turned into real DOM nodes. These structures are created when you use TSX syntax like: <MyComponent foo="bar" />

  ➤ MiniElement is the temporary, high-level structure returned by JSX/TSX, before the virtual DOM (Fiber Tree) is constructed.
  ➤ MiniElements are created via the createElement() function, which is automatically injected by the TypeScript compiler when you use JSX syntax (see tsconfig.json).

 **/



export type MiniChild = MiniElement | string | number | boolean | null | undefined;    // The types that a MiniElement can contain as children (other elements, strings, null, etc).

export type MiniElementType = string | MiniComponent | symbol;                         // Either a native tag name (e.g., "div"), a component function, or a fragment symbol.

export type MiniElement = {                                                            // The core object representing an element to be rendered.
  type: MiniElementType;         // "div", MyComponent, or _fragment
  props: Record<string, any>;    // attributes or props passed
  children: MiniChild[];         // an array of MiniChild (recursively)
  key: string | undefined;       // used for identifying elements in lists
};

export type MiniComponent = (props: any) => MiniElement;      // A function that takes props and returns a MiniElement. Typical component.






// This is the function automatically used by TSX to create MiniElements. 
// For example: <Component1 foo="bar"> becomes createElement(Component1, { foo: "bar" }), which return a MiniElement { type: Component1, props: {foo: "bar"}, children: [] }
export function createElement( type: MiniElementType, props: Record<string, any> = {}, ...children: MiniChild[] ): MiniElement 
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