import { useEffect, useMemo, useState } from "react";
// import { getAllPokemon } from "../api/getAllPokemon";
import AdminBagSection from "./AdminBagSection.jsx";
import AdminDexSection from "./AdminDexSection.jsx";
import AdminTabs from "./AdminTabs.jsx";
import styles from "./adminPage.module.css";

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("bag");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //  useEffect(() => {
  //     let isMounted = true;

  // async function loadData() {
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     const result = await getAllPokemon();

  //     if (isMounted) {
  //       setItems(result ?? []);
  //     }
  //   } catch (loadError) {
  //     if (isMounted) {
  //       setError("데이터를 불러오지 못했습니다.");
  //     }
  //   } finally {
  //     if (isMounted) {
  //       setLoading(false);
  //     }
  //   }
  //   // }

  //   loadData();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);

  /* const bagItems = useMemo(
    () => items.filter((item) => item.type === "bag"),
    [items],
  );

  const dexItems = useMemo(
    () => items.filter((item) => item.type === "dex"),
    [items],
  );

  if (loading) {
    return <div className={styles.page}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.page}>{error}</div>;*/
  // }

  return (
    <>
      <div className={styles.page}>
        <div className={styles.shell}>
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>관리자 도구</p>
              <h1 className={styles.title}>아이템 관리 및 도감 해금</h1>
              <p className={styles.subtitle}>
                지닌 물건 수량과 포켓몬 도감 상태를 한 화면에서 관리합니다.
              </p>
            </div>
          </section>
        </div>
        <AdminBagSection />
        <AdminDexSection />
        <AdminTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>
    </>
  );
}
/*
{activeTab === "bag" && <AdminBagSection bagItems={bagItems} />}
{activeTab === "dex" && <AdminDexSection dexItems={dexItems} />}*/
