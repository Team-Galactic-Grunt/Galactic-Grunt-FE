import { useEffect, useMemo, useState } from 'react';
import { getAllPokemon } from '../api/getAllPokemon';
import { BAG_SECTIONS, DEFAULT_BAG } from './adminData';
import {
  clampCount,
  createDefaultAdminState,
  loadAdminState,
  normalizePokemonRow,
} from './adminStorage';
import styles from './AdminPage.module.css';

const tabs = [
  { id: 'bag', label: '가방 수량' },
  { id: 'dex', label: '도감 활성화' },
];

function cloneBag(bag) {
  return Object.fromEntries(
    Object.entries(bag).map(([sectionId, items]) => [
      sectionId,
      items.map((item) => ({ ...item })),
    ]),
  );
}

function cloneDex(dex) {
  return dex.map((entry) => ({ ...entry }));
}

function normalizeBag(sourceBag) {
  const nextBag = cloneBag(DEFAULT_BAG);

  for (const [sectionId, items] of Object.entries(sourceBag ?? {})) {
    nextBag[sectionId] = Array.isArray(items)
      ? items.map((item, index) => ({
          id: item?.id ?? `${sectionId}-${index}`,
          name: item?.name ?? `Item ${index + 1}`,
          count: clampCount(Number(item?.count ?? 0)),
          icon: item?.icon ?? '',
          desc: item?.desc ?? '',
        }))
      : [];
  }

  return nextBag;
}

export default function AdminPage() {
  const [state, setState] = useState(() => loadAdminState());
  const [activeTab, setActiveTab] = useState('bag');
  const [bagQuery, setBagQuery] = useState('');
  const [dexQuery, setDexQuery] = useState('');
  const [loadState, setLoadState] = useState('loading');

  useEffect(() => {
    let alive = true;

    async function initDex() {
      try {
        const result = await getAllPokemon();
        if (!alive) return;

        const normalized = Array.isArray(result)
          ? result.map(normalizePokemonRow)
          : [];

        setState((prev) => {
          if (prev.dex.length > 0) return prev;
          return { ...prev, dex: normalized };
        });
        setLoadState('ready');
      } catch {
        if (!alive) return;
        setLoadState('error');
      }
    }

    initDex();

    return () => {
      alive = false;
    };
  }, []);

  const bag = useMemo(() => normalizeBag(state.bag), [state.bag]);
  const dex = useMemo(() => cloneDex(state.dex), [state.dex]);

  const filteredDex = useMemo(() => {
    const normalizedQuery = dexQuery.trim().toLowerCase();
    if (!normalizedQuery) return dex;

    return dex.filter((entry) => {
      const idMatch = String(entry.id).includes(normalizedQuery);
      const nameMatch = String(entry.name).toLowerCase().includes(normalizedQuery);
      return idMatch || nameMatch;
    });
  }, [dex, dexQuery]);

  const bagItemCount = Object.values(bag).reduce(
    (total, items) => total + items.length,
    0,
  );
  const dexUnlockedCount = dex.filter((entry) => entry.unlocked).length;
  const dexLockedCount = dex.length - dexUnlockedCount;
  const loadStateText =
    loadState === 'ready'
      ? '완료'
      : loadState === 'error'
        ? '오류'
        : '불러오는 중';

  function updateItemCount(sectionId, itemId, nextCount) {
    setState((prev) => ({
      ...prev,
      bag: {
        ...prev.bag,
        [sectionId]: (prev.bag[sectionId] ?? []).map((item) =>
          item.id === itemId ? { ...item, count: clampCount(nextCount) } : item,
        ),
      },
    }));
  }

  function adjustItemCount(sectionId, itemId, delta) {
    setState((prev) => ({
      ...prev,
      bag: {
        ...prev.bag,
        [sectionId]: (prev.bag[sectionId] ?? []).map((item) =>
          item.id === itemId
            ? { ...item, count: clampCount(item.count + delta) }
            : item,
        ),
      },
    }));
  }

  function toggleDex(id) {
    setState((prev) => ({
      ...prev,
      dex: prev.dex.map((entry) =>
        entry.id === id ? { ...entry, unlocked: !entry.unlocked } : entry,
      ),
    }));
  }

  function unlockAllDex() {
    setState((prev) => ({
      ...prev,
      dex: prev.dex.map((entry) => ({ ...entry, unlocked: true })),
    }));
  }

  function lockAllDex() {
    setState((prev) => ({
      ...prev,
      dex: prev.dex.map((entry) => ({ ...entry, unlocked: false })),
    }));
  }

  function resetAll() {
    setState(createDefaultAdminState());
    setLoadState('loading');
    setTimeout(() => setLoadState('ready'), 0);
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>숨김 관리자</p>
            <h1 className={styles.title}>가방과 도감 관리</h1>
            <p className={styles.subtitle}>
              가방 수량을 조정하고 도감 활성화를 토글하는 관리자 화면입니다.
              이 화면은 숨겨진 경로로만 들어오며, 현재 상태는 메모리 안에서만
              관리됩니다.
            </p>
            <div className={styles.heroPills}>
              <span className={styles.statusBadge}>메모리</span>
              <span className={styles.statusBadgeSoft}>
                도감: {loadStateText}
              </span>
            </div>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>가방 아이템 수</span>
              <strong className={styles.statValue}>{bagItemCount}</strong>
              <span className={styles.statMeta}>
                {BAG_SECTIONS.length}개 포켓 기준
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>도감 활성 수</span>
              <strong className={styles.statValue}>{dexUnlockedCount}</strong>
              <span className={styles.statMeta}>전체 {dex.length}개 중</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>도감 비활성 수</span>
              <strong className={styles.statValue}>{dexLockedCount}</strong>
              <span className={styles.statMeta}>현재 잠김</span>
            </div>
            <button
              type='button'
              className={`${styles.button} ${styles.buttonSecondary} ${styles.resetButton}`}
              onClick={resetAll}
            >
              초기화
            </button>
          </div>
        </section>

        <div className={styles.sectionHeadRow}>
          <div>
            <h2 className={styles.sectionTitle}>관리 패널</h2>
            <p className={styles.sectionLead}>
              가방 수량 수정과 도감 활성화 화면을 전환합니다.
            </p>
          </div>

          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type='button'
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'bag' && (
          <section className={styles.panel}>
            <div className={styles.toolbar}>
              <div>
                <h2 className={styles.sectionTitle}>가방 수량</h2>
                <div className={styles.sectionMeta}>
                  수정 가능 아이템 {bagItemCount}개 / {BAG_SECTIONS.length}개 포켓
                </div>
              </div>

              <div className={styles.toolbarActions}>
                <input
                  className={styles.field}
                  placeholder='가방 아이템 검색'
                  onChange={(e) => setBagQuery(e.target.value)}
                  value={bagQuery}
                />
              </div>
            </div>

            <div className={styles.grid}>
              {BAG_SECTIONS.map((section) => {
                const items = bag[section.id] ?? [];
                const visibleItems = items.filter((item) => {
                  const q = bagQuery.trim().toLowerCase();
                  if (!q) return true;
                  return item.name.toLowerCase().includes(q);
                });

                return (
                  <article key={section.id} className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>{section.label}</h3>
                      <div className={styles.sectionMeta}>{items.length}개</div>
                    </div>

                    {visibleItems.length === 0 ? (
                      <div className={styles.emptyState}>일치하는 아이템이 없습니다.</div>
                    ) : (
                      <div className={styles.itemList}>
                        {visibleItems.map((item) => (
                          <div key={item.id} className={styles.itemRow}>
                            <img
                              src={item.icon}
                              alt={item.name}
                              className={styles.itemIcon}
                            />
                            <div>
                              <p className={styles.itemName}>{item.name}</p>
                              <p className={styles.itemDesc}>{item.desc}</p>
                            </div>
                            <div className={styles.countControls}>
                              <button
                                type='button'
                                className={styles.countButton}
                                onClick={() => adjustItemCount(section.id, item.id, -1)}
                              >
                                -
                              </button>
                              <input
                                className={styles.countInput}
                                type='number'
                                min='0'
                                value={item.count}
                                onChange={(e) =>
                                  updateItemCount(
                                    section.id,
                                    item.id,
                                    e.target.value === '' ? 0 : Number(e.target.value),
                                  )
                                }
                              />
                              <button
                                type='button'
                                className={styles.countButton}
                                onClick={() => adjustItemCount(section.id, item.id, 1)}
                              >
                                +
                              </button>
                            </div>
                            <div className={styles.sectionMeta}>#{item.id}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'dex' && (
          <section className={styles.panel}>
            <div className={styles.toolbar}>
              <div>
                <h2 className={styles.sectionTitle}>도감 활성화</h2>
                <div className={styles.sectionMeta}>
                  활성 {dexUnlockedCount}개 / 불러온 도감 {dex.length}개
                </div>
              </div>

              <div className={styles.toolbarActions}>
                <input
                  className={styles.field}
                  placeholder='이름 또는 번호 검색'
                  value={dexQuery}
                  onChange={(e) => setDexQuery(e.target.value)}
                />
                <button
                  type='button'
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={lockAllDex}
                >
                  전체 잠금
                </button>
                <button
                  type='button'
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={unlockAllDex}
                >
                  전체 활성화
                </button>
                <button
                  type='button'
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={() => setDexQuery('')}
                >
                  지우기
                </button>
              </div>
            </div>

            {filteredDex.length === 0 ? (
              <div className={styles.emptyState}>
                도감 항목이 없습니다. 포켓몬 데이터를 불러온 뒤 활성화를
                조작할 수 있습니다.
              </div>
            ) : (
              <div className={styles.itemList}>
                {filteredDex.map((entry) => (
                  <div key={entry.id} className={styles.dexRow}>
                    <div className={styles.dexId}>#{entry.id}</div>
                    <div className={styles.dexName}>{entry.name}</div>
                    <button
                      type='button'
                      className={entry.unlocked ? styles.dexFlagOn : styles.dexFlagOff}
                      onClick={() => toggleDex(entry.id)}
                    >
                      {entry.unlocked ? '활성' : '잠김'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
