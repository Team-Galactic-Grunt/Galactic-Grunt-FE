import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { loadAdminState } from '../admin/adminStorage';
import styles from './bagPage.module.css';

const pockets = [
  {
    id: 'medicine',
    name: '의료품',
    img: '/src/assets/images/bag_images/heal_icon.png',
    bagImg: '/src/assets/images/bag_images/medicine_bag.png',
  },
  {
    id: 'pokeballs',
    name: '몬스터볼',
    img: '/src/assets/images/bag_images/ball_icon.png',
    bagImg: '/src/assets/images/bag_images/pokeballs_bag.png',
  },
  {
    id: 'berries',
    name: '나무열매',
    img: '/src/assets/images/bag_images/fruit_icon.png',
    bagImg: '/src/assets/images/bag_images/berries_bag.png',
  },
  {
    id: 'keyitems',
    name: '중요물건',
    img: '/src/assets/images/bag_images/important_icon.png',
    bagImg: '/src/assets/images/bag_images/keyitems_bag.png',
  },
];

const REPEAT_SETS = 100;
const POCKETS_LEN = pockets.length;
const INIT_INDEX = Math.floor(REPEAT_SETS / 2) * POCKETS_LEN;
const ICON_WIDTH = 46;
const VIEWPORT_W = 360;

const getRealIndex = (index) =>
  ((index % POCKETS_LEN) + POCKETS_LEN) % POCKETS_LEN;

export default function BagPage() {
  const navigate = useNavigate();
  const [globalIndex, setGlobalIndex] = useState(INIT_INDEX);
  const [itemIndex, setItemIndex] = useState(0);
  const [bagState, setBagState] = useState(() => loadAdminState().bag);
  const focusedRowRef = useRef(null);

  const realIndex = getRealIndex(globalIndex);
  const currentPocket = pockets[realIndex];
  const items = bagState[currentPocket.id] ?? [];
  const safeItemIndex = items.length === 0 ? 0 : Math.min(itemIndex, items.length - 1);
  const currentItem = items[safeItemIndex];

  const translateX = VIEWPORT_W / 2 - ICON_WIDTH / 2 - globalIndex * ICON_WIDTH;

  useEffect(() => {
    const syncBagState = () => {
      setBagState(loadAdminState().bag);
    };

    syncBagState();
    window.addEventListener('storage', syncBagState);
    window.addEventListener('focus', syncBagState);

    return () => {
      window.removeEventListener('storage', syncBagState);
      window.removeEventListener('focus', syncBagState);
    };
  }, []);

  useEffect(() => {
    focusedRowRef.current?.scrollIntoView({ block: 'nearest' });
  }, [itemIndex, globalIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'x', 'X'].includes(
          e.key,
        )
      ) {
        e.preventDefault();
      }

      if (e.key === 'x' || e.key === 'X') {
        navigate('/map');
        return;
      }

      if (e.key === 'ArrowRight') {
        setGlobalIndex((prev) => prev + 1);
        setItemIndex(0);
      } else if (e.key === 'ArrowLeft') {
        setGlobalIndex((prev) => prev - 1);
        setItemIndex(0);
      } else if (e.key === 'ArrowDown') {
        if (items.length === 0) return;
        setItemIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        if (items.length === 0) return;
        setItemIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length, navigate]);

  return (
    <div id='game-screen' style={{ backgroundColor: 'black' }}>
      <div className={styles['top-section']}>
        <div className={styles['left-panel']}>
          <div className={styles['bag-title']}>가방</div>
          <div className={styles['bag-image-container']}>
            <div
              className={`${styles['bag-sprite']} ${styles['dp-bag-blue']}`}
              style={{
                backgroundImage: `url('${currentPocket.bagImg}')`,
                backgroundPosition: 'center',
                backgroundSize: 'contain',
              }}
            />
          </div>
          <div className={styles['pocket-selector-bg']}>
            <div className={styles['pocket-icons-viewport']}>
              <div
                className={styles['pocket-icons']}
                style={{ transform: `translateX(${translateX}px)` }}
              >
                {Array.from({ length: REPEAT_SETS }).flatMap((_, setIdx) =>
                  pockets.map((pocket, pIdx) => {
                    const idx = setIdx * POCKETS_LEN + pIdx;
                    return (
                      <img
                        key={idx}
                        className={`${styles['p-icon']}${idx === globalIndex ? ` ${styles['active']}` : ''}`}
                        src={pocket.img}
                        alt={pocket.name}
                      />
                    );
                  }),
                )}
              </div>
            </div>
            <div className={styles['pocket-name-box']}>{currentPocket.name}</div>
          </div>
        </div>

        <div className={styles['item-list-container']} id='item-list'>
          {items.map((item, idx) => (
            <div
              key={item.id ?? idx}
              ref={idx === safeItemIndex ? focusedRowRef : null}
              style={{ display: 'flex', alignItems: 'center' }}
              className={`${styles['item-row']}${idx === safeItemIndex ? ` ${styles['focused']}` : ''}`}
            >
              <span>{item.name}</span>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ display: 'inline-block', height: '45px' }}>x</span>
                <span
                  style={{
                    width: '45px',
                    display: 'inline-block',
                    textAlign: 'right',
                  }}
                >
                  {item.count}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles['bottom-section']}>
        <div className={styles['desc-icon-box']}>
          {currentItem ? (
            <img
              src={currentItem.icon}
              alt='item-icon'
              style={{
                width: 64,
                height: 64,
                objectFit: 'contain',
                marginBottom: 4,
              }}
            />
          ) : (
            <span>?</span>
          )}
        </div>
        <div className={styles['desc-text-box']}>
          {currentItem ? currentItem.desc : '아이템을 선택해주세요.'}
        </div>
      </div>
    </div>
  );
}
