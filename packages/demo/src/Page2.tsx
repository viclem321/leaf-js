import * as F from "leaf-js";
import { Header, Clock, List, ListItem, MyButton } from "./components.js";




/**
    A simple second page to test routing in the framework.
*/

export function Page2() {

  return (
    <div class="second-page">
      <h2>Welcome to the Second Page</h2>
      <MyButton url="/home" />
    </div>
  );
}