import { useState, useRef, useCallback, useEffect } from 'react';
import { calcDamage, effectivenessText } from '../utils/battleCalc';

export function useBattle({ player, enemy, addLog }) {
  const [playerHp, setPlayerHp] = useState(0);
  const [enemyHp, setEnemyHp] = useState(0);
  const playerHpRef = useRef(0);
  const enemyHpRef = useRef(0);

  useEffect(() => {
    if (player) {
      playerHpRef.current = player.baseStats.hp;
      setPlayerHp(player.baseStats.hp);
    }
  }, [player]);

  useEffect(() => {
    if (enemy) {
      enemyHpRef.current = enemy.baseStats.hp;
      setEnemyHp(enemy.baseStats.hp);
    }
  }, [enemy]);

  // returns 'continue' | 'enemy-faint' | 'player-faint'
  const executeTurn = useCallback((moveIdx) => {
    if (!player || !enemy) return 'continue';

    const playerMove = player.moves[moveIdx];
    const enemyMoves = enemy.moves.filter((m) => m.power);
    const enemyMove =
      enemyMoves.length
        ? enemyMoves[Math.floor(Math.random() * enemyMoves.length)]
        : enemy.moves[0];

    const playerFirst = player.baseStats.speed >= enemy.baseStats.speed;
    let result = 'continue';

    const doAttack = (attacker, move, isPlayerAttacking) => {
      if (result !== 'continue') return;

      const defender = isPlayerAttacking ? enemy : player;
      addLog(`${attacker.name}은(는) ${move.koName}을(를) 사용했다!`);

      if (!move.power) return;

      const { damage, multiplier } = calcDamage(attacker, move, defender);
      const text = effectivenessText(multiplier);
      if (text) addLog(text);

      if (isPlayerAttacking) {
        enemyHpRef.current = Math.max(0, enemyHpRef.current - damage);
        setEnemyHp(enemyHpRef.current);
        if (enemyHpRef.current <= 0) {
          addLog(`야생 ${enemy.name}이(가) 쓰러졌다!`);
          result = 'enemy-faint';
        }
      } else {
        playerHpRef.current = Math.max(0, playerHpRef.current - damage);
        setPlayerHp(playerHpRef.current);
        if (playerHpRef.current <= 0) {
          addLog(`${player.name}이(가) 쓰러졌다!`);
          result = 'player-faint';
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
  }, [player, enemy, addLog]);

  return { playerHp, enemyHp, executeTurn };
}
