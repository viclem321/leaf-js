import {LeafElement, LeafChild, LeafComponent, _jsx} from "../core/elements.mjs";
import { useState, useEffect } from "../core/hooks.mjs";


/**       <Link> component
 
    The <Link> component allows you to manage navigation without reloading the page. It replaces the <a> tag.

    Usage:   <Link> Go to /about </Link>

    Component not yet tested

*/


export function Link(props: { to: string; children?: LeafChild | LeafChild[] }) {
    return _jsx("a", { 
        href: `#${props.to}`, 
        onClick: (e: MouseEvent) => { e.preventDefault(); window.location.hash = props.to; },
        children: props.children,
    });
}