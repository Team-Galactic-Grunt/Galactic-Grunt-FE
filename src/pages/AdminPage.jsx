import { useEffect, useMemo, useState } from "react";
import AdminBagSection from "../components/admin/AdminBagSection";
import AdminDexSection from "../components/admin/AdminDexSection";
import AdminTabs from "../components/admin/AdminTabs";
import styles from "../pages/AdminPage.module.css";

export default function AdminPage() {
  // const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("bag");
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // const bagItems = useMemo(
  //   () => items.filter((item) => item.type === "bag"),
  //   [items],
  // );

  // const dexItems = useMemo(
  //   () => items.filter((item) => item.type === "dex"),
  //   [items],
  // );

  // if (loading) {
  //   return <div className={styles.page}>Loading...</div>;
  // }
  // if (error) {
  //   return <div className={styles.page}>{error}</div>;
  // }

  return (
    <>
      <div className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.stickyHeader}>
            <section className={styles.hero}>
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>관리자 도구</p>
                <h1 className={styles.title}>아이템 관리 및 도감 해금</h1>
                <p className={styles.subtitle}>
                  지닌 물건 수량과 포켓몬 도감 상태를 한 화면에서 관리합니다.
                </p>
              </div>
            </section>
            <AdminTabs activeTab={activeTab} onChange={setActiveTab} />
          </div>
          {activeTab === "bag" && <AdminBagSection />}
          {activeTab === "dex" && <AdminDexSection />}
        </div>
      </div>
    </>
  );
}
