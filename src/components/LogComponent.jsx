import styles from './logComponent.module.css';

export default function LogComponent({ displayText, waiting }) {
  return (
    <div className={styles.log}>
      <p className={styles.log_text}>{displayText}</p>
      {/* {waiting && <span className={styles.log_cursor}>▼</span>} */}
    </div>
  );
}
