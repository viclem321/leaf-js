import * as F from "@miniweb/core";


/*
export const App = () => {
  const [count, setCount] = F.MiniWeb.useState(0);

  return (
    <div>
      <h1>MiniWeb 🎉</h1>
      <p>Compteur : {count}</p>
      <button onClick={() => setCount(count + 1)}>Incrémenter</button>
    </div>
  );
};
*/




function Button() {
  const [count, setCount] = F.MiniWeb.useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}

export const App = () => {
  return (
    <>
      <h1>Hello Miniweb</h1>
      <Button />
      <Button />
    </>
  );
}
