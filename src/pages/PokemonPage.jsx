// /* eslint-disable no-unused-vars */
// import { useState, useEffect } from "react";
// import styles from "./pokemonpage.module.css";
// // 1. 더미 데이터 및 상수 정의
// const MAX_BOX_COUNT = 5;
// const MAX_PARTY = 5;
// const MAX_BOX_ROW = 4;
// const MAX_BOX_COL = 5;

// const boxData = {
//   1: [
//     "피카츄",
//     "파이리",
//     "이상해씨",
//     "꼬부기",
//     "구구",
//     "꼬렛",
//     "깨비참",
//     "아보",
//     "모래두지",
//     "니드란♀",
//     "니드란♂",
//     "삐삐",
//     "식스테일",
//     "푸린",
//     "주뱃",
//     "뚜벅쵸",
//   ],
//   2: [
//     "파라스",
//     "콘팡",
//     "디그다",
//     "나옹",
//     "고라파덕",
//     "망키",
//     "가디",
//     "발챙이",
//     "캐이시",
//     "알통몬",
//     "모다피",
//     "왕눈해",
//   ],
//   3: [
//     "뮤츠",
//     "뮤",
//     "프리져",
//     "썬더",
//     "파이어",
//     "망나뇽",
//     "잠만보",
//     "라프라스",
//     "메타몽",
//     "폴리곤",
//   ],
//   4: [
//     "치코리타",
//     "브케인",
//     "리아코",
//     "꼬리선",
//     "부우부",
//     "레디바",
//     "페이검",
//     "크로뱃",
//     "피츄",
//     "삐",
//     "푸푸린",
//     "토게피",
//     "네이티",
//     "메리프",
//     "마릴",
//     "꼬지모",
//   ],
//   5: [
//     "나무지기",
//     "아차모",
//     "물짱이",
//     "포챠나",
//     "지그제구리",
//     "개무소",
//     "연꽃몬",
//     "도토링",
//     "테일로",
//     "갈모매",
//     "랄토스",
//   ],
// };

// function App() {
//   // 2. 상태 관리 (State)
//   const [currentArea, setCurrentArea] = useState("party");
//   const [partyIndex, setPartyIndex] = useState(0);
//   const [boxRow, setBoxRow] = useState(0);
//   const [boxCol, setBoxCol] = useState(0);
//   const [currentBox, setCurrentBox] = useState(1);
//   const [pokemonBox, setPokemonBox] = useState([], [], [], [], []);

//   const [pokeData, setPokeData] = useState([]);
//   const [partyData, setPartyData] = useState([{}, {}, {}, {}, {}, {}]);
//   // [{..},{...}, {}, {}, {}, {}]

//   // 3. 박스 이동 함수
//   const handlePrevBox = () =>
//     setCurrentBox((prev) => (prev > 1 ? prev - 1 : MAX_BOX_COUNT));
//   const handleNextBox = () =>
//     setCurrentBox((prev) => (prev < MAX_BOX_COUNT ? prev + 1 : 1));

//   // 4. 키보드 네비게이션 이벤트 처리 (useEffect)
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
//         e.preventDefault();
//       }

//       // [A] 파티 영역 조작
//       if (currentArea === "party") {
//         if (e.key === "ArrowDown")
//           setPartyIndex((prev) => Math.min(prev + 1, MAX_PARTY));
//         else if (e.key === "ArrowUp")
//           setPartyIndex((prev) => Math.max(prev - 1, 0));
//         else if (e.key === "ArrowRight") {
//           setCurrentArea("box");
//           setBoxCol(0);
//           setBoxRow(Math.min(partyIndex, MAX_BOX_ROW));
//         }
//       }
//       // [B] 박스 영역 조작
//       else if (currentArea === "box") {
//         if (e.key === "ArrowDown") {
//           setBoxRow((prev) => Math.min(prev + 1, MAX_BOX_ROW));
//         } else if (e.key === "ArrowUp") {
//           if (boxRow === 0) {
//             setCurrentArea("header");
//           } else {
//             setBoxRow((prev) => prev - 1);
//           }
//         } else if (e.key === "ArrowRight") {
//           if (boxCol === MAX_BOX_COL) {
//             setBoxCol(0);
//             setBoxRow((prev) => (prev === MAX_BOX_ROW ? 0 : prev + 1));
//           } else {
//             setBoxCol((prev) => prev + 1);
//           }
//         } else if (e.key === "ArrowLeft") {
//           if (boxCol === 0) {
//             setCurrentArea("party");
//             setPartyIndex(Math.min(boxRow, MAX_PARTY));
//           } else {
//             setBoxCol((prev) => prev - 1);
//           }
//         }
//       }
//       // [C] 상단 헤더 탭 영역 조작
//       else if (currentArea === "header") {
//         if (e.key === "ArrowDown") {
//           setCurrentArea("box");
//           setBoxRow(0);
//         } else if (e.key === "ArrowLeft") {
//           handlePrevBox();
//         } else if (e.key === "ArrowRight") {
//           handleNextBox();
//         }
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [currentArea, partyIndex, boxRow, boxCol]);

//   useEffect(() => {
//     Promise.resolve().then(() => {
//       const storedData = sessionStorage.getItem("pokemonBox");

//       if (storedData) {
//         // try {
//           const data = JSON.parse(storedData);
//           console.log(data);
//           const allPokemon = data.data.pokemonBox;
//           setPokemonBox(allPokemon);

//           // 3. 박스 데이터 세팅

//           // 4. 파티 데이터 세팅
//           const serverParty = allPokemon.filter(
//             (pokemon) => pokemon.myPokemon === true,
//           );

//           // 5. 6칸 파티 배열 완성하기
//           const initialParty = [{}, {}, {}, {}, {}, {}];
//           const nextParty = initialParty.map((val, index) => {
//             return serverParty[index] ? serverParty[index] : val;
//           });

//           // 6. 상태 업데이트
//           setPartyData(nextParty);
//         }
//         // catch (error) {
//         //   console.error(
//         //     "세션 스토리지 데이터를 읽어오는 중 오류가 발생했습니다:",
//         //     error,
//         //   );
//         // }
//       // }
//     // });
//   }, []);

//   // 5. 렌더링
//   return (
//     <div id="game-screen">
//       {/* 파티 영역 */}
//       <div className={styles["party-area"]} id="party-container">
//         {/* {Array.from({ length: 6 }).map((_, idx) => (
//           <div
//             key={`party-${idx}`}
//             className={`${styles['party-slot']} ${
//               currentArea === "party" && partyIndex === idx ? styles.focused : ""
//             }`}
//           >
//             파티 {idx + 1}
//           </div>
//         ))} */}
//         {partyData.map((val, idx) => {
//           return (
//             <div
//               key={`party-${idx}`}
//               className={`${styles["party-slot"]} ${
//                 currentArea === "party" && partyIndex === idx
//                   ? styles.focused
//                   : ""
//               }`}
//             >
//               {val.name}
//             </div>
//           );
//         })}
//       </div>

//       {/* 박스 영역 */}
//       <div className={styles["box-section"]}>
//         {/* 헤더 */}
//         <div
//           className={`${styles["box-header"]} ${currentArea === "header" ? styles.focused : ""}`}
//         >
//           <span className={styles.arrow} onClick={handlePrevBox}>
//             ◀
//           </span>
//           <span className={styles["box-title"]}>박스 {currentBox}</span>
//           <span className={styles.arrow} onClick={handleNextBox}>
//             ▶
//           </span>
//         </div>

//         {/* 박스 슬롯 그리드 */}
//         <div className={styles["box-area"]} id="box-container">
//           {/* {Array.from({ length: 30 }).map((_, idx) => {
//             const r = Math.floor(idx / 6);
//             const c = idx % 6;
//             const isFocused =
//               currentArea === "box" && boxRow === r && boxCol === c;
//             const pokemonName = (boxData[currentBox] || [])[idx];

//             return (
//               <div
//                 key={`box-${idx}`}
//                 className={`${styles['box-slot']} ${isFocused ? styles.focused : ""}`}
//                 style={
//                   pokemonName
//                     ? {
//                         backgroundColor: "#ffd54f",
//                         display: "flex",
//                         justifyContent: "center",
//                         alignItems: "center",
//                         fontWeight: "bold",
//                         fontSize: "0.9rem",
//                       }
//                     : { backgroundColor: "white" }
//                 }
//               >
//                 {pokemonName || ""}
//               </div>
//             );
//           })} */}
//           {pokeData.map((val, idx) => {
//             console.log(val);
//             const r = Math.floor(idx / 6);
//             const c = idx % 6;
//             const isFocused =
//               currentArea === "box" && boxRow === r && boxCol === c;
//             const pokemonName = (boxData[currentBox] || [])[idx];

//             return (
//               <div
//                 key={`box-${idx}`}
//                 className={`${styles["box-slot"]} ${isFocused ? styles.focused : ""}`}
//                 style={
//                   val.name
//                     ? {
//                         backgroundColor: "#ffd54f",
//                         display: "flex",
//                         justifyContent: "center",
//                         alignItems: "center",
//                         fontWeight: "bold",
//                         fontSize: "0.9rem",
//                       }
//                     : { backgroundColor: "white" }
//                 }
//               >
//                 {val.name || ""}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }
// }

// export default App;
