import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./bagPage.module.css";
import PokemonPage from "./PokemonPage";

const pockets = [
  {
    id: "heal",
    name: "회복약",
    img: "/src/assets/images/bag_images/heal_icon.png",
    bagImg: "/src/assets/images/bag_images/medicine_bag.png",
  },
  {
    id: "ball",
    name: "몬스터볼",
    img: "/src/assets/images/bag_images/ball_icon.png",
    bagImg: "/src/assets/images/bag_images/pokeballs_bag.png",
  },
  {
    id: "berries",
    name: "나무열매",
    img: "/src/assets/images/bag_images/fruit_icon.png",
    bagImg: "/src/assets/images/bag_images/berries_bag.png",
  },
  {
    id: "important",
    name: "중요한물건",
    img: "/src/assets/images/bag_images/important_icon.png",
    bagImg: "/src/assets/images/bag_images/keyitems_bag.png",
  },
];

const REPEAT_SETS = 100;
const POCKETS_LEN = 4;
const INIT_INDEX = Math.floor(REPEAT_SETS / 2) * POCKETS_LEN;
const ICON_WIDTH = 46;
const VIEWPORT_W = 360;

// const isModal = true;

const getRealIndex = (index) =>
  ((index % POCKETS_LEN) + POCKETS_LEN) % POCKETS_LEN;

export default function BagPage() {
  const navigate = useNavigate();
  const [globalIndex, setGlobalIndex] = useState(INIT_INDEX);
  const [itemIndex, setItemIndex] = useState(0);

  // 새롭게 추가된 상태: 모달 열림 여부 및 모달 내 포커스 인덱스
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [actionIndex, setActionIndex] = useState(0);

  const actionMenuOptions = ["사용하기", "그만두기"];

  const [isModal, setIsModal] = useState(false); // 첨에는 가방만 보이게 false 특정행동시 true로

  const bag = sessionStorage.getItem("bag")
    ? JSON.parse(sessionStorage.getItem("bag"))
    : {};

  console.log(bag.important);

  const focusedRowRef = useRef(null);

  const realIndex = getRealIndex(globalIndex);
  const currentPocket = pockets[realIndex];
  const items = bag[currentPocket.id] ?? [];
  const currentItem = items[itemIndex];

  const translateX = VIEWPORT_W / 2 - ICON_WIDTH / 2 - globalIndex * ICON_WIDTH;

  useEffect(() => {
    focusedRowRef.current?.scrollIntoView({ block: "nearest" });
  }, [itemIndex, globalIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      console.log("이벤트 test", e.key);
      console.log(isModal, isActionMenuOpen);
      // z, Z 키도 기본 동작 방지를 위해 배열에 추가
      // if (
      //   [
      //     "ArrowUp",
      //     "ArrowDown",
      //     "ArrowLeft",
      //     "ArrowRight",
      //     "x",
      //     "X",
      //     "z",
      //     "Z",
      //   ].includes(e.key)
      // ) {
      //   e.preventDefault();
      // }

      // PokmonPageModal 열려있을때 제어
      if (isModal === true) {
        if (e.key == "x" || e.key == "X") {
          setIsModal(false); // X를 누르면 모달 닫고 가방으로 복귀
        }
        return; // 가방 뒤쪽 로직(방향키 이동, 메뉴 열기 등)이 실행되지 않도록 여기서 함수 종료
      }

      //  액션 메뉴(사용하기 탭)가 열려있을 때의 로직
      if (isActionMenuOpen === true) {
        if (e.key === "x" || e.key === "X") {
          setIsActionMenuOpen(false); // X 누르면 메뉴 닫기
        } else if (e.key === "z") {
          console.log(e.key);
          if (actionIndex === 0) {
            // 사용하기
            console.log(`${currentItem?.name} 사용`);
            setIsModal(true); // 사용누르면 포켓몬박스 창 열림
            setIsActionMenuOpen(false); // (메뉴는 닫기)
          } else if (actionIndex === 1) {
            // 그만두기
            setIsActionMenuOpen(false);
          }
        } else if (e.key === "ArrowUp") {
          setActionIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "ArrowDown") {
          setActionIndex((prev) =>
            Math.min(prev + 1, actionMenuOptions.length - 1),
          );
        }
        return; // 메뉴가 열려있을 때는 뒤쪽의 가방 탐색 로직이 실행되지 않도록 리턴
      }

      // 모달이 아무것도 안켜진 X 이벤트
      // if (e.key === "KeyX") {
      //   navigate("/map");
      //   return;
      // }

      if (e.key === "x" || e.key === "X") {
        navigate("/map");
        return;
      }

      // 모달이 아무것도 안켜진 Z
      if (e.key === "z") {
        console.log("사용");
        if (
          items.length > 0 &&
          (currentPocket.id === "heal" || currentPocket.id === "berries")
        ) {
          console.log("currentPocket : ", currentPocket);
          setIsActionMenuOpen(true);
          setActionIndex(0); // 메뉴 열 때 포커스 초기화
        }
        return;
      }

      if (e.key === "ArrowRight") {
        setGlobalIndex((prev) => prev + 1);
        setItemIndex(0);
      } else if (e.key === "ArrowLeft") {
        setGlobalIndex((prev) => prev - 1);
        setItemIndex(0);
      } else if (e.key === "ArrowDown") {
        setItemIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        setItemIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    items.length,
    navigate,
    isActionMenuOpen,
    actionIndex,
    currentItem,
    actionMenuOptions.length,
    isModal, // 회복약 사용 후 가방으로 돌아와서 키 안먹던 문제 해결
  ]);

  return (
    // 모달의 기준점이
    <div
      id="game-screen"
      style={{ backgroundColor: "black", position: "relative" }}
    >
      {/* 모달 오버레이 설정 */}
      {isModal && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%", // 전체 화면을 덮고 싶다면 100%, 윗화면만 덮고싶다면 50% 등 조절
            zIndex: 999, // 가방 UI보다 무조건 위에 오도록 높은 숫자 부여
            backgroundColor: "black", // 뒷배경 처리
          }}
        >
          {}
          <PokemonPage
            onClose={() => setIsModal(false)}
            usageItem={currentItem} // 가방에서 Z키를 눌러 팝업을 띄울 때,가방에서 포커스 되어 있던 아이템 데이터가 포켓몬 페이지로 배달
            // 가방 페이지에서는 체력 차는데 메뉴에서 들어가면 체력 안차있는 문제 해결
          />
        </div>
      )}

      {/* 상단 구역 */}
      <div className={styles["top-section"]}>
        <div className={styles["left-panel"]}>
          <div className={styles["bag-title"]}>가방</div>
          <div className={styles["bag-image-container"]}>
            <div
              className={`${styles["bag-sprite"]} ${styles["dp-bag-blue"]}`}
              style={{
                backgroundImage: `url('${currentPocket.bagImg}')`,
                backgroundPosition: "center",
                backgroundSize: "contain",
              }}
            />
          </div>
          <div className={styles["pocket-selector-bg"]}>
            <div className={styles["pocket-icons-viewport"]}>
              <div
                className={styles["pocket-icons"]}
                style={{ transform: `translateX(${translateX}px)` }}
              >
                {Array.from({ length: REPEAT_SETS }).flatMap((_, setIdx) =>
                  pockets.map((pocket, pIdx) => {
                    const idx = setIdx * POCKETS_LEN + pIdx;
                    return (
                      <img
                        key={idx}
                        className={`${styles["p-icon"]}${idx === globalIndex ? ` ${styles["active"]}` : ""}`}
                        src={pocket.img}
                        alt={pocket.name}
                      />
                    );
                  }),
                )}
              </div>
            </div>
            <div className={styles["pocket-name-box"]}>
              {currentPocket.name}
            </div>
          </div>
        </div>

        <div
          className={styles["item-list-container"]}
          id="item-list"
          style={{ position: "relative" }}
        >
          {items.map((item, idx) => {
            return (
              item.count !== 0 && (
                <div
                  key={idx}
                  ref={idx === itemIndex ? focusedRowRef : null}
                  style={{ display: "flex", alignItems: "center" }}
                  className={`${styles["item-row"]}${idx === itemIndex ? ` ${styles["focused"]}` : ""}`}
                >
                  <span>{item.name}</span>
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ display: "inline-block", height: "45px" }}>
                      x
                    </span>
                    <span
                      style={{
                        width: "45px",
                        display: "inline-block",
                        textAlign: "right",
                      }}
                    >
                      {item.count}
                    </span>
                  </span>
                </div>
              )
            );
          })}

          {}
          {isActionMenuOpen && (
            <div
              style={{
                position: "absolute",
                right: "30px",
                bottom: "30px",
                backgroundColor: "white",
                border: "5px solid #5a5a5a",
                borderRadius: "10px",
                padding: "15px 20px",
                minWidth: "120px",
                color: "#333",
                fontFamily: "'pokemon_font'",
                fontSize: "24px",
                boxShadow: "2px 2px 0px rgba(0,0,0,0.5)",
                zIndex: 10,
              }}
            >
              {actionMenuOptions.map((opt, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "5px 0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      display: "inline-block",
                      color: "red",
                    }}
                  >
                    {idx === actionIndex ? "▶" : ""}
                  </span>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 하단 구역 */}
      <div className={styles["bottom-section"]}>
        <div className={styles["desc-icon-box"]}>
          {currentItem.count != 0 ? (
            <img
              src={`/src/assets/images/bag_images/${currentItem.id}.png`}
              alt="item-icon"
              style={{
                width: 64,
                height: 64,
                objectFit: "contain",
                marginBottom: 4,
              }}
            />
          ) : (
            <span></span>
          )}
        </div>
        <div className={styles["desc-text-box"]}>
          {currentItem.count !== 0
            ? currentItem.desc.split("\\n").map((val, idx) => {
                console.log(val);
                return (
                  <div>
                    <span>{val}</span>
                    <br />
                  </div>
                );
              })
            : "아이템을 선택해주세요."}
        </div>
      </div>
    </div>
  );
}
