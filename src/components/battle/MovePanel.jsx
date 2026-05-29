import { useEffect } from 'react';
import styles from './movePanel.module.css';

export default function MovePanel({ moves, moveIndex, onMove, onSelect }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowUp')    onMove((i) => (i - 2 + 4) % 4);
      if (e.key === 'ArrowDown')  onMove((i) => (i + 2) % 4);
      if (e.key === 'ArrowLeft')  onMove((i) => (i % 2 === 0 ? i : i - 1));
      if (e.key === 'ArrowRight') onMove((i) => (i % 2 === 1 ? i : i + 1));
      if (e.code === 'KeyZ') onSelect(moveIndex);
      e.preventDefault();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [moveIndex, onMove, onSelect]);

  return (
    <div className={styles.panel}>
      {moves?.map((move, i) => (
        <div
          key={i}
          className={`${styles.move} ${i === moveIndex ? styles.selected : ''}`}
        >
          {i === moveIndex && <span className={styles.cursor}>▶ </span>}
          {move.koName}
        </div>
      ))}
    </div>
  );
}
