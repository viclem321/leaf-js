



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




// take a component and create a element
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



export const _jsx = createElement;
export const _fragment = Symbol("fragment");