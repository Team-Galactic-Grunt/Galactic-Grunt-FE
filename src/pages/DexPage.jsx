import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './dexpage.module.css';

// 🔥 타입별 색상표
const TYPE_COLORS = {
  NORMAL: '#A8A77A',
  FIRE: '#EE8130',
  WATER: '#6390F0',
  ELECTRIC: '#F7D02C',
  GRASS: '#7AC74C',
  ICE: '#96D9D6',
  FIGHTING: '#C22E28',
  POISON: '#A33EA1',
  GROUND: '#E2BF65',
  FLYING: '#A98FF3',
  PSYCHIC: '#F95587',
  BUG: '#A6B91A',
  ROCK: '#B6A136',
  GHOST: '#735797',
  DRAGON: '#6F35FC',
  DARK: '#705746',
  STEEL: '#B7B7CE',
  FAIRY: '#D685AD',
};

export default function DexPage({ onClose }) {
  const navigate = useNavigate();

  // 🔥 1. 데이터 동기화 로직이 포함된 도감 리스트 초기화
  const [dexList, setDexList] = useState(() => {
    const pokedex = sessionStorage.getItem('pokedex');
    const initialDex = pokedex ? JSON.parse(pokedex) : [];

    const pokemonBox = JSON.parse(sessionStorage.getItem('pokemonBox')) || [];
    const party = JSON.parse(sessionStorage.getItem('party')) || [];

    const allOwnedPokemons = [...pokemonBox, ...party];

    const syncedDex = initialDex.map((mon) => {
      const isOwned = allOwnedPokemons.some(
        (owned) => owned.sinnhoId === mon.id,
      );
      if (isOwned) {
        return { ...mon, watch: true, catch: true, isCaught: true };
      }
      return mon;
    });

    return syncedDex;
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedMon = dexList[selectedIndex];
  const itemRefs = useRef([]);

  // 🔥 2. 발견/포획 여부 체크 및 카운트
  const isSeen = (mon) => mon?.watch || mon?.catch || mon?.isCaught;
  const isCaught = (mon) => mon?.catch || mon?.isCaught;

  const seenCount = dexList.filter(isSeen).length;
  const caughtCount = dexList.filter(isCaught).length;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'x' || e.key === 'X') {
        if (onClose) onClose();
        else navigate(-1);
        return;
      }

      if (dexList.length === 0) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      setSelectedIndex((prev) => {
        let nextIndex = prev;
        switch (e.key) {
          case 'ArrowDown':
            nextIndex = Math.min(prev + 1, dexList.length - 1);
            break;
          case 'ArrowUp':
            nextIndex = Math.max(0, prev - 1);
            break;
          case 'ArrowRight':
            nextIndex = Math.min(prev + 10, dexList.length - 1);
            break;
          case 'ArrowLeft':
            nextIndex = Math.max(0, prev - 10);
            break;
          default:
            break;
        }
        return nextIndex;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dexList.length, navigate, onClose]);

  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedIndex]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.device}>
        {/* 상단 헤더 */}
        <div className={styles.header}>
          <div className={styles.headerBadge}>
            <span className={styles.badgeIcon}>◎</span>
            신오도감
            <span className={styles.badgeIcon}>◎</span>
          </div>
        </div>

        {/* 중앙 컨텐츠 영역 */}
        <div className={styles.body}>
          {/* 왼쪽: 포켓몬 이미지 + 하단 설명 박스 */}
          <div className={styles.portraitArea}>
            <div className={styles.portraitBox}>
              {selectedMon && (
                <img
                  src={selectedMon.frontSprite}
                  alt={selectedMon.name}
                  className={styles.pokemonImg}
                  style={{
                    // 미발견 시 실루엣 처리
                    filter: !isSeen(selectedMon) ? 'brightness(0)' : 'none',
                  }}
                />
              )}
            </div>

            <div className={styles.descBox}>
              {!isSeen(selectedMon) ? (
                <div className={styles.unknownText}>
                  이 포켓몬에 대한 정보가 아직 도감에 등록되지 않았다.
                </div>
              ) : selectedMon ? (
                <div className={styles.infoContent}>
                  {/* 1. 분류 */}
                  <div className={styles.infoRow}>
                    <span
                      className={styles.infoLabel}
                      style={{ width: '55px' }}
                    >
                      분류
                    </span>
                    <span>
                      {selectedMon.genus || selectedMon.category || '분류 불명'}
                    </span>
                  </div>

                  {/* 2. 타입 */}
                  <div className={styles.infoRow}>
                    <span
                      className={styles.infoLabel}
                      style={{ width: '55px' }}
                    >
                      타입
                    </span>
                    <div className={styles.types}>
                      {selectedMon.types ? (
                        selectedMon.types.map((t, i) => {
                          const typeUpper = t.toUpperCase();
                          const badgeColor = TYPE_COLORS[typeUpper] || '#888';
                          return (
                            <span
                              key={i}
                              className={styles.typeBadge}
                              style={{ backgroundColor: badgeColor }}
                            >
                              {typeUpper}
                            </span>
                          );
                        })
                      ) : (
                        <span>???</span>
                      )}
                    </div>
                  </div>

                  {/* 3. 키 / 몸무게 (단위 고정 및 너비 밸런스 패치) */}
                  <div className={styles.infoRow}>
                    <span
                      className={styles.infoLabel}
                      style={{ width: '35px' }}
                    >
                      키
                    </span>
                    <span className={styles.halfValue}>
                      {selectedMon.height ? `${selectedMon.height} m` : '??? m'}
                    </span>
                    <span
                      className={styles.infoLabel}
                      style={{ width: '90px', marginLeft: '10px' }}
                    >
                      몸무게
                    </span>
                    <span className={styles.halfValue}>
                      {selectedMon.weight
                        ? `${selectedMon.weight} kg`
                        : '??? kg'}
                    </span>
                  </div>

                  {/* 4. 도감 설명 */}
                  <div className={styles.descText}>
                    {selectedMon.description ||
                      selectedMon.desc ||
                      '도감 설명 데이터가 없습니다.'}
                  </div>
                </div>
              ) : (
                <div className={styles.unknownText}>포켓몬을 선택해주세요.</div>
              )}
            </div>
          </div>

          {/* 오른쪽: 포켓몬 리스트 */}
          <div className={styles.listArea}>
            <div className={styles.listContainer}>
              {dexList.length > 0 ? (
                dexList.map((pokemon, idx) => (
                  <div
                    key={pokemon.id || idx}
                    ref={(el) => (itemRefs.current[idx] = el)}
                    className={`${styles.listItem} ${
                      idx === selectedIndex ? styles.active : ''
                    }`}
                    onClick={() => setSelectedIndex(idx)}
                  >
                    {/* 포획/발견 여부에 따른 투명도 조절 */}
                    <div
                      className={styles.pokeballIcon}
                      style={{
                        opacity: isCaught(pokemon)
                          ? 1
                          : isSeen(pokemon)
                            ? 0.3
                            : 0.1,
                      }}
                    ></div>
                    <span className={styles.monNo}>
                      {String(pokemon.id || idx + 1).padStart(3, '0')}
                    </span>
                    <span className={styles.monName}>
                      {!isSeen(pokemon) ? '???' : pokemon.name}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                  데이터 없음
                </div>
              )}
            </div>

            <div className={styles.scrollTrack}>
              <div className={styles.scrollArrow}>▶</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
