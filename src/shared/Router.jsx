import { Routes, Route } from 'react-router-dom';
// import HomePage from '../pages/HomePage';
import MapPage from '../pages/MapPage';
import BattlePage from '../pages/BattlePage';
import BagPage from '../pages/BagPage';
import PokemonPage from '../pages/PokemonPage';
import DexPage from '../pages/DexPage';
import AdminPage from '../admin/AdminPage';
import DefaultLayout from '../layout/DefaultLayout';

export function Router() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path='/map' element={<MapPage />} />
        <Route path='/battle' element={<BattlePage />} />
        <Route path='/bag' element={<BagPage />} />
        <Route path='/pokemon' element={<PokemonPage />} />
        <Route path='/pokedex' element={<DexPage />} />
        <Route path='/admin' element={<AdminPage />} />
      </Route>
    </Routes>
  );
}
