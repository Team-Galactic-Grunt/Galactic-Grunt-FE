import { DEFAULT_BAG, DEFAULT_DEX } from "./adminData";

const ADMIN_STORAGE_KEY = "galactic-grunt-admin-state";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// 기본 상태
export function createDefaultAdminState() {
  return {
    bag: clone(DEFAULT_BAG),
    dex: clone(DEFAULT_DEX),
  };
}

// 상태 불러오기
export function loadAdminState() {
  try {
    const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!saved) return createDefaultAdminState();

    const parsed = JSON.parse(saved);
    return {
      bag: parsed.bag ?? clone(DEFAULT_BAG),
      dex: parsed.dex ?? clone(DEFAULT_DEX),
    };
  } catch {
    return createDefaultAdminState();
  }
}

// 상태 저장
export function saveAdminState(state) {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error(error);
  }
}

// 도감 데이터 정리
export function normalizePokemonRow(raw, index) {
  return {
    unlocked: Boolean(
      raw.unlocked ?? raw.enabled ?? raw.active ?? raw.seen ?? raw.caught,
    ),
  };
}
