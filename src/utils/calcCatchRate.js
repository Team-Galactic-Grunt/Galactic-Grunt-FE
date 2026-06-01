const BALL_BONUS = { 몬스터볼: 10, 슈퍼볼: 20, 하이퍼볼: 255 };

export function calcCatchRate(enemy, ballName) {
  const maxHp = enemy.maxHp ?? enemy.baseStats?.hp ?? 1;
  const currentHp = enemy.currentHp ?? maxHp;
  const hpRatio = 1 - currentHp / maxHp;
  const ballBonus = BALL_BONUS[ballName] ?? 10;
  const baseRate = enemy.catchRate ?? 45;
  console.log(
    'Calculated catch rate:',
    baseRate + ballBonus + Math.floor(hpRatio * baseRate),
  );
  return baseRate + ballBonus + Math.floor(hpRatio * baseRate);
}

export function tryCatch(enemy, ballName) {
  return Math.random() * 255 < calcCatchRate(enemy, ballName);
}
