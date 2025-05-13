const Home = () => {
	return MiniReact.createElement("div", {}, [
	  MiniReact.createElement("h1", {}, "Accueil"),
	  MiniReact.createElement("a", { href: "/about", "data-link": true }, "Aller à About"),
	]);
};
