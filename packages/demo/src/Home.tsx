import * as F from "leaf-js";
import { Header, Clock, List, ListItem, MyButton } from "./components.js";




/**

  This is a simple demo app showcasing:
    - A Header that logs a message on mount/unmount using `useEffect`
    - A clock that updates every second
    - A "Click Me" button that logs a message to the console
    - Three toggle buttons to mount/unmount each part of the UI (Header, Clock, Button) using `useState` and conditional rendering

**/



export function Home() {

    const [showHeader, setShowHeader] = F.useState(true);
    const [showList, setShowList] = F.useState(true);
    const [showClock, setShowClock] = F.useState(true);
    
  
    return (
      <>
  
        {showHeader && <Header />}
        {showClock && <Clock />}
        {showList && <List />}
  
        <button style={{ margin: "0.5rem", padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }} onClick={() => setShowHeader(!showHeader)}> Toggle Header </button>
        <button style={{ margin: "0.5rem", padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }} onClick={() => setShowClock(!showClock)}>  Toggle Timer </button>
        <button style={{ margin: "0.5rem", padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }} onClick={() => setShowList(!showList)}>  Toggle List </button>

        <MyButton url="/page2" />
  
  
      </>
    );
  }