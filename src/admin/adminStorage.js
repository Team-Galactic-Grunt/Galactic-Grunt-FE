import { DEFAULT_BAG, DEFAULT_DEX } from './adminData';

export const ADMIN_STORAGE_KEY = 'galactic-grunt-admin-state';

export function createDefaultAdminState() {
  return {
    bag: structuredClone(DEFAULT_BAG),
    dex: structuredClone(DEFAULT_DEX),
  };
}

export function loadAdminState() {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return createDefaultAdminState();

    const parsed = JSON.parse(raw);
    return {
      bag: parsed?.bag ?? structuredClone(DEFAULT_BAG),
      dex: parsed?.dex ?? structuredClone(DEFAULT_DEX),
    };
  } catch {
    return createDefaultAdminState();
  }
}

export function saveAdminState(state) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(state));
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
  const unlocked =
    Boolean(raw.unlocked ?? raw.enabled ?? raw.active ?? raw.seen ?? raw.caught) ||
    false;

  return {
    id: Number.isFinite(id) ? id : index + 1,
    name,
    unlocked,
  };
}

