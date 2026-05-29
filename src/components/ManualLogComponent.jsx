import { useEffect } from 'react';
import styles from './logComponent.module.css';

export default function ManualLogComponent({ displayText, waiting, advance }) {
  useEffect(() => {
    if (!waiting) return;
    const handleKey = (e) => {
      if (e.code === 'KeyZ') advance();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [waiting, advance]);

  return (
    <div className={styles.log}>
      <p className={styles.log_text}>{displayText}</p>
      {waiting && <span className={styles.log_cursor}>▼</span>}
    </div>
  );
}
