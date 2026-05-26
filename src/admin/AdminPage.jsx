import { useEffect, useMemo, useState } from 'react';
import { getAllPokemon } from '../api/getAllPokemon';
import { BAG_SECTIONS, DEFAULT_BAG } from './adminData';
import {
  clampCount,
  createDefaultAdminState,
  loadAdminState,
  normalizePokemonRow,
  saveAdminState,
} from './adminStorage';
import styles from './AdminPage.module.css';

const tabs = [
  { id: 'bag', label: 'Bag Counts' },
  { id: 'dex', label: 'Pokedex Unlocks' },
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
    saveAdminState(state);
  }, [state]);

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
          if (prev.dex.length > 0) {
            return {
              ...prev,
              dex: prev.dex,
            };
          }

          return {
            ...prev,
            dex: normalized,
          };
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
          <div>
            <p className={styles.eyebrow}>Admin tools</p>
            <h1 className={styles.title}>Inventory and Dex Control</h1>
            <p className={styles.subtitle}>
              Manage bag quantities and toggle Pokedex unlock states from one
              place. Changes are stored in localStorage under one shared key.
            </p>
          </div>

          <div className={styles.actions}>
            <div className={styles.statusBadge}>
              Dex load: {loadState}
            </div>
            <button
              type='button'
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={resetAll}
            >
              Reset State
            </button>
          </div>
        </section>

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

        {activeTab === 'bag' && (
          <section className={styles.panel}>
            <div className={styles.toolbar}>
              <div>
                <h2 className={styles.sectionTitle}>Bag Counts</h2>
                <div className={styles.sectionMeta}>
                  {bagItemCount} editable items across {BAG_SECTIONS.length} pockets
                </div>
              </div>
              <input
                className={styles.field}
                placeholder='Search bag item name'
                onChange={(e) => setBagQuery(e.target.value)}
                value={bagQuery}
              />
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
                      <div className={styles.sectionMeta}>
                        {items.length} items
                      </div>
                    </div>

                    {visibleItems.length === 0 ? (
                      <div className={styles.emptyState}>No matching items.</div>
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
                <h2 className={styles.sectionTitle}>Pokedex Unlocks</h2>
                <div className={styles.sectionMeta}>
                  {dexUnlockedCount} unlocked / {dex.length} loaded
                </div>
              </div>

              <div className={styles.actions}>
                <input
                  className={styles.field}
                  placeholder='Search by name or id'
                  value={dexQuery}
                  onChange={(e) => setDexQuery(e.target.value)}
                />
                <button
                  type='button'
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={lockAllDex}
                >
                  Lock All
                </button>
                <button
                  type='button'
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={unlockAllDex}
                >
                  Unlock All
                </button>
              </div>
            </div>

            {filteredDex.length === 0 ? (
              <div className={styles.emptyState}>
                No dex entries yet. Load your Pokemon data first, then use the
                unlock controls here.
              </div>
            ) : (
              <div className={styles.itemList}>
                {filteredDex.map((entry) => (
                  <div key={entry.id} className={styles.dexRow}>
                    <div className={styles.dexId}>#{entry.id}</div>
                    <div className={styles.dexName}>{entry.name}</div>
                    <button
                      type='button'
                      className={entry.unlocked ? styles.dexFlag : styles.button}
                      onClick={() => toggleDex(entry.id)}
                    >
                      {entry.unlocked ? 'Unlocked' : 'Locked'}
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
