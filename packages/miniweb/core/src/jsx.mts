export {};


declare global {

  namespace JSX {

    // typage elements de base
    interface IntrinsicElements {
      div: HTMLAttributes;
      span: HTMLAttributes;
      button: HTMLAttributes & { onClick?: (e: MouseEvent) => void };
      input: HTMLAttributes & { type?: string; value?: string; onInput?: (e: InputEvent) => void };
      [key: string]: any;
    }


    // props generiques dans toutes les balises
    interface HTMLAttributes {
      id?: string;
      class?: string;
      style?: string | Partial<CSSStyleDeclaration>;
      [attr: string]: any;
    }
    
  }
  
}