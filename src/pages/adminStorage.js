import { DEFAULT_BAG, DEFAULT_DEX } from './adminData';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createDefaultAdminState() {
  return {
    bag: clone(DEFAULT_BAG),
    dex: clone(DEFAULT_DEX),
  };
}

export function loadAdminState() {
  return createDefaultAdminState();
}

export function saveAdminState() {
  return undefined;
}

export function clampCount(value) {
  const next = Number.isFinite(value) ? Math.trunc(value) : 0;
  return Math.max(0, next);
}

export function normalizePokemonRow(raw, index) {
  if (!raw) {
    return {
      id: index + 1,
      name: `Pokemon ${index + 1}`,
      unlocked: false,
    };
  }

  const id = Number(raw.id ?? raw.pokedexId ?? raw.dexNo ?? index + 1);
  const name =
    raw.name ?? raw.englishName ?? raw.koreanName ?? raw.species ?? `Pokemon ${id}`;

  return {
    id: Number.isFinite(id) ? id : index + 1,
    name,
    unlocked: Boolean(raw.unlocked ?? raw.enabled ?? raw.active ?? raw.seen ?? raw.caught),
  };
}

