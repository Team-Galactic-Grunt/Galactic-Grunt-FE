import { syncCurrentPokemon } from './syncCurrentPokemon';

export function navigateToMap(navigate) {
  syncCurrentPokemon();
  navigate('/map');
}
