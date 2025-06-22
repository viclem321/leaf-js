import * as F from "@miniweb/core";


/**
 
  🎨 App.tsx - Root component of the MiniWeb demo
  
  This file defines the main `<App />` component, which is always the first component rendered by the framework.
  It also contains (or imports) all other demo components used to showcase how MiniWeb works in practice.

  Inside this component, you'll see several core features of the framework in action:
    - State and effect hooks (`useState`, `useEffect`)
    - Conditional rendering
    - add props (css style, function, key, or other)
    - Dynamic component mounting and unmounting

  If you're new to MiniWeb, this is a great place to start exploring. Read through the code, and feel free to experiment by editing it.
 
**/




// A Header that logs a message on mount/unmount using `useEffect`
export function Header() {
  F.useEffect(() => {
    console.log("Header mount");
    return () => {  console.log("Header unmount");  };    // that's the cleanup function. Each time the component is umount (or each time this useEffect is called again), this function is called
  }, []);                                 // As with React, a empty array means "execute this useEffect only when mounting the component"

  return (
    <header style={{ backgroundColor: "#80e0e0", padding: "10px", textAlign: "center", marginBottom: "2rem" }}>
      <h1>Welcome to MiniWeb</h1>
    </header>
  );
}




// a Time component that updates every second thanks to useEffect
export function Clock() {
  const [time, setTime] = F.useState(new Date().toLocaleTimeString());

  F.useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);    // that's the cleanup function. Each time the component is umount (or each time this useEffect is called again), this function is called
  }, []);                                    // As with React, a empty array means "execute this useEffect only when mounting the component"

  return <div style={{ fontSize: "1.2rem", margin: "10px 0" }}>Current time : {time}</div>;
}




// A list that displays multiple items and adds a new item after 2 secondes using useEffect
export function List() {
  const [items, setItems] = F.useState(["Item 1", "Item 2", "Item 3"]);

  // add new item after 2000 ms
  F.useEffect(() => {
    const timeout = setTimeout(() => {
      setItems([...items, "Item 4"]);
    }, 2000);
    return () => clearTimeout(timeout);    // that's the cleanup function. Each time the component is umount (or each time this useEffect is called again), this function is called
  }, []);                                  // As with React, a empty array means "execute this useEffect only when mounting the component"

  return (
    <ul style={{ listStyleType: "circle", padding: "0 20px" }}>
      {items.map((item, index) => (
        <ListItem key={index.toString()} item={item} />  // Important : as with React, put a unique key in this case (for a better anderstanding, go to reconciler)
      ))}
    </ul>
  );
}


// One Item inside The List Component. Using styles props, and allow to select/unselect the item by clicking it
export function ListItem(props: { item: string, key: string }) {
  const [selected, setSelected] = F.useState(false);
  return (
    <li
      onClick={() => setSelected(!selected)}
      style={{
        cursor: "pointer",
        color: selected ? "blue" : "black",
        padding: "4px",
        marginBottom: "4px",
      }}
    >
      {props.item} {selected ? "(selected)" : ""}
    </li>
  );
}





// A basic button usings style props, trigger a log in console on click
export function MyButton() {
  return (
    <div>
      <button  onClick={() => {  console.log("Bouton clicked !"); }}   style={{ margin: "0.5rem", padding: "8px 16px", fontSize: "1rem", cursor: "pointer" }} >   Click me !  </button>
    </div>
  );
}







/**
  Root component, called on every render.   This is a simple demo app showcasing:
    - A Header that logs a message on mount/unmount using `useEffect`
    - A clock that updates every second
    - A "Click Me" button that logs a message to the console
    - Three toggle buttons to mount/unmount each part of the UI (Header, Clock, Button) using `useState` and conditional rendering
    - A small paragraph at the bottom
**/
export function App() {

  const [showHeader, setShowHeader] = F.useState(true);
  const [showList, setShowList] = F.useState(true);
  const [showClock, setShowClock] = F.useState(true);
  

  return (
    <>

      {showHeader && <Header />}
      {showClock && <Clock />}
      {showList && <List />}
      <MyButton />

      <button style={{ margin: "0.5rem", padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }} onClick={() => setShowHeader(!showHeader)}> Toggle Header </button>
      <button style={{ margin: "0.5rem", padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }} onClick={() => setShowClock(!showClock)}>  Toggle Timer </button>
      <button style={{ margin: "0.5rem", padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }} onClick={() => setShowList(!showList)}>  Toggle List </button>


      <div style={{ marginTop: "20px", border: "1px solid gray", padding: "10px" }}>
        <p>
          This page is a demonstration of the core features of <strong>MiniWeb</strong>, a lightweight React-like framework. It showcases essential concepts such as component structure, props passing, state management with <code>useState</code>, side effects with <code>useEffect</code>, and clean handling of component mounting and unmounting during render cycles.
        </p>
      </div>

    </>
  );
}














