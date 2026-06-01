import { syncCurrentPokemon } from './syncCurrentPokemon';

export function navigateToMap(navigate) {
  syncCurrentPokemon();
  sessionStorage.removeItem('currentPokemon');
  sessionStorage.removeItem('enemyPokemon');
  // const eventZone = JSON.parse(sessionStorage.getItem('eventZone')) || null;
  // if (eventZone === 'legendary') {
  //   sessionStorage.removeItem('eventZone');
  //   navigate('/secret');
  //   return;
  // }
  navigate('/map');
}
