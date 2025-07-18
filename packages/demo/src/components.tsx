import * as F from "@viclem321/leaf-js";




// A Header that logs a message on mount/unmount using `useEffect`
export function Header() {
    F.useEffect(() => {
      console.log("Header mount");
      return () => {  console.log("Header unmount");  };    // that's the cleanup function. Each time the component is umount (or each time this useEffect is called again), this function is called
    }, []);                                                 // As with React, a empty array means "execute this useEffect only when mounting the component"
  
    return (
      <header style={{ backgroundColor: "#80e0e0", padding: "10px", textAlign: "center", marginBottom: "2rem" }}>
        <h1>Welcome to leaf-js</h1>
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



// A basic button usings style props and trigger 
export function MyButton(props: { url: string }) {
    return (
      <div>
        <button  onClick={() => {  window.location.hash = props.url; }}   style={{ margin: "0.5rem", padding: "8px 16px", fontSize: "1rem", cursor: "pointer" }} >   Go to {props.url}  </button>
      </div>
    );
  }