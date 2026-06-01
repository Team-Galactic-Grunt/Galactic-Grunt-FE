function updatePokedexEntry(id, fields) {
  const pokedex = JSON.parse(sessionStorage.getItem('pokedex') || '[]');
  const updated = pokedex.map((entry) =>
    entry.id === id ? { ...entry, ...fields } : entry,
  );
  sessionStorage.setItem('pokedex', JSON.stringify(updated));
}

export function setPokedexWatch(id) {
  updatePokedexEntry(id, { watch: true });
}

export function setPokedexCatch(id) {
  updatePokedexEntry(id, { catch: true });
}
