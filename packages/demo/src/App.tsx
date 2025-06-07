import * as F from "@miniweb/core";








export function Header() {
  F.useEffect(() => {
    console.log("Header monté");
    return () => {
      console.log("Header démonté");
    };
  }, []); // pas de dépendances = effet monté une seule fois

  return (
    <header style={{ backgroundColor: "#80e0e0", padding: "10px", textAlign: "center", marginBottom: "2rem" }}>
      <h1>Bienvenue sur MiniWeb</h1>
    </header>
  );
}



// Un composant Clock qui met à jour l'heure chaque seconde
export function Clock() {
  const [time, setTime] = F.useState(new Date().toLocaleTimeString());

  F.useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <div style={{ fontSize: "1.2rem", margin: "10px 0" }}>Heure courante : {time}</div>;
}





// Une liste qui affiche plusieurs éléments et ajoute un nouvel item après 2 secondes grâce à useEffect
export function List() {
  const [items, setItems] = F.useState<string[]>(["Item 1", "Item 2", "Item 3"]);

  F.useEffect(() => {
    // Ajoute un nouvel item après 2000ms
    const timeout = setTimeout(() => {
      setItems([...items, "Item 4"]);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []); // monte une seule fois

  return (
    <ul style={{ listStyleType: "circle", padding: "0 20px" }}>
      {items.map((item, index) => (
        // Pense à fournir une key stable (ici l'index pour simplifier)
        <ListItem key={index.toString()} item={item} />
      ))}
    </ul>
  );
}


// Un composant ListItem qui gère son état interne (sélection)
export function ListItem(props: { item: string }) {
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
      {props.item} {selected ? "(sélectionné)" : ""}
    </li>
  );
}





// Un composant Button simple qui affiche dans la console lorsqu'il est clique
export function MyButton() {
  return (
    <div>
      <button  onClick={() => {  console.log("Bouton cliqué !"); }}   style={{ margin: "0.5rem", padding: "8px 16px", fontSize: "1rem", cursor: "pointer" }} >   Cliquez-moi  </button>
    </div>
  );
}




// Le composant App, qui utilise des fragments pour grouper plusieurs éléments
export function App() {

  const [showHeader, setShowHeader] = F.useState(true);
  const [showList, setShowList] = F.useState(true);
  const [showClock, setShowClock] = F.useState(true);
  
  F.useEffect(() => {
    console.log("ShowHeader, showList ou showClock a été modifié");
    return () => {
      console.log("nettoyage avant reutilisation de ce useEffect");
    };
  }, [showHeader, showList, showClock]);

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
          Cette page est une démonstration des fonctionnalités de MiniWeb. Elle utilise les fonctionnalités les plus connus des framework React-Like (système de composants, gestion des hooks, useState, useEffect, gestion propre de la supression/creation de composant pendant le rendu).
        </p>
      </div>

    </>
  );
}














