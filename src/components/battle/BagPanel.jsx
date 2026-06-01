import { useEffect, useState } from 'react';
import styles from './bagPanel.module.css';

const TABS = ['berries', 'heal', 'ball'];
const TAB_LABELS = { berries: 'Berries', heal: 'Heal', ball: 'Ball' };

export default function BagPanel({ onSelect }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);

  const bag = JSON.parse(sessionStorage.getItem('bag') || '{}');
  const currentItems = bag[TABS[tabIndex]] ?? [];

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') {
        setTabIndex((i) => (i - 1 + TABS.length) % TABS.length);
        setItemIndex(0);
      } else if (e.key === 'ArrowRight') {
        setTabIndex((i) => (i + 1) % TABS.length);
        setItemIndex(0);
      } else if (e.key === 'ArrowUp') {
        setItemIndex((i) => {
          const items =
            JSON.parse(sessionStorage.getItem('bag') || '{}')[TABS[tabIndex]] ??
            [];
          return (i - 1 + items.length) % Math.max(items.length, 1);
        });
      } else if (e.key === 'ArrowDown') {
        setItemIndex((i) => {
          const items =
            JSON.parse(sessionStorage.getItem('bag') || '{}')[TABS[tabIndex]] ??
            [];
          return (i + 1) % Math.max(items.length, 1);
        });
      } else if (e.code === 'KeyZ') {
        const items =
          JSON.parse(sessionStorage.getItem('bag') || '{}')[TABS[tabIndex]] ??
          [];
        const selected = items[itemIndex];
        if (selected) onSelect?.(TABS[tabIndex], selected, itemIndex);
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [tabIndex, itemIndex, onSelect]);

  return (
    <div className={styles.panel}>
      {/* <div className={styles.tabs}>
        {TABS.map((tab, i) => (
          <div
            key={tab}
            className={`${styles.tab} ${i === tabIndex ? styles.tab_active : ''}`}
          >
            {TAB_LABELS[tab]}
          </div>
        ))}
      </div> */}
      <div className={styles.item_list}>
        {currentItems.length === 0 ? (
          <div className={styles.item}>없음</div>
        ) : (
          currentItems.map((item, i) => (
            <div key={i} className={styles.item}>
              <span className={styles.cursor}>
                {i === itemIndex ? '▶' : '  '}
              </span>
              <span>{item.name}</span>
              <span className={styles.count}>× {item.count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
