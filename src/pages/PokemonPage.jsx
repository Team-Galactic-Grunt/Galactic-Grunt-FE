<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
>>>>>>> Stashed changes
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import styles from './pokemonPage.module.css';
// 1. 더미 데이터 및 상수 정의
const MAX_BOX_COUNT = 5;
const MAX_PARTY = 5;
const MAX_BOX_ROW = 4;
const MAX_BOX_COL = 5;

const boxData = {
  1: [
    '피카츄',
    '파이리',
    '이상해씨',
    '꼬부기',
    '구구',
    '꼬렛',
    '깨비참',
    '아보',
    '모래두지',
    '니드란♀',
    '니드란♂',
    '삐삐',
    '식스테일',
    '푸린',
    '주뱃',
    '뚜벅쵸',
  ],
  2: [
    '파라스',
    '콘팡',
    '디그다',
    '나옹',
    '고라파덕',
    '망키',
    '가디',
    '발챙이',
    '캐이시',
    '알통몬',
    '모다피',
    '왕눈해',
  ],
  3: [
    '뮤츠',
    '뮤',
    '프리져',
    '썬더',
    '파이어',
    '망나뇽',
    '잠만보',
    '라프라스',
    '메타몽',
    '폴리곤',
  ],
  4: [
    '치코리타',
    '브케인',
    '리아코',
    '꼬리선',
    '부우부',
    '레디바',
    '페이검',
    '크로뱃',
    '피츄',
    '삐',
    '푸푸린',
    '토게피',
    '네이티',
    '메리프',
    '마릴',
    '꼬지모',
  ],
  5: [
    '나무지기',
    '아차모',
    '물짱이',
    '포챠나',
    '지그제구리',
    '개무소',
    '연꽃몬',
    '도토링',
    '테일로',
    '갈모매',
    '랄토스',
  ],
};

function App() {
  // 2. 상태 관리 (State)
  const [currentArea, setCurrentArea] = useState('party');
  const [partyIndex, setPartyIndex] = useState(0);
  const [boxRow, setBoxRow] = useState(0);
  const [boxCol, setBoxCol] = useState(0);
  const [currentBox, setCurrentBox] = useState(1);
  // const [pokemonBox, setPokemonBox] = useState([], [], [], [], []);

  const [pokeData, setPokeData] = useState(() => {
    const storedBox = sessionStorage.getItem('pokemonBox');
    const pokemon = storedBox ? JSON.parse(storedBox) : [];

    if (pokemon.length > 0) {
      console.log(pokemon);
      let initialPokemon = [[], [], [], [], []];

      let idx = 30;

      for (let i = 0; i < Math.floor(pokemon.length / 5); i++) {
        initialPokemon[i] = pokemon.slice(idx - 30, idx);
        idx += 30;
      }
      console.log('result : ', initialPokemon);
      return initialPokemon;
    }
    return [[], [], [], [], []];
  });

  const [partyData, setPartyData] = useState(() => {
    const storedParty = sessionStorage.getItem('isMyPokemon');
    const party = storedParty ? JSON.parse(storedParty) : [];
    if (party.length > 0) {
      console.log(party);
      const initialParty = [{}, {}, {}, {}, {}, {}];
      return initialParty.map((val, index) =>
        party[index] ? party[index] : val,
      );
    }
    alert('정상적인 접근이 아닙니다.');
    return [{}, {}, {}, {}, {}, {}];
  });

  // 3. 박스 이동 함수
  const handlePrevBox = () =>
    setCurrentBox((prev) => (prev > 1 ? prev - 1 : MAX_BOX_COUNT));
  const handleNextBox = () =>
    setCurrentBox((prev) => (prev < MAX_BOX_COUNT ? prev + 1 : 1));

  // 4. 키보드 네비게이션 이벤트 처리 (useEffect)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      // [A] 파티 영역 조작
      if (currentArea === 'party') {
        if (e.key === 'ArrowDown')
          setPartyIndex((prev) => Math.min(prev + 1, MAX_PARTY));
        else if (e.key === 'ArrowUp')
          setPartyIndex((prev) => Math.max(prev - 1, 0));
        else if (e.key === 'ArrowRight') {
          setCurrentArea('box');
          setBoxCol(0);
          setBoxRow(Math.min(partyIndex, MAX_BOX_ROW));
        }
      }
      // [B] 박스 영역 조작
      else if (currentArea === 'box') {
        if (e.key === 'ArrowDown') {
          setBoxRow((prev) => Math.min(prev + 1, MAX_BOX_ROW));
        } else if (e.key === 'ArrowUp') {
          if (boxRow === 0) {
            setCurrentArea('header');
          } else {
            setBoxRow((prev) => prev - 1);
          }
        } else if (e.key === 'ArrowRight') {
          if (boxCol === MAX_BOX_COL) {
            setBoxCol(0);
            setBoxRow((prev) => (prev === MAX_BOX_ROW ? 0 : prev + 1));
          } else {
            setBoxCol((prev) => prev + 1);
          }
        } else if (e.key === 'ArrowLeft') {
          if (boxCol === 0) {
            setCurrentArea('party');
            setPartyIndex(Math.min(boxRow, MAX_PARTY));
          } else {
            setBoxCol((prev) => prev - 1);
          }
        }
      }
      // [C] 상단 헤더 탭 영역 조작
      else if (currentArea === 'header') {
        if (e.key === 'ArrowDown') {
          setCurrentArea('box');
          setBoxRow(0);
        } else if (e.key === 'ArrowLeft') {
          handlePrevBox();
        } else if (e.key === 'ArrowRight') {
          handleNextBox();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentArea, partyIndex, boxRow, boxCol]);

  //

  // 5. 렌더링
  return (
    <div id='game-screen' className={styles['game-screen']}>
      {/* 파티 영역 */}
      <div className={styles['party-area']} id='party-container'>
        {partyData.map((val, idx) => {
          return (
            <div
              key={`party-${idx}`}
              className={`${styles['party-slot']} ${
                currentArea === 'party' && partyIndex === idx
                  ? styles.focused
                  : ''
              }`}
            >
              {val.name}
              {val.name && (
                <div>
                  hp: {val.currentHp} / {val.maxHp}
                </div>
              )}
              {val.name && <div>lv. {val.level}</div>}
            </div>
          );
        })}
      </div>

      {/* 박스 영역 */}
      <div className={styles['box-section']}>
        {/* 헤더 */}
        <div
          className={`${styles['box-header']} ${currentArea === 'header' ? styles.focused : ''}`}
        >
          <span className={styles.arrow} onClick={handlePrevBox}>
            ◀
          </span>
          <span className={styles['box-title']}>박스 {currentBox}</span>
          <span className={styles.arrow} onClick={handleNextBox}>
            ▶
          </span>
        </div>

        {/* 박스 슬롯 그리드 */}
        <div className={styles['box-area']} id='box-container'>
          {Array.from(
            { length: (MAX_BOX_ROW + 1) * (MAX_BOX_COL + 1) },
            (_, idx) => {
              const r = Math.floor(idx / (MAX_BOX_COL + 1));
              const c = idx % (MAX_BOX_COL + 1);
              const isFocused =
                currentArea === 'box' && boxRow === r && boxCol === c;
              const val = (pokeData[currentBox - 1] || [])[idx];
              return (
                <div
                  key={`box-${idx}`}
                  className={`${styles['box-slot']} ${isFocused ? styles.focused : ''} ${val?.name ? styles['occupied'] : ''}`}
                  style={
                    val?.name ? { backgroundImage: `url(${val.iconUrl})` } : {}
                  }
                />
              );
            },
          )}
        </div>
      </div>

      <div>포켓몬 상세 박스</div>
    </div>
  );
}

<<<<<<< Updated upstream
=======
=======
import { useState, useEffect } from "react";
import styles from "./pokemonpage.module.css";

// 1. 더미 데이터 및 상수 정의
const MAX_BOX_COUNT = 5;
const MAX_PARTY = 5;
const MAX_BOX_ROW = 4;
const MAX_BOX_COL = 5;

const boxData = {
  1: [
    "피카츄",
    "파이리",
    "이상해씨",
    "꼬부기",
    "구구",
    "꼬렛",
    "깨비참",
    "아보",
    "모래두지",
    "니드란♀",
    "니드란♂",
    "삐삐",
    "식스테일",
    "푸린",
    "주뱃",
    "뚜벅쵸",
  ],
  2: [
    "파라스",
    "콘팡",
    "디그다",
    "나옹",
    "고라파덕",
    "망키",
    "가디",
    "발챙이",
    "캐이시",
    "알통몬",
    "모다피",
    "왕눈해",
  ],
  3: [
    "뮤츠",
    "뮤",
    "프리져",
    "썬더",
    "파이어",
    "망나뇽",
    "잠만보",
    "라프라스",
    "메타몽",
    "폴리곤",
  ],
  4: [
    "치코리타",
    "브케인",
    "리아코",
    "꼬리선",
    "부우부",
    "레디바",
    "페이검",
    "크로뱃",
    "피츄",
    "삐",
    "푸푸린",
    "토게피",
    "네이티",
    "메리프",
    "마릴",
    "꼬지모",
  ],
  5: [
    "나무지기",
    "아차모",
    "물짱이",
    "포챠나",
    "지그제구리",
    "개무소",
    "연꽃몬",
    "도토링",
    "테일로",
    "갈모매",
    "랄토스",
  ],
};

function App() {
  // 2. 상태 관리 (State)
  const [currentArea, setCurrentArea] = useState("party");
  const [partyIndex, setPartyIndex] = useState(0);
  const [boxRow, setBoxRow] = useState(0);
  const [boxCol, setBoxCol] = useState(0);
  const [currentBox, setCurrentBox] = useState(1);

  // 🚨 수정 포인트: useState([], [], ...) 처럼 여러 개 넣으면 에러가 납니다! 빈 배열 하나로 수정
  const [pokemonBox, setPokemonBox] = useState([]);
  const [pokeData, setPokeData] = useState([]);
  const [partyData, setPartyData] = useState([{}, {}, {}, {}, {}, {}]);

  // 3. 박스 이동 함수
  const handlePrevBox = () =>
    setCurrentBox((prev) => (prev > 1 ? prev - 1 : MAX_BOX_COUNT));
  const handleNextBox = () =>
    setCurrentBox((prev) => (prev < MAX_BOX_COUNT ? prev + 1 : 1));

  // 4. 키보드 네비게이션 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      // [A] 파티 영역 조작
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
      }
      // [B] 박스 영역 조작
      else if (currentArea === "box") {
        if (e.key === "ArrowDown") {
          setBoxRow((prev) => Math.min(prev + 1, MAX_BOX_ROW));
        } else if (e.key === "ArrowUp") {
          if (boxRow === 0) {
            setCurrentArea("header");
          } else {
            setBoxRow((prev) => prev - 1);
          }
        } else if (e.key === "ArrowRight") {
          if (boxCol === MAX_BOX_COL) {
            setBoxCol(0);
            setBoxRow((prev) => (prev === MAX_BOX_ROW ? 0 : prev + 1));
          } else {
            setBoxCol((prev) => prev + 1);
          }
        } else if (e.key === "ArrowLeft") {
          if (boxCol === 0) {
            setCurrentArea("party");
            setPartyIndex(Math.min(boxRow, MAX_PARTY));
          } else {
            setBoxCol((prev) => prev - 1);
          }
        }
      }
      // [C] 상단 헤더 탭 영역 조작
      else if (currentArea === "header") {
        if (e.key === "ArrowDown") {
          setCurrentArea("box");
          setBoxRow(0);
        } else if (e.key === "ArrowLeft") {
          handlePrevBox();
        } else if (e.key === "ArrowRight") {
          handleNextBox();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentArea, partyIndex, boxRow, boxCol]);

  // 🚨 수정 포인트: 괄호가 꼬여있던 try-catch문과 불필요한 Promise.resolve 래핑을 깔끔하게 정리했습니다.
  useEffect(() => {
    const storedData = sessionStorage.getItem("pokemonBox");

    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        // data.data.pokemonBox가 없을 경우를 대비해 기본값([]) 빈 배열 처리
        const allPokemon = data?.data?.pokemonBox || [];
        // setPokemonBox(allPokemon);
        // setPokeData(allPokemon);

        const serverParty = allPokemon.filter(
          (pokemon) => pokemon.myPokemon === true,
        );

        const initialParty = [{}, {}, {}, {}, {}, {}];
        const nextParty = initialParty.map((val, index) => {
          return serverParty[index] ? serverParty[index] : val;
        });

        // setPartyData(nextParty);
      } catch (error) {
        console.error(
          "세션 스토리지 데이터를 읽어오는 중 오류가 발생했습니다:",
          error,
        );
      }
    }
  }, []);

  return (
    <div id="game-screen">
      {/* 파티 영역 */}
      <div className={styles["party-area"]} id="party-container">
        {partyData.map((val, idx) => {
          return (
            <div
              key={`party-${idx}`}
              className={`${styles["party-slot"]} ${
                currentArea === "party" && partyIndex === idx
                  ? styles.focused
                  : ""
              }`}
            >
              {val.name || `파티 ${idx + 1}`}{" "}
              {/* 🚨 수정 포인트: 데이터가 없어도 기본 글씨가 보이게 수정 */}
            </div>
          );
        })}
      </div>

      {/* 박스 영역 */}
      <div className={styles["box-section"]}>
        {/* 헤더 */}
        <div
          className={`${styles["box-header"]} ${currentArea === "header" ? styles.focused : ""}`}
        >
          <span className={styles.arrow} onClick={handlePrevBox}>
            ◀
          </span>
          <span className={styles["box-title"]}>박스 {currentBox}</span>
          <span className={styles.arrow} onClick={handleNextBox}>
            ▶
          </span>
        </div>

        {/* 박스 슬롯 그리드 */}
        <div className={styles["box-area"]} id="box-container">
          {/* 🚨 수정 포인트: pokeData.map으로 돌리면 빈 배열일 때 그리드가 아예 안 그려지는 문제 해결. 
               무조건 30칸을 그리도록 Array.from({length: 30})을 사용하고 안에서 값을 찾습니다. */}
          {Array.from({ length: 30 }).map((_, idx) => {
            const r = Math.floor(idx / 6);
            const c = idx % 6;
            const isFocused =
              currentArea === "box" && boxRow === r && boxCol === c;

            // 세션스토리지에 데이터가 있으면 그걸 쓰고, 없으면 하드코딩된 boxData를 사용
            const pokemonName =
              pokeData[idx]?.name || (boxData[currentBox] || [])[idx];

            return (
              <div
                key={`box-${idx}`}
                className={`${styles["box-slot"]} ${isFocused ? styles.focused : ""}`}
                style={
                  pokemonName
                    ? {
                        backgroundColor: "#ffd54f",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                      }
                    : { backgroundColor: "white" }
                }
              >
                {pokemonName || ""}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

>>>>>>> Stashed changes
>>>>>>> Stashed changes
export default App;
