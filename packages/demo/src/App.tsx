import * as F from "@viclem321/leaf-js";
import { Router, Route } from "@viclem321/leaf-js";
import { Home } from "./Home.js";
import { Page2 } from "./Page2.js";


/**
 
  🎨 App.tsx - Root component of the leaf-js demo
  
  This file defines the main `<App />` component, which is always the first component rendered by the framework.
  It also contains (or imports) all other demo components used to showcase how leaf-js works in practice.

  Inside this component, you'll see several core features of the framework in action:
    - State and effect hooks (`useState`, `useEffect`)
    - Conditional rendering
    - add props (css style, function, key, or other)
    - Dynamic component mounting and unmounting
    - using a router

  If you're new to leaf-js, this is a great place to start exploring. Read through the code, and feel free to experiment by editing it.
 
**/










/**
  Root component, called on every render.
  We use The rooter for navigate between pages.
**/

export function App() {
  
  return (
    <>
      <Router>
        <Route path="/" component={Home} />
        <Route path="/home" component={Home} />
        <Route path="/page2" component={Page2} />
      </Router>

      <div style={{ marginTop: "20px", border: "1px solid gray", padding: "10px" }}>
        <p>
          This website is a demonstration of the core features of <strong>leaf-js</strong>, a lightweight React-like framework. It showcases essential concepts such as component structure, props passing, state management with <code>useState</code>, side effects with <code>useEffect</code>, and clean handling of component mounting and unmounting during render cycles. It also using a Rooter allowing to switch pages.
        </p>
      </div>

    </>
  );
}














