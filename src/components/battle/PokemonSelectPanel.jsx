import { useEffect, useRef, useState } from 'react';
import styles from './movePanel.module.css';
import { syncCurrentPokemon } from '../../utils/syncCurrentPokemon';
import { exchangeCurrentPokemon } from '../../utils/exchangeCurrentPokemon';

export default function PokemonSelectPanel({
  selectedIndex,
  onMove,
  onSelect,
}) {
  const pokemon = JSON.parse(sessionStorage.getItem('isMyPokemon') || '[]');
  const currentPokemon = JSON.parse(
    sessionStorage.getItem('currentPokemon') || 'null',
  );

  const [toast, setToast] = useState(null); // null | 'active' | 'fainted'
  const itemRefs = useRef([]);

  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  useEffect(() => {
    const handleKey = (e) => {
      const list = JSON.parse(sessionStorage.getItem('isMyPokemon') || '[]');
      const active = JSON.parse(
        sessionStorage.getItem('currentPokemon') || 'null',
      );
      if (e.key === 'ArrowUp')
        onMove((i) => (i - 1 + list.length) % list.length);
      if (e.key === 'ArrowDown') onMove((i) => (i + 1) % list.length);
      if (e.code === 'KeyZ') {
        const selected = list[selectedIndex];
        if (selected?.catchId === active?.catchId) {
          setToast('active');
          setTimeout(() => setToast(null), 1000);
        } else if ((selected?.currentHp ?? 0) <= 0) {
          setToast('fainted');
          setTimeout(() => setToast(null), 1000);
        } else {
          const prevHp =
            JSON.parse(sessionStorage.getItem('currentPokemon') || 'null')
              ?.currentHp ?? 0;
          exchangeCurrentPokemon(selectedIndex);
          onSelect(selected, prevHp);
        }
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex, onMove, onSelect]);

  return (
    <div className={styles.panel} style={{ position: 'relative' }}>
      <div
        className={styles.inner_panel}
        style={{
          gridTemplateColumns: '1fr',
          padding: '8px 0 8px 15px',
          overflowY: 'scroll',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {pokemon.map((p, i) => (
          <div
            key={i}
            ref={(el) => (itemRefs.current[i] = el)}
            className={`${styles.move} ${i === selectedIndex ? styles.selected : ''}`}
            style={{ opacity: (p.currentHp ?? 0) <= 0 ? 0.4 : 1 }}
          >
            <span className={styles.cursor}>
              {i === selectedIndex ? '▶' : '• '}
            </span>
            <span style={{ display: 'inline-block', width: '100px' }}>
              Lv {p.level}
            </span>
            <span style={{ display: 'inline-block', width: '160px' }}>
              {p.name}
            </span>
            <span>
              {p.currentHp ?? 0}/{p.maxHp ?? 0}
            </span>
            {p.catchId === currentPokemon?.catchId && (
              <span
                style={{
                  display: 'inline-block',
                  width: '30px',
                  textAlign: 'right',
                }}
              >
                {' '}
                ★
              </span>
            )}
          </div>
        ))}
      </div>
      {toast === 'active' && (
        <div className={styles.save_toast}>이미 나가 있습니다.</div>
      )}
      {toast === 'fainted' && (
        <div className={styles.save_toast}>HP가 0입니다.</div>
      )}
    </div>
  );
}
