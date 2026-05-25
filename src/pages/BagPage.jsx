import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import styles from './bagPage.module.css';

const pockets = [
  {
    id: 'medicine',
    name: '회복약',
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
    name: '중요한물건',
    img: '/src/assets/images/bag_images/important_icon.png',
    bagImg: '/src/assets/images/bag_images/keyitems_bag.png',
  },
];

const inventoryData = {
  medicine: [
    {
      name: '고급상처약',
      count: 15,
      icon: '/src/assets/images/bag_images/hyper_potion.png',
      desc: '포켓몬 1마리의 HP를 200 회복한다.',
    },
    {
      name: '기력의덩어리',
      count: 2,
      icon: '/src/assets/images/bag_images/max_revive.png',
      desc: '기절한 포켓몬 1마리를 HP가 모두 회복된 상태로 살린다.',
    },
  ],
  pokeballs: [
    {
      name: '몬스터볼',
      count: 20,
      icon: '/src/assets/images/bag_images/monsterball.png',
      desc: `야생 포켓몬에게 던져서 잡기 위한 볼.\n캡슐식으로 되어 있다.`,
    },
    {
      name: '수퍼볼',
      count: 10,
      icon: '/src/assets/images/bag_images/superball.png',
      desc: `몬스터볼보다 포획률이 높은 좋은 볼.`,
    },
    {
      name: '하이퍼볼',
      count: 5,
      icon: '/src/assets/images/bag_images/hyperball.png',
      desc: `수퍼볼보다 포획률이 높은 매우 좋은 볼.`,
    },
  ],
  tmhm: [],
  berries: [
    {
      name: '오렌열매',
      count: 12,
      icon: '/src/assets/images/bag_images/oran_berry.png',
      desc: `포켓몬에게 지니게 하거나 사용하면\nHP를 10 회복한다.`,
    },
    {
      name: '시몬열매',
      count: 5,
      icon: '/src/assets/images/bag_images/presim_berry.png',
      desc: `포켓몬에게 지니게 하거나 사용하면\n혼란 상태를 회복한다.`,
    },
    {
      name: '자뭉열매',
      count: 8,
      icon: '/src/assets/images/bag_images/sitrus_berry.png',
      desc: `포켓몬에게 지니게 하거나 사용하면\nHP를 조금 회복한다.`,
    },
  ],
  keyitems: [
    {
      name: '천계의피리',
      count: 1,
      icon: '/src/assets/images/bag_images/azure_flute.png',
      desc: `천공에 울려 퍼지는 음색을 낸다는 피리.\n누가 만들었는지 알 수 없다.`,
    },
    {
      name: '금강옥',
      count: 1,
      icon: '/src/assets/images/bag_images/adamant_orb.png',
      desc: `디아루가에게 지니게 하면\n드래곤과 강철 타입 기술의 위력이 올라간다.`,
    },
    {
      name: '백옥',
      count: 1,
      icon: '/src/assets/images/bag_images/lustrous_orb.png',
      desc: `펄기아에게 지니게 하면\n드래곤과 물 타입 기술의 위력이 올라간다.`,
    },
    {
      name: '백금옥',
      count: 1,
      icon: '/src/assets/images/bag_images/griseous_orb.png',
      desc: `기라티나에게 지니게 하면\n드래곤과 고스트 타입 기술의 위력이 올라가며,\n오리진폼으로 변한다.`,
    },
  ],
};

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
  const focusedRowRef = useRef(null);

  const realIndex = getRealIndex(globalIndex);
  const currentPocket = pockets[realIndex];
  const items = inventoryData[currentPocket.id] ?? [];
  const currentItem = items[itemIndex];

  const translateX = VIEWPORT_W / 2 - ICON_WIDTH / 2 - globalIndex * ICON_WIDTH;

  // 포커스된 아이템 행 자동 스크롤
  useEffect(() => {
    focusedRowRef.current?.scrollIntoView({ block: 'nearest' });
  }, [itemIndex, globalIndex]);

  // 키보드 입력
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
        setItemIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        setItemIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length, navigate]);

  return (
    // <div className={styles['bag-overlay']}>
    <div id='game-screen' style={{ backgroundColor: 'black' }}>
      {/* 상단 구역 */}
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
          <div
            className={styles['pocket-selector-bg']}
            // style={{ width: '300px' }}
          >
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
            <div className={styles['pocket-name-box']}>
              {currentPocket.name}
            </div>
            {/* <div className={styles['pocket-label']}>POCKET</div> */}
          </div>
        </div>

        <div className={styles['item-list-container']} id='item-list'>
          {items.map((item, idx) => (
            <div
              key={idx}
              ref={idx === itemIndex ? focusedRowRef : null}
              style={{ display: 'flex', alignItems: 'center' }}
              className={`${styles['item-row']}${idx === itemIndex ? ` ${styles['focused']}` : ''}`}
            >
              <span>{item.name}</span>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ display: 'inline-block', height: '45px' }}>
                  x
                </span>
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

      {/* 하단 구역 */}
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
            <span>🪨</span>
          )}
        </div>
        <div className={styles['desc-text-box']}>
          {currentItem ? currentItem.desc : '아이템을 선택해주세요.'}
        </div>
      </div>
    </div>
    // </div>
  );
}
