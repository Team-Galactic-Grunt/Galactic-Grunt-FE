import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { Router } from './shared/Router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BgmProvider } from './context/BgmContext';

async function getFunction() {
  // getAllPokemon().then((res) => {
  //   console.log(res);
  // });
  try {
    const response = await axios.get(
      'https://galactic-gruent-be.vercel.app/api/getInitData',
      // 'http://localhost:3000/api/getInitData',
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
  const [ready, setReady] = useState(false);
  const [random, setRandom] = useState(null);
  // const navigate = useNavigate();
  // const location = useLocation();

  useEffect(() => {
    const randomValue = Math.floor(Math.random() * 3) + 1;
    console.log('Random value for intro image:', randomValue);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRandom(randomValue);
    getFunction().finally(() => setReady(true));
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();

        // Insert your custom action here
        console.log('Spacebar was pressed!');
        // navigate('/map');
        if (window.location.pathname === '/') {
          window.location.href = '/map'; // 페이지 새로고침과 함께 이동
        }
      }
    });
  }, []);

  if (!ready) return null;

  return (
    <BrowserRouter>
      <BgmProvider>
        {window.location.pathname !== '/admin' && (
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'fixed',
              top: 0,
              left: 0,
              backgroundImage: `url(/src/assets/images/intro_${random}.png)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
        )}
        <Router />
      </BgmProvider>
    </BrowserRouter>
  );
}

export default App;
