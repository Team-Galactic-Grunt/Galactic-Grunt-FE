import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import styles from './bagPage.module.css';

const pockets = [
  {
    id: 'medicine',
    name: '?뚮났??',
    img: '/src/assets/images/bag_images/heal_icon.png',
    bagImg: '/src/assets/images/bag_images/medicine_bag.png',
  },
  {
    id: 'pokeballs',
    name: '紐ъ뒪?곕낵',
    img: '/src/assets/images/bag_images/ball_icon.png',
    bagImg: '/src/assets/images/bag_images/pokeballs_bag.png',
  },
  {
    id: 'berries',
    name: '?섎Т?대ℓ',
    img: '/src/assets/images/bag_images/fruit_icon.png',
    bagImg: '/src/assets/images/bag_images/berries_bag.png',
  },
  {
    id: 'keyitems',
    name: '以묒슂?쒕Ъ嫄?',
    img: '/src/assets/images/bag_images/important_icon.png',
    bagImg: '/src/assets/images/bag_images/keyitems_bag.png',
  },
];

const inventoryData = {
  medicine: [
    {
      name: '怨좉툒?곸쿂??',
      count: 15,
      icon: '/src/assets/images/bag_images/hyper_potion.png',
      desc: '?ъ폆紐?1留덈━??HP瑜?200 ?뚮났?쒕떎.',
    },
    {
      name: '湲곕젰?섎뜦?대━',
      count: 2,
      icon: '/src/assets/images/bag_images/max_revive.png',
      desc: '湲곗젅???ъ폆紐?1留덈━瑜?HP媛 紐⑤몢 ?뚮났???곹깭濡??대┛??',
    },
  ],
  pokeballs: [
    {
      name: '紐ъ뒪?곕낵',
      count: 20,
      icon: '/src/assets/images/bag_images/monsterball.png',
      desc: `?쇱깮 ?ъ폆紐ъ뿉寃??섏졇???↔린 ?꾪븳 蹂?\n罹≪뒓?앹쑝濡??섏뼱 ?덈떎.`,
    },
    {
      name: '?섑띁蹂?',
      count: 10,
      icon: '/src/assets/images/bag_images/superball.png',
      desc: `紐ъ뒪?곕낵蹂대떎 ?ы쉷瑜좎씠 ?믪? 醫뗭? 蹂?`,
    },
    {
      name: '?섏씠?쇰낵',
      count: 5,
      icon: '/src/assets/images/bag_images/hyperball.png',
      desc: `?섑띁蹂쇰낫???ы쉷瑜좎씠 ?믪? 留ㅼ슦 醫뗭? 蹂?`,
    },
  ],
  tmhm: [],
  berries: [
    {
      name: '?ㅻ젋?대ℓ',
      count: 12,
      icon: '/src/assets/images/bag_images/oran_berry.png',
      desc: `?ъ폆紐ъ뿉寃?吏?덇쾶 ?섍굅???ъ슜?섎㈃\nHP瑜?10 ?뚮났?쒕떎.`,
    },
    {
      name: '?쒕가?대ℓ',
      count: 5,
      icon: '/src/assets/images/bag_images/presim_berry.png',
      desc: `?ъ폆紐ъ뿉寃?吏?덇쾶 ?섍굅???ъ슜?섎㈃\n?쇰? ?곹깭瑜??뚮났?쒕떎.`,
    },
    {
      name: '?먮춬?대ℓ',
      count: 8,
      icon: '/src/assets/images/bag_images/sitrus_berry.png',
      desc: `?ъ폆紐ъ뿉寃?吏?덇쾶 ?섍굅???ъ슜?섎㈃\nHP瑜?議곌툑 ?뚮났?쒕떎.`,
    },
  ],
  keyitems: [
    {
      name: '泥쒓퀎?섑뵾由?',
      count: 1,
      icon: '/src/assets/images/bag_images/azure_flute.png',
      desc: `泥쒓났???몃젮 ?쇱????뚯깋???몃떎???쇰━.\n?꾧? 留뚮뱾?덈뒗吏 ?????녿떎.`,
    },
    {
      name: '湲덇컯??',
      count: 1,
      icon: '/src/assets/images/bag_images/adamant_orb.png',
      desc: `?붿븘猷④??먭쾶 吏?덇쾶 ?섎㈃\n?쒕옒怨ㅺ낵 媛뺤쿋 ???湲곗닠???꾨젰???щ씪媛꾨떎.`,
    },
    {
      name: '諛깆삦',
      count: 1,
      icon: '/src/assets/images/bag_images/lustrous_orb.png',
      desc: `?꾧린?꾩뿉寃?吏?덇쾶 ?섎㈃\n?쒕옒怨ㅺ낵 臾????湲곗닠???꾨젰???щ씪媛꾨떎.`,
    },
    {
      name: '諛깃툑??',
      count: 1,
      icon: '/src/assets/images/bag_images/griseous_orb.png',
      desc: `湲곕씪?곕굹?먭쾶 吏?덇쾶 ?섎㈃\n?쒕옒怨ㅺ낵 怨좎뒪?????湲곗닠???꾨젰???щ씪媛硫?\n?ㅻ━吏꾪뤌?쇰줈 蹂?쒕떎.`,
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
        setItemIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
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
          <div
            className={styles['pocket-selector-bg']}
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
            <span>?え</span>
          )}
        </div>
        <div className={styles['desc-text-box']}>
          {currentItem ? currentItem.desc : '?꾩씠?쒖쓣 ?좏깮?댁＜?몄슂.'}
        </div>
      </div>
    </div>
  );
}
