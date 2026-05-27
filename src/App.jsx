import { BrowserRouter } from "react-router-dom";
import { Router } from "./shared/Router";
import { useEffect } from "react";

import { getAllPokemon } from "./api/getAllPokemon";

function getFunction() {
  getAllPokemon()
    .then((res) => {
      if (!res || !res.result || !res.result[0]) {
        console.log(res);
        return;
      }

      const targetData = res.result[0];
      const { bag, isMyPokemon, pokemonBox, position } = targetData;

      if (bag) sessionStorage.setItem("bag", JSON.stringify(bag));
      if (isMyPokemon)
        sessionStorage.setItem("isMyPokemon", JSON.stringify(isMyPokemon));
      if (pokemonBox)
        sessionStorage.setItem("pokemonBox", JSON.stringify(pokemonBox));
      if (position)
        sessionStorage.setItem("position", JSON.stringify(position));
    })
    .catch((err) => {
      console.error("API 통신 에러:", err);
    });
}
function App() {
  useEffect(() => {
    getFunction();
  }, []);
  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
}

export default App;
