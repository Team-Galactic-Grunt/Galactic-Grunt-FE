export function syncCurrentPokemon() {
  const cp = JSON.parse(sessionStorage.getItem('currentPokemon') || 'null');
  if (!cp) return;
  const list = JSON.parse(sessionStorage.getItem('isMyPokemon') || '[]');
  sessionStorage.setItem(
    'isMyPokemon',
    JSON.stringify(list.map((p) => (p.catchId === cp.catchId ? cp : p))),
  );
}
