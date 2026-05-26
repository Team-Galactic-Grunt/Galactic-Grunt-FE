import { BrowserRouter } from 'react-router-dom';
import { Router } from './shared/Router';
import { useEffect } from 'react';

import { getAllPokemon } from './api/getAllPokemon';

function getFunction() {
  getAllPokemon().then((res) => {
    console.log(res);
  });
}
function App() {
  // useEffect(() => {
  //   getFunction();
  // }, []);
  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
}

export default App;
