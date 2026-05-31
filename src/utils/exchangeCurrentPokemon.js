import { syncCurrentPokemon } from './syncCurrentPokemon';

export function exchangeCurrentPokemon(index) {
  syncCurrentPokemon();
  const list = JSON.parse(sessionStorage.getItem('isMyPokemon') || '[]');
  const selected = list[index];
  if (!selected) return;
  sessionStorage.setItem('currentPokemon', JSON.stringify(selected));
  window.dispatchEvent(new CustomEvent('currentPokemonUpdated'));
}
