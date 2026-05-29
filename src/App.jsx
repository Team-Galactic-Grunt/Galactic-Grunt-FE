import { BrowserRouter } from 'react-router-dom';
import { Router } from './shared/Router';
import { useEffect } from 'react';
import axios from 'axios';
import { BgmProvider } from './context/BgmContext';

import { getAllPokemon } from "./api/getAllPokemon";

async function getFunction() {
  // getAllPokemon().then((res) => {
  //   console.log(res);
  // });
  try {
    const response = await axios.get(
      // 'https://galactic-gruent-be.vercel.app/api/getInitData',
      'http://localhost:3000/api/getInitData',
    );
    console.log('Fetched Pokémon:', response.data.result);
    const { position, bag, isMyPokemon, pokemonBox, pokedex } =
      response.data.result;
    console.log('Position:', position);
    console.log('Bag:', bag);
    console.log('Is My Pokémon:', isMyPokemon);
    console.log('Pokémon Box:', pokemonBox);
    console.log('Pokédex:', pokedex);
    if (!position || !bag || !isMyPokemon || !pokemonBox || !pokedex) {
      console.error(
        'One or more required fields are missing in the response data.',
      );
      return;
    }
    sessionStorage.setItem('position', JSON.stringify(position));
    sessionStorage.setItem('bag', JSON.stringify(bag));
    sessionStorage.setItem('isMyPokemon', JSON.stringify(isMyPokemon));
    sessionStorage.setItem('pokemonBox', JSON.stringify(pokemonBox));
    sessionStorage.setItem('pokedex', JSON.stringify(pokedex));
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
  }
}
function App() {
  useEffect(() => {
    getFunction();
  }, []);
  return (
    <BrowserRouter>
      <BgmProvider>
        <Router />
      </BgmProvider>
    </BrowserRouter>
  );
}

export default App;
