import { useState, useImperativeHandle, forwardRef } from 'react';
import styles from './battleTransition.module.css';

const COLS = 4,
  ROWS = 3;
const INITIAL = 500,
  DELAY = 100,
  TRANSITION = 300,
  DUR = 2000;

const BattleTransition = forwardRef((_, ref) => {
  const [cells, setCells] = useState([]);

  useImperativeHandle(ref, () => ({
    start(onComplete) {
      const newCells = Array.from({ length: COLS * ROWS }, (_, i) => ({
        id: i,
        active: false,
        diagDelay: INITIAL + ((i % COLS) + Math.floor(i / COLS)) * DELAY,
      }));
      setCells(newCells);

      let maxDelay = 0;
      newCells.forEach((cell) => {
        if (cell.diagDelay > maxDelay) maxDelay = cell.diagDelay;
        setTimeout(() => {
          setCells((prev) =>
            prev.map((c) => (c.id === cell.id ? { ...c, active: true } : c)),
          );
        }, cell.diagDelay);
      });

      setTimeout(onComplete, maxDelay + TRANSITION + DUR);
    },
  }));

  return (
    <div className={styles.battle_change}>
      {cells.map((cell) => (
        <div
          key={cell.id}
          className={styles.bc_cell}
          style={{
            transition: `transform ${TRANSITION}ms ease-out ${cell.diagDelay}ms`,
            transform: cell.active ? 'scale(1)' : 'scale(0)',
          }}
        />
      ))}
    </div>
  );
});

BattleTransition.displayName = 'BattleTransition';

export default BattleTransition;
