import { getTypeMultiplier } from './typeChart';

export function calcDamage(attacker, move, defender) {
  if (!move?.power) return { damage: 0, multiplier: 1 };

  const atk = attacker.baseStats.attack;
  const def = defender.baseStats.defense;
  const multiplier = getTypeMultiplier(move.type, defender.types);
  const rand = 0.9 + Math.random() * 0.2;

  return {
    damage: Math.max(1, Math.floor((atk * move.power / def) * multiplier * rand)),
    multiplier,
  };
}

export function effectivenessText(multiplier) {
  if (multiplier === 0) return '효과가 없다...';
  if (multiplier >= 2) return '효과가 굉장했다!';
  if (multiplier <= 0.5) return '효과가 별로인 것 같다...';
  return null;
}
