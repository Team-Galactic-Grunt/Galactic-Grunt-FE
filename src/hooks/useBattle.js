import { useCallback } from 'react';
import { calcDamage, effectivenessText } from '../utils/battleCalc';
import { syncCurrentPokemon } from '../utils/syncCurrentPokemon';

// catchId로 isMyPokemon 업데이트 + currentPokemon 동기화 + 이벤트 dispatch
function updatePlayerInStorage(catchId, updater) {
  const stored = JSON.parse(sessionStorage.getItem('isMyPokemon') || '[]');
  const updated = stored.map((p) => (p.catchId === catchId ? updater(p) : p));
  sessionStorage.setItem('isMyPokemon', JSON.stringify(updated));

  const current = JSON.parse(
    sessionStorage.getItem('currentPokemon') || 'null',
  );
  if (current?.catchId === catchId) {
    const updatedCurrent = updated.find((p) => p.catchId === catchId);
    if (updatedCurrent)
      sessionStorage.setItem('currentPokemon', JSON.stringify(updatedCurrent));
  }

  window.dispatchEvent(new CustomEvent('currentPokemonUpdated'));
}

// 적 HP를 enemyPokemon에 저장 후 이벤트 dispatch
function updateEnemyInStorage(newHp) {
  const stored = JSON.parse(sessionStorage.getItem('enemyPokemon') || 'null');
  if (!stored) return;
  sessionStorage.setItem(
    'enemyPokemon',
    JSON.stringify({ ...stored, currentHp: newHp }),
  );
  window.dispatchEvent(new CustomEvent('enemyPokemonUpdated'));
}

export function useBattle({ addLog }) {
  // returns 'continue' | 'enemy-faint' | 'player-faint'
  const STRUGGLE = { koName: '발버둥', fixedDamage: 10 };

  const executeTurn = useCallback(
    (moveIdx) => {
      const player = JSON.parse(
        sessionStorage.getItem('currentPokemon') || 'null',
      );
      const enemy = JSON.parse(
        sessionStorage.getItem('enemyPokemon') || 'null',
      );
      if (!player || !enemy) return 'continue';

      const allPPZero = player.moves.every((m) => (m.currentpp ?? 0) <= 0);
      const playerMove = allPPZero ? STRUGGLE : player.moves[moveIdx];

      // PP 차감 (발버둥이 아닐 때)
      if (!allPPZero) {
        updatePlayerInStorage(player.catchId, (p) => ({
          ...p,
          moves: p.moves.map((m, i) =>
            i === moveIdx ? { ...m, currentpp: Math.max(0, (m.currentpp ?? 0) - 1) } : m,
          ),
        }));
      }
      // power가 있는 기술만 적 AI가 선택, 없으면 첫 번째로 fallback
      const validEnemyMoves = enemy.moves.filter((m) => m.power);
      const enemyMove = validEnemyMoves.length
        ? validEnemyMoves[Math.floor(Math.random() * validEnemyMoves.length)]
        : enemy.moves[0];

      // priority가 다르면 높은 쪽이 선공, 같으면 speed로 결정
      const playerFirst =
        (playerMove.priority ?? 0) !== (enemyMove.priority ?? 0)
          ? (playerMove.priority ?? 0) > (enemyMove.priority ?? 0)
          : player.baseStats.speed >= enemy.baseStats.speed;

      let result = 'continue';

      // 적 쓰러진 직후 경험치 획득 및 레벨업 처리
      const handleExpGain = () => {
        const expGain = enemy.exp ?? 0;
        const newCurrentExp = (player.currentExp ?? 0) + expGain;
        const isLevelUp = newCurrentExp >= (player.needExp ?? Infinity);

        // 경험치 로그가 화면에 뜨는 순간 EXP 바 업데이트
        addLog(`${player.name}은 경험치 ${expGain}를 얻었다!`, () => {
          if (isLevelUp) {
            const g = player.statGrowth ?? {};
            const hpGain = g.hp ?? 0;
            const currentHp =
              JSON.parse(sessionStorage.getItem('currentPokemon') || 'null')
                ?.currentHp ?? 0;
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
            updatePlayerInStorage(player.catchId, (p) => ({
              ...p,
              currentExp: newCurrentExp,
            }));
          }
          syncCurrentPokemon();
        });

        if (isLevelUp) addLog(`${player.name}은(는) 레벨업 했다!`);
      };

      const doAttack = (attacker, move, isPlayer) => {
        if (result !== 'continue') return;

        const defender = isPlayer ? enemy : player;
        let damage = 0;
        let effectText = '';

        if (move.fixedDamage) {
          damage = move.fixedDamage;
        } else if (move.power) {
          const calc = calcDamage(attacker, move, defender);
          damage = calc.damage;
          effectText = effectivenessText(calc.multiplier);
        } else {
          // 상태이상 등 데미지 없는 기술
          addLog(`${attacker.name}은(는) ${move.koName}을(를) 사용했다!`);
          return;
        }

        if (isPlayer) {
          const ep = JSON.parse(sessionStorage.getItem('enemyPokemon') || 'null');
          const newHp = Math.max(0, (ep?.currentHp ?? 0) - damage);
          addLog(`${attacker.name}은(는) ${move.koName}을(를) 사용했다!`, () => {
            updateEnemyInStorage(newHp);
          });
          if (effectText) addLog(effectText);
          if (newHp <= 0) {
            result = 'enemy-faint';
            addLog(`야생 ${enemy.name}이(가) 쓰러졌다!`);
            handleExpGain();
          }
        } else {
          const cp = JSON.parse(sessionStorage.getItem('currentPokemon') || 'null');
          const newHp = Math.max(0, (cp?.currentHp ?? 0) - damage);
          addLog(`${attacker.name}은(는) ${move.koName}을(를) 사용했다!`, () => {
            updatePlayerInStorage(player.catchId, (p) => ({ ...p, currentHp: newHp }));
          });
          if (effectText) addLog(effectText);
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

  // 아이템 사용 턴: 적만 공격 (플레이어는 아이템을 씀)
  // returns 'continue' | 'player-faint'
  const executeEnemyTurn = useCallback(() => {
    const player = JSON.parse(sessionStorage.getItem('currentPokemon') || 'null');
    const enemy = JSON.parse(sessionStorage.getItem('enemyPokemon') || 'null');
    if (!player || !enemy) return 'continue';

    const validMoves = enemy.moves.filter((m) => m.power);
    const move = validMoves.length
      ? validMoves[Math.floor(Math.random() * validMoves.length)]
      : enemy.moves[0];

    if (!move?.power) {
      addLog(`${enemy.name}은(는) ${move?.koName}을(를) 사용했다!`);
      return 'continue';
    }

    const { damage, multiplier } = calcDamage(enemy, move, player);
    const effectText = effectivenessText(multiplier);
    const cp = JSON.parse(sessionStorage.getItem('currentPokemon') || 'null');
    const newHp = Math.max(0, (cp?.currentHp ?? 0) - damage);

    addLog(`${enemy.name}은(는) ${move.koName}을(를) 사용했다!`, () => {
      updatePlayerInStorage(player.catchId, (p) => ({ ...p, currentHp: newHp }));
    });
    if (effectText) addLog(effectText);

    if (newHp <= 0) {
      addLog(`${player.name}이(가) 쓰러졌다!`);
      return 'player-faint';
    }
    return 'continue';
  }, [addLog]);

  return { executeTurn, executeEnemyTurn };
}
