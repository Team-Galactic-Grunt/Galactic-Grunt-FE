import { useEffect } from 'react';
import styles from './logComponent.module.css';

export default function LogComponent({
  displayText,
  waiting,
  advance = false,
  size = 'long',
}) {
  useEffect(() => {
    if (!advance || !waiting) return;
    const handleKey = (e) => {
      if (e.code === 'KeyZ') advance();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [waiting, advance]);

  return (
    <div
      className={styles.log}
      style={{ width: size === 'long' ? '1080px' : '605px' }}
    >
      <div className={styles.inner_log}>
        <p className={styles.log_text}>{displayText}</p>
      </div>
      {/* {waiting && <span className={styles.log_cursor}>▼</span>} */}
    </div>
  );
}
