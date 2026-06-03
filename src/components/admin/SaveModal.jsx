import React from 'react';
import styles from './saveModal.module.css';
import { Player } from '@lottiefiles/react-lottie-player';
import loading from '/src/assets/images/loading.json';

export default function SaveModal({ isSaving, setSaveModal, onClick }) {
  return (
    <div className={styles.saveCard}>
      <div className={styles.isSave}>
        <h2 style={{ margin: '30px 0 0 0' }}>저장하시겠습니까?</h2>
        <p className={styles.saveText}>바꾼 내용이 서버에 반영됩니다.</p>

        <div className={styles.saveActions}>
          <button
            className={styles.saveCancel}
            onClick={() => setSaveModal(false)}
          >
            취소
          </button>
          <button className={styles.saveConfirm} onClick={onClick}>
            확인
          </button>
        </div>
        {isSaving && (
          <Player autoplay loop src={loading} className={styles.loading} />
        )}
      </div>
    </div>
  );
}
