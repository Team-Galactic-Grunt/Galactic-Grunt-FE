import { useEffect, useState } from 'react';
import styles from './movePanel.module.css';
import { syncCurrentPokemon } from '../../utils/syncCurrentPokemon';

export default function FaintPanel({ onSwitch, onEscape }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const getOptions = () => {
    const cp = JSON.parse(sessionStorage.getItem('currentPokemon') || 'null');
    const stored = JSON.parse(sessionStorage.getItem('isMyPokemon') || '[]');
    const hasOthers = stored.some(
      (p) => p.catchId !== cp?.catchId && (p.currentHp ?? 0) > 0,
    );
    return hasOthers ? ['교체하기', '도망가기'] : ['도망가기'];
  };

  const options = getOptions();

  useEffect(() => {
    const handleKey = (e) => {
      const opts = getOptions();
      if (e.key === 'ArrowRight')
        setSelectedIndex((i) => (i - 1 + opts.length) % opts.length);
      if (e.key === 'ArrowLeft') setSelectedIndex((i) => (i + 1) % opts.length);
      if (e.code === 'KeyZ') {
        if (opts[selectedIndex] === '교체하기') {
          onSwitch();
        } else {
          syncCurrentPokemon();
          onEscape();
        }
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex, onSwitch, onEscape]);

  return (
    <div className={styles.panel}>
      <div className={styles.inner_panel}>
        {options.map((option, i) => (
          <div
            key={i}
            className={`${styles.move} ${i === selectedIndex ? styles.selected : ''}`}
          >
            {i === selectedIndex && <span className={styles.cursor}>▶ </span>}
            {option}
          </div>
        ))}
      </div>
    </div>
  );
}
