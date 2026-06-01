/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import styles from "./pokemonpage.module.css";

const TYPE_COLORS = {
  NORMAL: "#A8A77A",
  FIRE: "#EE8130",
  WATER: "#6390F0",
  ELECTRIC: "#F7D02C",
  GRASS: "#7AC74C",
  ICE: "#96D9D6",
  FIGHTING: "#C22E28",
  POISON: "#A33EA1",
  GROUND: "#E2BF65",
  FLYING: "#A98FF3",
  PSYCHIC: "#F95587",
  BUG: "#A6B91A",
  ROCK: "#B6A136",
  GHOST: "#735797",
  DRAGON: "#6F35FC",
  DARK: "#705746",
  STEEL: "#B7B7CE",
  FAIRY: "#D685AD",
};

const MAX_BOX_COUNT = 5;
const MAX_PARTY = 5;
const MAX_BOX_ROW = 4;
const MAX_BOX_COL = 5;

function PokemonPage({ onClose, usageItem }) {
  const navigate = useNavigate();

  // 아이템 효과 전담 계산 함수 (parseInt)
  const applyItemEffect = (pokemon, item) => {
    if (!item || !item.func) {
      return { success: false, message: "이 아이템은 여기서 쓸 수 없다!" };
    }

    const { currentHp, maxHp } = pokemon;
    const isFainted = currentHp <= 0;

    // [부활 아이템]
    if (item.func.revive) {
      if (!isFainted)
        return { success: false, message: "상태가 이상하지 않다!" };
      return {
        success: true,
        newHp: maxHp,
        message: `${pokemon.name}은(는) 기력을 회복했다!`,
      };
    }

    // [회복 아이템]
    if (item.func.heal) {
      if (isFainted)
        return { success: false, message: "기절한 포켓몬에게는 쓸 수 없다!" };
      if (currentHp >= maxHp)
        return { success: false, message: "체력이 이미 가득 차 있습니다!" };

      let healAmount;
      const healValue = String(item.func.heal);

      // 퍼센트 회복 (예: 25%)
      if (healValue.includes("%")) {
        const percent = parseInt(healValue.replace("%", ""), 10);
        healAmount = Math.floor(maxHp * (percent / 100));
      }
      // 고정 수치 회복 (예: 200)
      else {
        healAmount = parseInt(healValue, 10);
      }

      let finalHp = currentHp + healAmount;
      if (finalHp > maxHp) finalHp = maxHp;

      return {
        success: true,
        newHp: finalHp,
        message: `${pokemon.name}의 체력이 회복되었다!`,
      };
    }
    return { success: false, message: "아무 일도 일어나지 않았다." };
  };

  // 2. 상태 관리 (기존 상태 100% 보존)
  const [currentArea, setCurrentArea] = useState("party");
  const [partyIndex, setPartyIndex] = useState(0);
  const [boxRow, setBoxRow] = useState(0);
  const [boxCol, setBoxCol] = useState(0);
  const [currentBox, setCurrentBox] = useState(1);

  const [dialogType, setDialogType] = useState("");
  const [dialogText, setDialogText] = useState("");
  const [confirmIndex, setConfirmIndex] = useState(0);

  const [isBoxMenuOpen, setIsBoxMenuOpen] = useState(false);
  const [boxMenuIndex, setBoxMenuIndex] = useState(0);
  const [swapSource, setSwapSource] = useState(null);

  const [pokeData, setPokeData] = useState(() => {
    const storedBox = sessionStorage.getItem("pokemonBox");
    const pokemon = storedBox ? JSON.parse(storedBox) : [];
    if (pokemon.length > 0) {
      let initialPokemon = [[], [], [], [], []];
      let idx = 30;
      for (let i = 0; i < Math.floor(pokemon.length / 5); i++) {
        initialPokemon[i] = pokemon.slice(idx - 30, idx);
        idx += 30;
      }
      return initialPokemon;
    }
    return [[], [], [], [], []];
  });

  const [partyData, setPartyData] = useState(() => {
    const storedParty = sessionStorage.getItem("isMyPokemon");
    const party = storedParty ? JSON.parse(storedParty) : [];
    if (party.length > 0) return party;
    alert("정상적인 접근이 아닙니다.");
    return [];
  });

  const handlePrevBox = () =>
    setCurrentBox((prev) => (prev > 1 ? prev - 1 : MAX_BOX_COUNT));
  const handleNextBox = () =>
    setCurrentBox((prev) => (prev < MAX_BOX_COUNT ? prev + 1 : 1));

  // 3. 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "z",
          "Z",
          "x",
          "X",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }

      // [기존 유지] 박스 메뉴가 열려있을 때
      if (isBoxMenuOpen) {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          setBoxMenuIndex((prev) => (prev === 0 ? 1 : 0));
        } else if (e.key === "x" || e.key === "X") {
          setIsBoxMenuOpen(false);
        } else if (e.key === "z" || e.key === "Z") {
          if (boxMenuIndex === 0) {
            setSwapSource({
              area: currentArea,
              partyIndex,
              currentBox,
              boxRow,
              boxCol,
            });
          }
          setIsBoxMenuOpen(false);
        }
        return;
      }

      // 대화창 제어
      if (dialogType !== "") {
        if (
          dialogType === "FULL_HP" ||
          dialogType === "RESULT" ||
          dialogType === "ERROR"
        ) {
          if (["z", "Z", "x", "X"].includes(e.key)) {
            if (dialogType === "RESULT" && onClose) onClose();
            setDialogType("");
            setDialogText("");
          }
        } else if (dialogType === "CONFIRM") {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            setConfirmIndex((prev) => (prev === 0 ? 1 : 0));
          } else if (e.key === "x" || e.key === "X") {
            setDialogType("");
            setDialogText("");
          } else if (e.key === "z" || e.key === "Z") {
            if (confirmIndex === 0) {
              const targetPokemon = partyData[partyIndex];

              const result = applyItemEffect(targetPokemon, usageItem);

              if (result.success) {
                //  포켓몬 피 채우고 저장
                const newPartyData = [...partyData];
                newPartyData[partyIndex] = {
                  ...targetPokemon,
                  currentHp: result.newHp,
                };
                setPartyData(newPartyData);
                sessionStorage.setItem(
                  "isMyPokemon",
                  JSON.stringify(newPartyData),
                );

                // 2) 가방에서 아이템 개수 -1 깎기 로직
                const currentBag = JSON.parse(sessionStorage.getItem("bag"));
                if (currentBag) {
                  for (const pocketCategory in currentBag) {
                    const itemInPocket = currentBag[pocketCategory].find(
                      (i) => i.id === usageItem.id,
                    );
                    if (itemInPocket && itemInPocket.count > 0) {
                      itemInPocket.count -= 1;
                      break;
                    }
                  }
                  sessionStorage.setItem("bag", JSON.stringify(currentBag));
                }

                setDialogType("RESULT");
                setDialogText(result.message);
              }
            } else {
              setDialogType("");
              setDialogText("");
            }
          }
        }
        return;
      }

      // [기존 유지] 자리 바꾸기 (Swap) 로직
      if (swapSource !== null) {
        if (e.key === "x" || e.key === "X") {
          setSwapSource(null);
          return;
        }
        if (e.key === "z" || e.key === "Z") {
          let newPartyData = [...partyData];
          let newPokeData = pokeData.map((box) => [...box]);

          const getPokemon = (loc) => {
            if (loc.area === "party") return newPartyData[loc.partyIndex] || {};
            const idx = loc.boxRow * (MAX_BOX_COL + 1) + loc.boxCol;
            return (newPokeData[loc.currentBox - 1] || [])[idx] || {};
          };
          const setPokemon = (loc, pokemon) => {
            if (loc.area === "party") {
              newPartyData[loc.partyIndex] = pokemon;
            } else {
              const idx = loc.boxRow * (MAX_BOX_COL + 1) + loc.boxCol;
              if (!newPokeData[loc.currentBox - 1])
                newPokeData[loc.currentBox - 1] = Array(30).fill({});
              newPokeData[loc.currentBox - 1][idx] = pokemon;
            }
          };

          const targetLoc = {
            area: currentArea,
            partyIndex,
            currentBox,
            boxRow,
            boxCol,
          };
          const sourcePokemon = getPokemon(swapSource);
          const targetPokemon = getPokemon(targetLoc);

          setPokemon(targetLoc, sourcePokemon);
          setPokemon(swapSource, targetPokemon);

          setPartyData(newPartyData);
          setPokeData(newPokeData);

          sessionStorage.setItem("isMyPokemon", JSON.stringify(newPartyData));
          sessionStorage.setItem(
            "pokemonBox",
            JSON.stringify(newPokeData.flat()),
          );

          setSwapSource(null);
          return;
        }
      }

      // 뒤로가기
      if (e.key === "x" || e.key === "X") {
        if (onClose)
          onClose(); // 모달일 땐 닫고
        else navigate(-1); // 단독 페이지일 땐 뒤로가기
        return;
      }

      // Z키
      // Z키
      if (e.key === "z" || e.key === "Z") {
        // 가방에서 아이템을 들고 왔을 때 (기력의조각 등을 써야 하므로 이건 통과시킴!)
        if (usageItem && currentArea === "party") {
          // ... (기존 아이템 로직 그대로 유지) ...
          const targetPokemon = partyData[partyIndex];
          if (!targetPokemon.name) return;

          const result = applyItemEffect(targetPokemon, usageItem);
          if (!result.success) {
            setDialogType("ERROR");
            setDialogText(result.message);
            return;
          }

          setDialogType("CONFIRM");
          setDialogText(
            `${targetPokemon.name}에게 ${usageItem.name}을(를)\n사용하시겠습니까?`,
          );
          setConfirmIndex(0);
          return;
        }

        // 🔥 일반 메뉴에서 진입했을 때 (아이템 없이 Z키를 눌렀을 때)
        const targetPokemon =
          currentArea === "party"
            ? partyData[partyIndex]
            : (pokeData[currentBox - 1] || [])[
                boxRow * (MAX_BOX_COL + 1) + boxCol
              ];

        // HP가 0이면 에러창을 띄우고 메뉴(순서바꾸기 등)를 못 열게 막아버림!
        if (targetPokemon?.name && targetPokemon.currentHp <= 0) {
          setDialogType("ERROR");
          setDialogText(
            `${targetPokemon.name}은(는) 기절해서\n명령을 들을 수 없다!`,
          );
          return;
        }

        // 살아있는 포켓몬만 정상적으로 박스 메뉴 열기
        setIsBoxMenuOpen(true);
        setBoxMenuIndex(0);
        return;
      }

      //  방향키 이동 로직
      if (currentArea === "party") {
        if (e.key === "ArrowDown")
          setPartyIndex((prev) => Math.min(prev + 1, MAX_PARTY));
        else if (e.key === "ArrowUp")
          setPartyIndex((prev) => Math.max(prev - 1, 0));
        else if (e.key === "ArrowRight") {
          setCurrentArea("box");
          setBoxCol(0);
          setBoxRow(Math.min(partyIndex, MAX_BOX_ROW));
        }
      } else if (currentArea === "box") {
        if (e.key === "ArrowDown")
          setBoxRow((prev) => Math.min(prev + 1, MAX_BOX_ROW));
        else if (e.key === "ArrowUp") {
          if (boxRow === 0) setCurrentArea("header");
          else setBoxRow((prev) => prev - 1);
        } else if (e.key === "ArrowRight") {
          if (boxCol === MAX_BOX_COL) {
            setBoxCol(0);
            setBoxRow((prev) => (prev === MAX_BOX_ROW ? 0 : prev + 1));
          } else setBoxCol((prev) => prev + 1);
        } else if (e.key === "ArrowLeft") {
          if (boxCol === 0) {
            setCurrentArea("party");
            setPartyIndex(Math.min(boxRow, MAX_PARTY));
          } else setBoxCol((prev) => prev - 1);
        }
      } else if (currentArea === "header") {
        if (e.key === "ArrowDown") {
          setCurrentArea("box");
          setBoxRow(0);
        } else if (e.key === "ArrowLeft") handlePrevBox();
        else if (e.key === "ArrowRight") handleNextBox();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentArea,
    partyIndex,
    boxRow,
    boxCol,
    onClose,
    usageItem,
    partyData,
    dialogType,
    confirmIndex,
    navigate,
    pokeData,
    currentBox,
    isBoxMenuOpen,
    boxMenuIndex,
    swapSource,
  ]);

  const focusedPokemon =
    currentArea === "party"
      ? partyData[partyIndex]
      : (pokeData[currentBox - 1] || [])[boxRow * (MAX_BOX_COL + 1) + boxCol];

  return (
    <div
      id="game-screen"
      className={styles["game-screen"]}
      style={{ position: "relative" }}
    >
      {/* 파티 영역 */}
      <div className={styles["party-area"]} id="party-container">
        {partyData.map((val, idx) => {
          const isSwapSource =
            swapSource?.area === "party" && swapSource.partyIndex === idx;
          return (
            <div
              key={`party-${idx}`}
              className={`${styles["party-slot"]} ${currentArea === "party" && partyIndex === idx ? styles.focused : ""} ${isSwapSource ? styles["swap-source"] : ""} ${val.name && val.currentHp <= 0 ? styles.fainted : ""}`}
            >
              {val.name && (
                <img
                  src={val.iconUrl}
                  alt={val.name}
                  className={styles["party-pokemon-img"]}
                />
              )}
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  flexDirection: "column",
                  fontFamily: "pokemon_font",
                  fontSize: "12px",
                  marinTop: "-2px",
                }}
              >
                {val.name && (
                  <span style={{ fontSize: "12px", marginBottom: "-2px" }}>
                    <span style={{ fontSize: "10px", color: "#555" }}>
                      Lv.{val.level}
                    </span>{" "}
                    <span style={{ fontWeight: "bold" }}>{val.name}</span>
                  </span>
                )}
                {val.name && (
                  <span>
                    <span style={{ fontSize: "10px", color: "#555" }}>
                      hp:{" "}
                    </span>
                    <span style={{ fontSize: "10px", color: "#555" }}>
                      {val.currentHp} / {val.maxHp}
                    </span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 박스 영역 */}
      <div className={styles["box-section"]}>
        <div
          className={`${styles["box-header"]} ${currentArea === "header" ? styles.focused : ""}`}
        >
          <div className={styles.arrow} onClick={handlePrevBox}>
            ◀
          </div>
          <div className={styles["box-title"]}>박스 {currentBox}</div>
          <div className={styles.arrow} onClick={handleNextBox}>
            ▶
          </div>
        </div>

        <div className={styles["box-area"]} id="box-container">
          {Array.from(
            { length: (MAX_BOX_ROW + 1) * (MAX_BOX_COL + 1) },
            (_, idx) => {
              const r = Math.floor(idx / (MAX_BOX_COL + 1));
              const c = idx % (MAX_BOX_COL + 1);
              const isFocused =
                currentArea === "box" && boxRow === r && boxCol === c;
              const isSwapSource =
                swapSource?.area === "box" &&
                swapSource.currentBox === currentBox &&
                swapSource.boxRow === r &&
                swapSource.boxCol === c;
              const val = (pokeData[currentBox - 1] || [])[idx];

              return (
                /* 박스안의 포켓몬들 애니메이션 */
                <div
                  key={`box-${idx}`}
                  className={`${styles["box-slot"]} ${isFocused ? styles.focused : ""} ${val?.name ? styles["occupied"] : ""} ${isSwapSource ? styles["swap-source"] : ""}`}
                >
                  {val?.name && (
                    <img
                      src={val.iconUrl}
                      alt={val.name}
                      className={styles["box-pokemon-img"]}
                    />
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>

      {}
      <div className={styles["details-section"]}>
        {focusedPokemon?.name ? (
          <div className={styles["details-content"]}>
            <img
              src={focusedPokemon.frontSprite || focusedPokemon.iconUrl}
              alt={focusedPokemon.name}
              className={styles["details-img"]}
            />
            <div className={styles["name-level-wrap"]}>
              <div className={styles["details-level"]}>
                Lv. {focusedPokemon.level}
              </div>
              <div className={styles["details-name"]}>
                {focusedPokemon.name}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
                gap: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "#555", // 글씨 색상도 살짝 게임처럼
                }}
              >
                Exp.
              </div>
              <div
                style={{
                  width: "180px",
                  height: "4px",
                  position: "relative",
                  backgroundColor: "lightgray",
                  borderRadius: "2px",
                }}
              >
                <div
                  style={{
                    width: `${(focusedPokemon.currentExp / focusedPokemon.needExp) * 100}%`,
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    backgroundColor: "skyblue",
                  }}
                ></div>
              </div>
            </div>
            {/*  타입 색상 적용 */}
            <div className={styles["details-types"]}>
              {focusedPokemon.types?.map((type, i) => (
                <span
                  key={i}
                  className={styles["type-badge"]}
                  style={{
                    backgroundColor:
                      TYPE_COLORS[type.toUpperCase()] || "#e0e0e0",
                  }}
                >
                  {type.toUpperCase()}
                </span>
              ))}
            </div>
            <div className={styles["moves-container"]}>
              <div className={styles["moves-title"]}>기술 배치</div>
              {focusedPokemon.moves && focusedPokemon.moves.length > 0 ? (
                focusedPokemon.moves.map((move, i) => (
                  <div key={i} className={styles["move-slot"]}>
                    <span className={styles["move-name"]}>{move.koName}</span>
                    <span>
                      {move.currentpp} / {move.maxpp}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: "14px", color: "#555" }}>
                  배운 기술이 없습니다.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles["empty-details"]}>Empty</div>
        )}
      </div>

      {/* 박스 액션 메뉴 */}
      {isBoxMenuOpen && (
        <div className={styles["box-action-menu"]}>
          <div className={styles["confirm-option"]}>
            <span className={styles["confirm-cursor"]}>
              {boxMenuIndex === 0 ? "▶" : ""}
            </span>
            <span>순서바꾸기</span>
          </div>
          <div className={styles["confirm-option"]}>
            <span className={styles["confirm-cursor"]}>
              {boxMenuIndex === 1 ? "▶" : ""}
            </span>
            <span>그만두기</span>
          </div>
        </div>
      )}

      {/* 메시지 다이얼로그 */}
      {dialogType !== "" && (
        <div className={styles["dialog-container"]}>
          <div style={{ whiteSpace: "pre-line" }}>{dialogText}</div>
          {dialogType === "CONFIRM" && (
            <div className={styles["confirm-box"]}>
              <div className={styles["confirm-option"]}>
                <span className={styles["confirm-cursor"]}>
                  {confirmIndex === 0 ? "▶" : ""}
                </span>
                <span>예</span>
              </div>
              <div className={styles["confirm-option"]}>
                <span className={styles["confirm-cursor"]}>
                  {confirmIndex === 1 ? "▶" : ""}
                </span>
                <span>아니오</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PokemonPage;
