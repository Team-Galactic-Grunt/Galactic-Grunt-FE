import { useState, useImperativeHandle, forwardRef } from 'react';
import styles from './battleTransition.module.css';

const COLS = 4,
  ROWS = 3;
const MAX_DIAG = COLS - 1 + ROWS - 1;
const INITIAL = 1000,
  DELAY = 250,
  TRANSITION = 250;

const OpenTransition = forwardRef((_, ref) => {
  const [cells, setCells] = useState(() =>
    Array.from({ length: COLS * ROWS }, (_, i) => ({
      id: i,
      active: true,
      diagDelay:
        INITIAL + (MAX_DIAG - ((i % COLS) + Math.floor(i / COLS))) * DELAY,
    })),
  );

  useImperativeHandle(ref, () => ({
    start(onComplete) {
      const maxDelay = MAX_DIAG * DELAY + INITIAL;
      cells.forEach((cell) => {
        setTimeout(() => {
          setCells((prev) =>
            prev.map((c) => (c.id === cell.id ? { ...c, active: false } : c)),
          );
        }, cell.diagDelay);
      });

      if (onComplete) setTimeout(onComplete, maxDelay + TRANSITION);
    },
  }));

  return (
    <div className={styles.battle_change}>
      {cells.map((cell) => (
        <div
          key={cell.id}
          className={styles.bc_cell}
          style={{
            transition: `transform ${TRANSITION}ms ease-in`,
            transform: cell.active ? 'scale(1)' : 'scale(0)',
          }}
        />
      ))}
    </div>
  );
});

OpenTransition.displayName = 'OpenTransition';

export default OpenTransition;
