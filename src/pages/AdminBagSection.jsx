// src/pages/components/AdminBagSection.jsx
import { useState, useEffect } from "react";
import styles from "./adminPage.module.css";
import { getBagItems } from "../api/getBagItems";
import { postBagItems } from "../api/postBagItems";

export default function AdminBagSection() {
  const [bagItems, setBagItems] = useState(null);
  const [saveModal, setSaveModal] = useState(false);

  const fetchBag = async () => {
    const result = await getBagItems()
      .then((res) => {
        console.log(res);
        setBagItems(res);
        return res;
      })
      .catch((err) => {
        console.log(err);
        return {};
      });
    console.log(result);

    return result;
  };

  useEffect(() => {
    fetchBag();
    // console.log(res);
  }, []);

  //  카운트 증가
  const increaseCount = (itemSectionName, itemIndex) => {
    const nextBagItems = { ...bagItems };
    const targetGroup = nextBagItems[itemSectionName];
    let updatedGroup;

    if (itemSectionName === "important") {
      updatedGroup = targetGroup.map((item, i) => {
        if (i === itemIndex) {
          return { ...item, count: item.count == 0 ? 1 : 0 };
        }
        return item;
      });
    } else {
      updatedGroup = targetGroup.map((item, i) => {
        if (i === itemIndex) {
          return { ...item, count: item.count < 999 ? item.count + 1 : 999 };
        }
        return item;
      });
    }
    nextBagItems[itemSectionName] = updatedGroup;
    console.log(nextBagItems);
    setBagItems(nextBagItems);
  };

  // 카운트 감소
  const decreaseCount = (itemSectionName, itemIndex) => {
    const nextBagItems = { ...bagItems };
    const targetGroup = nextBagItems[itemSectionName];
    let updatedGroup;

    if (itemSectionName === "important") {
      updatedGroup = targetGroup.map((item, i) => {
        if (i === itemIndex) {
          return { ...item, count: item.count == 1 ? item.count - 1 : 0 };
        }
        return item;
      });
    } else {
      updatedGroup = targetGroup.map((item, i) => {
        if (i === itemIndex) {
          return { ...item, count: item.count >= 1 ? item.count - 1 : 0 };
        }
        return item;
      });
    }
    nextBagItems[itemSectionName] = updatedGroup;

    setBagItems(nextBagItems);
  };

  // 서버 반영 확인용
  const confirmSave = async () => {
    try {
      console.log(bagItems);
      await postBagItems(bagItems);
      await fetchBag();
      setSaveModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className={styles.sectionCard}>
        <h2>중요한 물건</h2>
        <div className={styles.itemList}>
          {bagItems &&
            bagItems?.important?.map((val, idx) => (
              <div key={val.id} className={styles.itemRow}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{val.name}</div>
                  <div className={styles.itemDesc}>{val.desc}</div>
                </div>
                <div className={styles.countControls}>
                  <button
                    className={styles.countBtn}
                    onClick={() => decreaseCount("important", idx)}
                  >
                    -
                  </button>
                  {val.count}
                  <button
                    className={styles.countBtn}
                    onClick={() => increaseCount("important", idx)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <h2>볼</h2>
        <div className={styles.itemList}>
          {bagItems &&
            bagItems.ball.map((val, idx) => (
              <div key={val.id} className={styles.itemRow}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{val.name}</div>
                  <div className={styles.itemDesc}>{val.desc}</div>
                </div>
                <div className={styles.countControls}>
                  <button
                    className={styles.countBtn}
                    onClick={() => decreaseCount("ball", idx)}
                  >
                    -
                  </button>
                  <span> {val.count} </span>
                  <button
                    className={styles.countBtn}
                    onClick={() => increaseCount("ball", idx)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <h2>열매</h2>
        <div className={styles.itemList}>
          {bagItems &&
            bagItems.berries.map((val, idx) => (
              <div key={val.id} className={styles.itemRow}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{val.name}</div>
                  <div className={styles.itemDesc}>{val.desc}</div>
                </div>
                <div className={styles.count}>
                  <button
                    className={styles.countBtn}
                    onClick={() => decreaseCount("berries", idx)}
                  >
                    -
                  </button>
                  <span> {val.count} </span>
                  <button
                    className={styles.countBtn}
                    onClick={() => increaseCount("berries", idx)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <h2>회복</h2>
        <div className={styles.itemList}>
          {bagItems &&
            bagItems.heal.map((val, idx) => (
              <div key={val.id} className={styles.itemRow}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{val.name}</div>
                  <div className={styles.itemDesc}>{val.desc}</div>
                </div>
                <div className={styles.countControls}>
                  <button
                    className={styles.countBtn}
                    onClick={() => decreaseCount("heal", idx)}
                  >
                    -
                  </button>
                  <span> {val.count} </span>
                  <button
                    className={styles.countBtn}
                    onClick={() => increaseCount("heal", idx)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className={styles.changeBar}>
        <button
          className={styles.changeButton}
          onClick={() => setSaveModal(true)}
        >
          변경
        </button>
      </div>
      {saveModal && (
        <div className={styles.saveCard}>
          <div className={styles.isSave}>
            <h2 className={styles.saveTitle}>저장하시겠습니까?</h2>
            <p className={styles.saveText}>
              지금 바꾼 내용을 저장할게요. 저장하면 서버에 반영됩니다.
            </p>

            <div className={styles.saveActions}>
              <button
                className={styles.saveCancel}
                onClick={() => setSaveModal(false)}
              >
                취소
              </button>
              <button className={styles.saveConfirm} onClick={confirmSave}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
