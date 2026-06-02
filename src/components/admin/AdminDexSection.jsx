import { useState, useMemo, useEffect } from 'react';
import styles from './adminDexPage.module.css';
import { getPokemonDex } from '../../api/getPokemonDex';
import { postDex } from '../../api/postDex';

/*
포켓몬 이미지
도감 번호(id)
watch : boolean 체크 박스
catch : boolean 체크 박스
*catch 가 true 이면 watch 도 true로
*/

export default function AdminDexSection() {
  const [dexPokemons, setDexPokemons] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const dexPerPage = 18;

  //도감 불러오기
  const fetchDex = async () => {
    const result = await getPokemonDex()
      .then((res) => {
        console.log(res);
        setDexPokemons(res);
        return res;
      })
      .catch((err) => {
        console.log(err);
        return [];
      });
    console.log(result);
    return result;
  };

  useEffect(() => {
    fetchDex().finally(() => setIsLoading(false));
    // console.log(res);
  }, []);

  //조우 함수
  const WatchChange = (id, checked) => {
    setDexPokemons((prev) =>
      prev.map((item) => (item.id === id ? { ...item, watch: checked } : item)),
    );
  };
  //포획 함수(true면 조우도 true)
  const CatchChange = (id, checked) => {
    setDexPokemons((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          catch: checked,
          watch: checked ? true : item.watch,
        };
      }),
    );
  };

  //페이지 넘김 함수

  const totalPages = Math.ceil(dexPokemons.length / dexPerPage);

  const currentDex = useMemo(() => {
    const start = (currentPage - 1) * dexPerPage;
    return dexPokemons.slice(start, start + dexPerPage);
  }, [dexPokemons, currentPage]);

  // 해금 저장 함수
  const openSaveModal = async () => {
    setSaveModal(true);
  };

  const confirmSave = async () => {
    try {
      setIsSaving(true);

      const payload = dexPokemons.map((item) => ({
        id: item.id,
        watch: item.watch,
        catch: item.catch,
      }));

      await postDex(payload);
      await fetchDex();
      setSaveModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <div
          style={{ marginTop: '20px', textAlign: 'center', fontSize: '22px' }}
        >
          DEX LOADING...
        </div>
      ) : (
        <>
          <section className={styles.panel}>
            <div className={styles.toolbar}>
              <h2 className={styles.sectionTitle}>포켓몬 도감 해금</h2>
            </div>

            <div className={styles.dexList}>
              {currentDex.map((card) => (
                <div key={card.id} className={styles.card}>
                  <div
                    className={`${styles.spriteFrame} ${card.catch ? styles.caught : ''}`}
                  >
                    <img
                      src={card.frontSprite}
                      alt='pkm'
                      className={styles.sprite}
                    />
                  </div>

                  <div className={styles.dexId}>
                    #{card.id} {card.name}
                  </div>
                  <label>
                    <input
                      type='checkbox'
                      checked={card.watch}
                      onChange={(e) => WatchChange(card.id, e.target.checked)}
                    />
                    조우함
                  </label>

                  <label>
                    <input
                      type='checkbox'
                      checked={card.catch}
                      onChange={(e) => CatchChange(card.id, e.target.checked)}
                    />
                    포획
                  </label>
                </div>
              ))}
            </div>

            <div className={styles.pagination}>
              <button
                type='button'
                // className={styles.pageButton}
                className={styles.pageButton}
                style={{ padding: '1px 3px 0 0' }}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                ◀
              </button>

              <div className={styles.pageInfo}>
                {currentPage} / {totalPages || 1}
              </div>

              <button
                type='button'
                className={styles.pageButton}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
              >
                ▶
              </button>
            </div>

            <div className={styles.changeBar}>
              <button
                className={styles.changeButton}
                onClick={() => setSaveModal(true)}
              >
                저장
              </button>
            </div>
            {saveModal && (
              <div className={styles.saveCard}>
                <div className={styles.isSave}>
                  <h2 className={styles.saveTitle}>저장하시겠습니까?</h2>
                  <p className={styles.saveText}>
                    바꾼 내용이 서버에 반영됩니다.
                  </p>

                  <div className={styles.saveActions}>
                    <button
                      className={styles.saveCancel}
                      onClick={() => setSaveModal(false)}
                    >
                      취소
                    </button>
                    <button
                      className={styles.saveConfirm}
                      onClick={confirmSave}
                    >
                      확인
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
