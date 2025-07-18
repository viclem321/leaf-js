import {LeafElement, LeafChild, LeafComponent, _jsx} from "../core/elements.mjs";
import { useState, useEffect } from "../core/hooks.mjs";



/**       <Router> component
 
    This is a basic hash-based routing component for Leaf. It renders the first matching <Route> based on the current URL hash.

    Usage:


    <Router>
        <Route path="/" component={HomePage} />
        <Route path="/about" component={AboutPage} />
    </Router>

    Make sure to use `/#/route-name` in your links, or use <Link> instead of native <a> tags. This avoids page reloads and allows smooth SPA navigation.

*/





export function Route(_props: {path: string, component: LeafComponent}) {    // This component is never print
    return _jsx("div", {});
}


  
export function Router( props: { children?: LeafChild[] } ) {

    const [currentPath, setCurrentPath] = useState( window.location.hash.slice(1) || "/" );

    useEffect(() => {
        const onHashChange = () => {
            const newPath = window.location.hash.slice(1) || "/";
            setCurrentPath(newPath);
        };
        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    let matched: LeafElement | null = null;

    for (const child of props.children ?? []) {
    if (!child || typeof child !== "object") continue;
    if (child.type === Route && child.props.path === currentPath) {
        matched = _jsx(child.props.component, {});
        break;
    }
    }

    return matched ?? _jsx("div", {}, "404 - Not Found By The Router");
}