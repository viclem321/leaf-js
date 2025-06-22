import { MiniElement } from "./elements.mjs";
export {};     // Ensure this file is treated as a module




/**  JSX.MTS Type Definitions for Miniweb

  This file tells TypeScript how to handle TSX/JSX syntax within the Miniweb framework.
  It's NOT executed at runtime, it only serves to help the TypeScript compiler understand:
    - What kind of elements you're allowed to write in TSX (<div>, <MyComponent>, etc)
    - How props are passed to components
    - What type the JSX syntax is compiled into (MiniElement)
  This is what makes it possible to use Miniweb just like React, but with full type safety.

 **/



  


// namespace JSX has to be declare as global. That's a typescript condition
declare global {

  namespace JSX {


    // Controls how TypeScript infers prop types for custom components. It tells TS to read props types from the 'props' property of your component arguments: Example: function MyComponent(props: { message: string }) { ... }
    interface ElementAttributesProperty {
      props: {};
    }

    // Specifies the return type of JSX elements. In Miniweb, any JSX element (<div>, <Component />, etc.) becomes a MiniElement.
    type Element = MiniElement;




    // Declares all allowed intrinsic HTML tags (div, span, button, etc.). If you use a non listed tag, Typescript will trigger a error/warning at compilation
    interface IntrinsicElements {
      // Text and content
      div: HTMLAttributes;
      span: HTMLAttributes;
      p: HTMLAttributes;
      h1: HTMLAttributes;
      h2: HTMLAttributes;
      h3: HTMLAttributes;
      h4: HTMLAttributes;
      h5: HTMLAttributes;
      h6: HTMLAttributes;
      pre: HTMLAttributes;
      blockquote: HTMLAttributes;

      // Forms
      form: HTMLAttributes;
      input: HTMLAttributes & InputAttributes;
      textarea: HTMLAttributes & { value?: string };
      button: HTMLAttributes & ButtonAttributes;
      label: HTMLAttributes;
      select: HTMLAttributes;
      option: HTMLAttributes;
      fieldset: HTMLAttributes;
      legend: HTMLAttributes;

      // Text format
      strong: HTMLAttributes;
      b: HTMLAttributes;
      em: HTMLAttributes;
      i: HTMLAttributes;
      u: HTMLAttributes;
      s: HTMLAttributes;
      mark: HTMLAttributes;
      small: HTMLAttributes;
      sub: HTMLAttributes;
      sup: HTMLAttributes;
      code: HTMLAttributes;
      kdb: HTMLAttributes;
      var: HTMLAttributes;
      del: HTMLAttributes;
      ins: HTMLAttributes;
      address: HTMLAttributes;
      hr: HTMLAttributes;
      cite: HTMLAttributes;

      // Media
      img: HTMLAttributes & { src?: string; alt?: string };
      video: HTMLAttributes;
      audio: HTMLAttributes;
      source: HTMLAttributes;
      canvas: HTMLAttributes;
      svg: HTMLAttributes;

      // Navigation
      a: HTMLAttributes & { href?: string };
      nav: HTMLAttributes;
      ul: HTMLAttributes;
      ol: HTMLAttributes;
      li: HTMLAttributes;
      dl: HTMLAttributes;
      dt: HTMLAttributes;
      dd: HTMLAttributes;

      // Layout
      header: HTMLAttributes;
      footer: HTMLAttributes;
      main: HTMLAttributes;
      section: HTMLAttributes;
      article: HTMLAttributes;
      aside: HTMLAttributes;

      // Table
      table: HTMLAttributes;
      thead: HTMLAttributes;
      tbody: HTMLAttributes;
      tr: HTMLAttributes;
      th: HTMLAttributes;
      td: HTMLAttributes;
      caption: HTMLAttributes;

      // Misc
      iframe: HTMLAttributes;
      script: HTMLAttributes;
      link: HTMLAttributes;
      style: HTMLAttributes;
      meta: HTMLAttributes;
      title: HTMLAttributes;
      head: HTMLAttributes;
      body: HTMLAttributes;
      abbr: HTMLAttributes;
      time: HTMLAttributes;
      bdo: HTMLAttributes;
      bdi: HTMLAttributes;

      // [tagName: string]: HTMLAttributes;   // Custom or unknown tags fallback
    }







    // Common HTML attributes shared across all elements.
    interface HTMLAttributes {
      key?: string | number;
      id?: string;
      class?: string;
      style?: string | Partial<CSSStyleDeclaration>;
      title?: string;
      hidden?: boolean;

      // common events
      onClick?: (e: MouseEvent) => void;
      onInput?: (e: InputEvent) => void;
      onChange?: (e: Event) => void;
      onSubmit?: (e: SubmitEvent) => void;
      onFocus?: (e: FocusEvent) => void;
      onBlur?: (e: FocusEvent) => void;

      [attr: string]: any;
    }



    // Specific attributes allowed on <button> elements
    interface ButtonAttributes {
      disabled?: boolean;
      type?: "button" | "submit" | "reset";
    }



    // Specific attributes allowed on <input> elements
    interface InputAttributes {
      type?: string;
      value?: string | number;
      placeholder?: string;
      checked?: boolean;
      name?: string;
    }


    
  }
  
}