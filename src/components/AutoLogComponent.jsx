import { useEffect } from 'react';
import styles from './logComponent.module.css';

export default function AutoLogComponent({ displayText, waiting, advance, delay = 1500 }) {
  useEffect(() => {
    if (!waiting) return;
    const timer = setTimeout(() => advance(), delay);
    return () => clearTimeout(timer);
  }, [waiting, advance, delay]);

  return (
    <div className={styles.log}>
      <p className={styles.log_text}>{displayText}</p>
    </div>
  );
}
