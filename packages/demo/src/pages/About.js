const About = () => {
    return MiniReact.createElement("div", {}, [
      MiniReact.createElement("h1", {}, "À propos"),
      MiniReact.createElement("a", { href: "/", "data-link": true }, "Retour Accueil"),
    ]);
};
