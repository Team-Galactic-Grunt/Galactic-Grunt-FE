import React from 'react';
import styles from './helpCompontent.module.css';

function HelpComponent() {
  return (
    <div className={styles.wrap_bg}>
      <div className={styles.wrap_help}>
        <div
          style={{
            width: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div className={styles.wrap_key_info}>
            <img
              src='/src/assets/images/zkey.png'
              alt='help'
              className={styles.key_img}
            />
            <div> : 확인 / 선택</div>
          </div>

          <div className={styles.wrap_key_info}>
            <img
              src='/src/assets/images/xkey.png'
              alt='help'
              className={styles.key_img}
            />
            <div> : 취소 / 뒤로가기</div>
          </div>

          <div className={styles.wrap_key_info}>
            <img
              src='/src/assets/images/ckey.png'
              alt='help'
              className={styles.key_img}
            />
            <div> : 메뉴</div>
          </div>
        </div>

        <div style={{ width: '508px' }}>
          <div className={styles.wrap_key_info}>
            <img
              src='/src/assets/images/arrowkey.png'
              alt='help'
              className={styles.arrow_img}
            />
            <div> : 캐릭터 / 메뉴 이동</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpComponent;
