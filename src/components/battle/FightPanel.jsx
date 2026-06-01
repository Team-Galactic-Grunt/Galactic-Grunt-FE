import React, { useState, useEffect } from 'react';
import styles from './movePanel.module.css';

function FightPanel({ onSelect, moves }) {
  const [moveIndex, setMoveIndex] = useState(0);

  const allPPZero = moves?.every((m) => (m.currentpp ?? 0) <= 0);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowUp') setMoveIndex((i) => (i - 2 + 4) % 4);
      if (e.key === 'ArrowDown') setMoveIndex((i) => (i + 2) % 4);
      if (e.key === 'ArrowLeft') setMoveIndex((i) => (i % 2 === 0 ? i : i - 1));
      if (e.key === 'ArrowRight')
        setMoveIndex((i) => (i % 2 === 1 ? i : i + 1));
      if (e.code === 'KeyZ') {
        const selected = moves?.[moveIndex];
        // 모든 PP가 0이면 발버둥(useBattle에서 처리), 아니면 PP 0 기술은 선택 불가
        if (!allPPZero && (selected?.currentpp ?? 0) <= 0) return;
        onSelect(moveIndex);
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [moveIndex, onSelect, moves, allPPZero]);

  return (
    <div className={styles.panel} style={{ width: '700px' }}>
      <div className={styles.inner_panel} style={{ padding: '10px 30px' }}>
        {moves?.map((move, i) => (
          <div
            key={i}
            className={`${styles.move} ${i === moveIndex ? styles.selected : ''}`}
          >
            {i === moveIndex && <span className={styles.cursor}>▶ </span>}
            {move.koName} {move.currentpp}/{move.maxpp}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FightPanel;
