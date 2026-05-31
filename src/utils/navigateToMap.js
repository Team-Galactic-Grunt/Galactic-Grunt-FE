import { syncCurrentPokemon } from './syncCurrentPokemon';

export function navigateToMap(navigate) {
  syncCurrentPokemon();
  sessionStorage.removeItem('currentPokemon');
  sessionStorage.removeItem('enemyPokemon');
  navigate('/map');
}
