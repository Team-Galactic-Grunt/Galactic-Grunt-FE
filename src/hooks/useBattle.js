import { useCallback } from 'react';
import { calcDamage, effectivenessText } from '../utils/battleCalc';

const STRUGGLE = { koName: '발버둥', fixedDamage: 10 };
const STAT_KO = { attack: '공격', defense: '방어', speed: '스피드' };

// 스테이지 -6 ~ +6 → 배율
function stageMultiplier(stage) {
  const s = Math.max(-6, Math.min(6, stage ?? 0));
  return s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
}

// stages 반영된 실효 baseStats 복사본 반환 (calcDamage 전달용)
function withStages(pokemon) {
  const stages = pokemon.stages ?? {};
  return {
    ...pokemon,
    baseStats: {
      ...pokemon.baseStats,
      attack: Math.round(pokemon.baseStats.attack * stageMultiplier(stages.attack)),
      defense: Math.round(pokemon.baseStats.defense * stageMultiplier(stages.defense)),
      speed: Math.round(pokemon.baseStats.speed * stageMultiplier(stages.speed)),
    },
  };
}

function updatePlayerInStorage(catchId, updater) {
  const stored = JSON.parse(sessionStorage.getItem('isMyPokemon') || '[]');
  const updated = stored.map((p) => (p.catchId === catchId ? updater(p) : p));
  sessionStorage.setItem('isMyPokemon', JSON.stringify(updated));

  const current = JSON.parse(sessionStorage.getItem('currentPokemon') || 'null');
  if (current?.catchId === catchId) {
    const updatedCurrent = updated.find((p) => p.catchId === catchId);
    if (updatedCurrent)
      sessionStorage.setItem('currentPokemon', JSON.stringify(updatedCurrent));
  }

  window.dispatchEvent(new CustomEvent('currentPokemonUpdated'));
}

function updateEnemyInStorage(patch) {
  const stored = JSON.parse(sessionStorage.getItem('enemyPokemon') || 'null');
  if (!stored) return;
  sessionStorage.setItem('enemyPokemon', JSON.stringify({ ...stored, ...patch }));
  window.dispatchEvent(new CustomEvent('enemyPokemonUpdated'));
}

function pickEnemyMove(moves) {
  const valid = moves.filter((m) => m.power);
  return valid.length ? valid[Math.floor(Math.random() * valid.length)] : null;
}

// statChanges 적용 후 로그 출력
function applyStatChanges(changes, target, targetPokemon, addLog) {
  const currentStages = targetPokemon.stages ?? {};
  const updatedStages = { ...currentStages };

  for (const { stat, change } of changes) {
    const prev = currentStages[stat] ?? 0;
    const next = Math.max(-6, Math.min(6, prev + change));
    updatedStages[stat] = next;

    if (prev === next) {
      addLog(`${targetPokemon.name}의 ${STAT_KO[stat] ?? stat}은(는) 더 이상 변화하지 않는다!`);
    } else {
      addLog(`${targetPokemon.name}의 ${STAT_KO[stat] ?? stat}이(가) ${change > 0 ? '올랐다!' : '떨어졌다!'}`);
    }
  }

  if (target === 'enemy') {
    updateEnemyInStorage({ stages: updatedStages });
  } else {
    updatePlayerInStorage(targetPokemon.catchId, (p) => ({ ...p, stages: updatedStages }));
  }
}

export function useBattle({ addLog }) {
  const executeTurn = useCallback(
    (moveIdx) => {
      const player = JSON.parse(sessionStorage.getItem('currentPokemon') || 'null');
      const enemy = JSON.parse(sessionStorage.getItem('enemyPokemon') || 'null');
      if (!player || !enemy) return 'continue';

      const allPPZero = player.moves.every((m) => (m.currentpp ?? 0) <= 0);
      const playerMove = allPPZero ? STRUGGLE : player.moves[moveIdx];

      if (!allPPZero) {
        updatePlayerInStorage(player.catchId, (p) => ({
          ...p,
          moves: p.moves.map((m, i) =>
            i === moveIdx ? { ...m, currentpp: Math.max(0, (m.currentpp ?? 0) - 1) } : m,
          ),
        }));
      }

      const enemyMove = pickEnemyMove(enemy.moves);
      if (!enemyMove) return 'continue';

      const effectivePlayerSpeed = player.baseStats.speed * stageMultiplier(player.stages?.speed);
      const effectiveEnemySpeed = enemy.baseStats.speed * stageMultiplier(enemy.stages?.speed);
      const playerFirst =
        (playerMove.priority ?? 0) !== (enemyMove.priority ?? 0)
          ? (playerMove.priority ?? 0) > (enemyMove.priority ?? 0)
          : effectivePlayerSpeed >= effectiveEnemySpeed;

      let result = 'continue';

      const handleExpGain = () => {
        const expGain = enemy.exp ?? 0;
        const newCurrentExp = (player.currentExp ?? 0) + expGain;
        const isLevelUp = newCurrentExp >= (player.needExp ?? Infinity);

        addLog(`${player.name}은 경험치 ${expGain}를 얻었다!`, () => {
          if (isLevelUp) {
            const g = player.statGrowth ?? {};
            const hpGain = g.hp ?? 0;
            const currentHp =
              JSON.parse(sessionStorage.getItem('currentPokemon') || 'null')?.currentHp ?? 0;
            updatePlayerInStorage(player.catchId, (p) => ({
              ...p,
              level: p.level + 1,
              currentExp: Math.max(0, newCurrentExp - p.needExp),
              needExp: Math.floor(p.needExp * 1.2),
              currentHp: currentHp + hpGain,
              maxHp: (p.maxHp ?? p.baseStats.hp) + hpGain,
              baseStats: {
                ...p.baseStats,
                hp: p.baseStats.hp + hpGain,
                attack: p.baseStats.attack + (g.attack ?? 0),
                defense: p.baseStats.defense + (g.defense ?? 0),
                speed: p.baseStats.speed + (g.speed ?? 0),
              },
            }));
          } else {
            updatePlayerInStorage(player.catchId, (p) => ({ ...p, currentExp: newCurrentExp }));
          }
        });

        if (isLevelUp) addLog(`${player.name}은(는) 레벨업 했다!`);
      };

      const doAttack = (attacker, move, isPlayer) => {
        if (result !== 'continue') return;

        const defender = isPlayer ? enemy : player;
        let damage;
        let effectText = '';

        if (move.fixedDamage) {
          damage = move.fixedDamage;
        } else if (move.power) {
          const calc = calcDamage(withStages(attacker), move, withStages(defender));
          damage = calc.damage;
          effectText = effectivenessText(calc.multiplier);
        } else {
          addLog(`${attacker.name}은(는) ${move.koName}을(를) 사용했다!`);
          if (move.statChanges?.length) {
            applyStatChanges(move.statChanges, isPlayer ? 'enemy' : 'player', defender, addLog);
          }
          return;
        }

        const newHp = Math.max(0, (defender.currentHp ?? 0) - damage);

        if (isPlayer) {
          addLog(`${attacker.name}은(는) ${move.koName}을(를) 사용했다!`, () => {
            updateEnemyInStorage({ currentHp: newHp });
          });
          if (effectText) addLog(effectText);
          if (move.statChanges?.length) {
            applyStatChanges(move.statChanges, 'enemy', enemy, addLog);
          }
          if (newHp <= 0) {
            result = 'enemy-faint';
            addLog(`야생 ${enemy.name}이(가) 쓰러졌다!`);
            handleExpGain();
          }
        } else {
          addLog(`${attacker.name}은(는) ${move.koName}을(를) 사용했다!`, () => {
            updatePlayerInStorage(player.catchId, (p) => ({ ...p, currentHp: newHp }));
          });
          if (effectText) addLog(effectText);
          if (move.statChanges?.length) {
            applyStatChanges(move.statChanges, 'player', player, addLog);
          }
          if (newHp <= 0) {
            result = 'player-faint';
            addLog(`${player.name}이(가) 쓰러졌다!`);
          }
        }
      };

      if (playerFirst) {
        doAttack(player, playerMove, true);
        doAttack(enemy, enemyMove, false);
      } else {
        doAttack(enemy, enemyMove, false);
        doAttack(player, playerMove, true);
      }

      return result;
    },
    [addLog],
  );

  const executeEnemyTurn = useCallback(() => {
    const player = JSON.parse(sessionStorage.getItem('currentPokemon') || 'null');
    const enemy = JSON.parse(sessionStorage.getItem('enemyPokemon') || 'null');
    if (!player || !enemy) return 'continue';

    const move = pickEnemyMove(enemy.moves);
    if (!move) return 'continue';

    const { damage, multiplier } = calcDamage(withStages(enemy), move, withStages(player));
    const effectText = effectivenessText(multiplier);
    const newHp = Math.max(0, (player.currentHp ?? 0) - damage);

    addLog(`${enemy.name}은(는) ${move.koName}을(를) 사용했다!`, () => {
      updatePlayerInStorage(player.catchId, (p) => ({ ...p, currentHp: newHp }));
    });
    if (effectText) addLog(effectText);
    if (move.statChanges?.length) {
      applyStatChanges(move.statChanges, 'player', player, addLog);
    }

    if (newHp <= 0) {
      addLog(`${player.name}이(가) 쓰러졌다!`);
      return 'player-faint';
    }
    return 'continue';
  }, [addLog]);

  return { executeTurn, executeEnemyTurn };
}
