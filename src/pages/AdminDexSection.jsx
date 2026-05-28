import styles from "./adminPage.module.css";

export default function AdminDexSection({ dexItems = [] }) {
  return (
    <section className={styles.panel}>
      <div className={styles.toolbar}>
        <div>
          <h2 className={styles.sectionTitle}>Pokedex Unlocks</h2>
          <div className={styles.sectionMeta}>{dexItems.length} loaded</div>
        </div>
      </div>

      <div className={styles.itemList}>
        {dexItems.length === 0 ? (
          <div className={styles.emptyState}>
            표시할 도감 데이터가 없습니다.
          </div>
        ) : (
          dexItems.map((item) => (
            <div key={item.id} className={styles.dexRow}>
              <div className={styles.dexId}>#{item.id}</div>
              <div className={styles.dexName}>{item.name}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
