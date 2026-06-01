import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { postReport } from '../api/postReport';
import { useBgm } from '../context/BgmContext';
import { battleBgm, mainBgm } from '../assets/bgm';
import mainMapUrl from '/src/assets/images/main_map.png';
import styles from './mapPage.module.css';
import BattleTransition from '../components/animation/BattleTransition';

// --- 상수 ---
const SCALE = 0.3;
const TILE = 24;
const SPEED = 2.2;
const HOLD_THRESHOLD_MS = 100;
const BUMP_FRAMES = Math.ceil(TILE / SPEED);
const COLS = Math.floor(1080 / TILE);
const ROWS = Math.floor(720 / TILE);
const WALK_CYCLE = ['right', 'idle', 'left', 'idle'];

// --- 맵 데이터 ---
const obstacles = [
  { c: 0, r: 0, w: 4, h: 100 },
  { c: 0, r: 0, w: 36, h: 2 },
  { c: 0, r: 2, w: 35, h: 1 },
  { c: 0, r: 3, w: 24, h: 1 },
  { c: 0, r: 4, w: 24, h: 4 },
  { c: 22, r: 8, w: 5, h: 2 },
  { c: 29, r: 8, w: 4, h: 2 },
  { c: 33, r: 2, w: 2, h: 8 },
  { c: 14, r: 9, w: 8, h: 1 },
  { c: 27, r: 23, w: 2, h: 2 },
  { c: 22, r: 19, w: 1, h: 2 },
  { c: 37, r: 17, w: 1, h: 8 },
  { c: 16, r: 21, w: 7, h: 4 },
  { c: 4, r: 25, w: 34, h: 5 },
  { c: 22, r: 19, w: 10, h: 1 },
  { c: 31, r: 18, w: 1, h: 1 },
  { c: 31, r: 17, w: 2, h: 1 },
  { c: 35, r: 17, w: 2, h: 1 },
  { c: 37, r: 0, w: 1, h: 5 },
  { c: 38, r: 0, w: 1, h: 6 },
  { c: 39, r: 0, w: 1, h: 7 },
  { c: 40, r: 0, w: 1, h: 18 },
  { c: 41, r: 0, w: 1, h: 19 },
  { c: 42, r: 0, w: 1, h: 23 },
  { c: 43, r: 0, w: 2, h: 30 },
];

const zones = {
  grass1: [
    { c: 4, r: 8, w: 10, h: 2 },
    { c: 4, r: 10, w: 8, h: 4 },
    { c: 4, r: 14, w: 6, h: 2 },
  ],
  grass2: [
    { c: 18, r: 13, w: 5, h: 1 },
    { c: 16, r: 14, w: 9, h: 1 },
    { c: 15, r: 15, w: 11, h: 4 },
  ],
  snow: [
    { c: 26, r: 3, w: 7, h: 1 },
    { c: 24, r: 4, w: 9, h: 2 },
    { c: 24, r: 6, w: 6, h: 1 },
    { c: 32, r: 6, w: 1, h: 1 },
    { c: 24, r: 7, w: 2, h: 1 },
    { c: 30, r: 7, w: 3, h: 1 },
  ],
  sea: [
    { c: 31, r: 11, w: 3, h: 1 },
    { c: 31, r: 12, w: 5, h: 2 },
    { c: 4, r: 20, w: 8, h: 1 },
    { c: 4, r: 21, w: 11, h: 4 },
  ],
  cave: [
    { c: 33, r: 19, w: 3, h: 1 },
    { c: 27, r: 20, w: 9, h: 1 },
    { c: 25, r: 21, w: 11, h: 1 },
    { c: 23, r: 22, w: 13, h: 1 },
    { c: 23, r: 23, w: 4, h: 2 },
    { c: 29, r: 23, w: 7, h: 2 },
  ],
};

const spriteMap = {
  front: {
    idle: 'dawn_front',
    left: 'dawn_front_left',
    right: 'dawn_front_right',
  },
  back: { idle: 'dawn_back', left: 'dawn_back_left', right: 'dawn_back_right' },
  left: { idle: 'dawn_left', left: 'dawn_left_left', right: 'dawn_left_right' },
  right: {
    idle: 'dawn_right',
    left: 'dawn_right_left',
    right: 'dawn_right_right',
  },
};

const MENU_ITEMS = ['포켓몬', '도감', '가방', '레포트', '???', '닫는다'];

// 아이템 획득(count:1) + 포덱스 미포획(catch:false) 조건 충족 시 조우할 전설 포켓몬
const ITEM_TO_LEGENDARY = {
  금강옥: 483, // 디아루가
  백옥: 484, // 펄기아
  백금옥: 487, // 기라티나
  '천계의 피리': 493, // 아르세우스
};

// 맵에 배치할 중요 아이템 타일: { c, r, name } — name은 bag.important 아이템 이름과 일치해야 함
const ITEM_TILES = [
  { c: 4, r: 24, name: '금강옥' },
  { c: 38, r: 28, name: '백옥' },
  { c: 24, r: 3, name: '백금옥' },
  { c: 21, r: 8, name: '천계의 피리' },
];

// --- 유틸리티 ---
function zoneToCells(zone) {
  const cells = [];
  for (const rect of zone) {
    for (let r = rect.r; r < rect.r + rect.h; r++) {
      for (let c = rect.c; c < rect.c + rect.w; c++) {
        cells.push(`${c},${r}`);
      }
    }
  }
  return cells;
}

function pickRandom(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return new Set(copy.slice(0, Math.min(n, copy.length)));
}

function roundPos(val) {
  return Math.round(val * 10) / 10;
}

function isBlocked(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return true;
  return obstacles.some(
    (o) => col >= o.c && col < o.c + o.w && row >= o.r && row < o.r + o.h,
  );
}

// 파일 시작
export default function MapPage() {
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const mapImgRef = useRef(new Image());
  const imagesRef = useRef({});
  const playerRef = useRef(null); // useEffect에서 초기화
  const keysRef = useRef({});
  const eventTileMapRef = useRef(new Map());
  const itemTileMapRef = useRef(new Map());
  // 아이템 위치 → 전설 조우 정보 (아이템 획득 후에도 유지)
  const legendaryTileMapRef = useRef(new Map());
  const loopRunningRef = useRef(false);
  const fadeStateRef = useRef(null);

  const { play, stop } = useBgm();
  const transitionRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuOpenRef = useRef(false);
  const [menuIndex, setMenuIndex] = useState(0);
  const menuIndexRef = useRef(0);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const reportModalOpenRef = useRef(false);

  const [secretModalOpen, setSecretModalOpen] = useState(false);
  const secretModalOpenRef = useRef(false);

  const [saveToast, setSaveToast] = useState(false);
  const [itemToast, setItemToast] = useState(null);

  const position = sessionStorage.getItem('position')
    ? JSON.parse(sessionStorage.getItem('position'))
    : null;
  const bag = sessionStorage.getItem('bag')
    ? JSON.parse(sessionStorage.getItem('bag'))
    : null;

  const isMyPokemon = sessionStorage.getItem('isMyPokemon')
    ? JSON.parse(sessionStorage.getItem('isMyPokemon'))
    : null;
  const pokemonBox = sessionStorage.getItem('pokemonBox')
    ? JSON.parse(sessionStorage.getItem('pokemonBox'))
    : null;

  useEffect(() => {
    if (
      position === null ||
      bag === null ||
      isMyPokemon === null ||
      pokemonBox === null
    ) {
      console.log('필요한 데이터가 없습니다. 홈으로 이동합니다.');
      navigate('/'); // 필요한 데이터가 없으면 홈으로 이동
    }
    sessionStorage.setItem('status', 'false');
    play(mainBgm);

    // let timer = 0;
    // const intervalId = setInterval(() => {
    //   timer++;
    //   console.log(timer);
    // }, 1000);

    // 맵 이미지 로드
    mapImgRef.current.src = mainMapUrl;

    // 스프라이트 이미지 로드
    Object.values(spriteMap).forEach((dir) => {
      Object.values(dir).forEach((name) => {
        if (!imagesRef.current[name]) {
          const img = new Image();
          img.src = `/src/assets/images/character_images/${name}.png`;
          imagesRef.current[name] = img;
        }
      });
    });

    if (!imagesRef.current['monsterball']) {
      const img = new Image();
      img.src = '/src/assets/images/bag_images/monsterball.png';
      imagesRef.current['monsterball'] = img;
    }

    // 인카운터 이벤트 맵 생성
    const EVENT_COUNT = 12;
    Object.entries(zones).forEach(([zoneName, zoneData]) => {
      const selected = pickRandom(zoneToCells(zoneData), EVENT_COUNT);
      selected.forEach((key) => eventTileMapRef.current.set(key, zoneName));
    });

    // 중요 아이템 타일 등록
    // - bag.important에 있고 count === 0인 아이템만 맵에 표시
    // - 장애물 위에 놓이면 Z를 눌러도 닿을 수 없으므로 경고 출력
    // - 좌표가 겹치면 마지막 항목만 등록되므로 ITEM_TILES 좌표는 고유해야 함
    const savedBag = JSON.parse(sessionStorage.getItem('bag') || '{}');
    const importantItems = savedBag.important ?? [];
    console.log('[ITEM] bag.important 전체:', importantItems);
    ITEM_TILES.forEach(({ c, r, name }) => {
      if (isBlocked(c, r)) {
        // 장애물 타일에 아이템을 배치하면 플레이어가 Z로 닿을 수 없음
        console.warn(
          `[ITEM] '${name}' 좌표(col=${c}, row=${r})가 장애물 위에 있음`,
        );
      }
      const item = importantItems.find((i) => i.name === name);
      if (!item) {
        // ITEM_TILES의 name이 bag.important의 이름과 불일치
        console.warn(`[ITEM] '${name}' 이(가) bag.important에 없음`);
        return;
      }
      if (item.count === 0) {
        itemTileMapRef.current.set(`${c},${r}`, name);
        console.log(`[ITEM] '${name}' 등록 완료: col=${c}, row=${r}`);
      } else {
        // count >= 1 → 이미 획득한 아이템, 표시하지 않음
        console.log(`[ITEM] '${name}' 이미 획득됨 (count=${item.count})`);
      }
      // 전설 포켓몬과 연결된 아이템 타일은 아이템 획득 여부와 무관하게 항상 등록
      const pokemonId = ITEM_TO_LEGENDARY[name];
      if (item && pokemonId) {
        legendaryTileMapRef.current.set(`${c},${r}`, {
          itemName: name,
          pokemonId,
        });
      }
    });

    // 초기 위치 계산
    const startCol = Math.round(1080 / 2 / TILE);
    const startRow = Math.round(720 / 2 / TILE);
    const startX = startCol * TILE + TILE / 2;
    const startY = startRow * TILE + TILE / 2;

    let initX = startX,
      initY = startY,
      initDir = 'front';
    try {
      const saved = sessionStorage.getItem('position');
      if (saved) {
        const { x, y, direction } = JSON.parse(saved);
        console.log(`initX : ${x}, initY : ${y}, direction : ${direction}`);
        const validDirs = ['front', 'back', 'left', 'right'];
        if (
          typeof x === 'number' &&
          typeof y === 'number' &&
          isFinite(x) &&
          isFinite(y) &&
          x >= 0 &&
          x <= 1080 &&
          y >= 0 &&
          y <= 720
        ) {
          initX = x;
          initY = y;
          initDir = validDirs.includes(direction) ? direction : 'front';
        }
      }
    } catch (e) {
      console.error('세이브 로드 실패', e);
    }

    playerRef.current = {
      x: initX,
      y: initY,
      targetX: initX,
      targetY: initY,
      direction: initDir,
      isMoving: false,
      isBumping: false,
      bumpTimer: 0,
      cycleIndex: 0,
      currentFrame: 'idle',
      holdStartTime: 0,
      activeDirection: null,
    };

    // 키보드 이벤트
    const handleKeyDown = async (e) => {
      if (!e.repeat) keysRef.current[e.key] = true;

      if (secretModalOpenRef.current) {
        if (e.code === 'KeyZ') {
          secretModalOpenRef.current = false;
          setSecretModalOpen(false);
          sessionStorage.setItem(
            'position',
            JSON.stringify({
              x: playerRef.current.x,
              y: playerRef.current.y,
              direction: playerRef.current.direction,
            }),
          );

          // bag.important count:1 + pokedex catch:false 조건을 만족하는 첫 번째 전설 포켓몬 ID
          const currentBag = JSON.parse(sessionStorage.getItem('bag') || '{}');
          const currentPokedex = JSON.parse(
            sessionStorage.getItem('pokedex') || '[]',
          );
          const id =
            Object.entries(ITEM_TO_LEGENDARY).find(([itemName, pokemonId]) => {
              const item = (currentBag.important ?? []).find(
                (i) => i.name === itemName,
              );
              const dexEntry = currentPokedex.find((p) => p.id === pokemonId);
              return item?.count === 1 && dexEntry?.catch === false;
            })?.[1] ?? null;
          stop();
          navigate('/secret', { state: { id } });
        } else if (e.code === 'KeyX') {
          secretModalOpenRef.current = false;
          setSecretModalOpen(false);
        }
        e.preventDefault();
        return;
      }

      if (reportModalOpenRef.current) {
        if (e.code === 'KeyZ') {
          // const position = JSON.parse(sessionStorage.getItem('position') || '{}');
          // const bag = JSON.parse(sessionStorage.getItem('bag') || '[]');
          // const isMyPokemon = JSON.parse(sessionStorage.getItem('isMyPokemon') || '[]');
          // const pokemonBox = JSON.parse(sessionStorage.getItem('pokemonBox') || '[]');
          const result = await postReport({
            position: {
              x: playerRef.current.x,
              y: playerRef.current.y,
              direction: playerRef.current.direction,
            },
            bag,
            isMyPokemon,
            pokemonBox,
          });
          console.log(result);
          if (result.ok === true) {
            setSaveToast(true);
            setTimeout(() => setSaveToast(false), 1000);
          }
          reportModalOpenRef.current = false;
          setReportModalOpen(false);
        } else if (e.code === 'KeyX') {
          reportModalOpenRef.current = false;
          setReportModalOpen(false);
        }
        e.preventDefault();
        return;
      }

      if (menuOpenRef.current) {
        if (e.key === 'ArrowUp') {
          const next =
            (menuIndexRef.current - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
          menuIndexRef.current = next;
          setMenuIndex(next);
        } else if (e.key === 'ArrowDown') {
          const next = (menuIndexRef.current + 1) % MENU_ITEMS.length;
          menuIndexRef.current = next;
          setMenuIndex(next);
        } else if (e.code === 'KeyZ') {
          console.log('선택:', MENU_ITEMS[menuIndexRef.current]);
          if (MENU_ITEMS[menuIndexRef.current] === '닫는다') {
            menuOpenRef.current = false;
            setMenuOpen(false);
            menuIndexRef.current = 0;
            setMenuIndex(0);
          } else if (MENU_ITEMS[menuIndexRef.current] === '포켓몬') {
            sessionStorage.setItem(
              'position',
              JSON.stringify({
                x: playerRef.current.x,
                y: playerRef.current.y,
                direction: playerRef.current.direction,
              }),
            );
            navigate('/pokemon');

            console.log('맵 이동');
          } else if (MENU_ITEMS[menuIndexRef.current] === '도감') {
            sessionStorage.setItem(
              'position',
              JSON.stringify({
                x: playerRef.current.x,
                y: playerRef.current.y,
                direction: playerRef.current.direction,
              }),
            );
            navigate('/pokedex');
          } else if (MENU_ITEMS[menuIndexRef.current] === '가방') {
            sessionStorage.setItem(
              'position',
              JSON.stringify({
                x: playerRef.current.x,
                y: playerRef.current.y,
                direction: playerRef.current.direction,
              }),
            );
            navigate('/bag');
          } else if (MENU_ITEMS[menuIndexRef.current] === '레포트') {
            menuOpenRef.current = false;
            setMenuOpen(false);
            reportModalOpenRef.current = true;
            setReportModalOpen(true);
          } else if (MENU_ITEMS[menuIndexRef.current] === '???') {
            menuOpenRef.current = false;
            setMenuOpen(false);
            sessionStorage.setItem(
              'position',
              JSON.stringify({
                x: playerRef.current.x,
                y: playerRef.current.y,
                direction: playerRef.current.direction,
              }),
            );
            secretModalOpenRef.current = true;
            setSecretModalOpen(true);
          }
        } else if (e.code === 'KeyX') {
          menuOpenRef.current = false;
          setMenuOpen(false);
          menuIndexRef.current = 0;
          setMenuIndex(0);
        }
        e.preventDefault();
        return;
      }

      // Z키: 플레이어 현재 타일 또는 바라보는 방향 타일에 아이템이 있으면 획득
      if (e.code === 'KeyZ') {
        const player = playerRef.current;
        const col = Math.floor(player.x / TILE);
        const row = Math.floor(player.y / TILE);
        const facingDeltas = {
          front: [0, 1],
          back: [0, -1],
          left: [-1, 0],
          right: [1, 0],
        };
        const [dc, dr] = facingDeltas[player.direction];
        // 바라보는 방향 타일 우선, 없으면 현재 서 있는 타일 확인
        const checkKeys = [`${col + dc},${row + dr}`, `${col},${row}`];
        for (const key of checkKeys) {
          if (itemTileMapRef.current.has(key)) {
            const itemName = itemTileMapRef.current.get(key);
            itemTileMapRef.current.delete(key);
            const currentBag = JSON.parse(
              sessionStorage.getItem('bag') || '{}',
            );
            const updatedImportant = (currentBag.important ?? []).map((i) =>
              i.name === itemName ? { ...i, count: i.count + 1 } : i,
            );
            sessionStorage.setItem(
              'bag',
              JSON.stringify({ ...currentBag, important: updatedImportant }),
            );
            setItemToast(itemName);
            setTimeout(() => setItemToast(null), 2000);
            break;
          }

          // 아이템은 이미 획득했지만 전설 조우 조건 충족 시 배틀 시작
          if (legendaryTileMapRef.current.has(key)) {
            const { itemName, pokemonId } =
              legendaryTileMapRef.current.get(key);
            const currentBag = JSON.parse(
              sessionStorage.getItem('bag') || '{}',
            );
            const item = (currentBag.important ?? []).find(
              (i) => i.name === itemName,
            );
            const pokedex = JSON.parse(
              sessionStorage.getItem('pokedex') || '[]',
            );
            const dexEntry = pokedex.find((p) => p.id === pokemonId);

            // 아이템 획득(count:1)이고 아직 포획 안 한 경우에만 조우
            if (item?.count === 1 && dexEntry?.catch === false) {
              fadeStateRef.current = { zone: 'legendary' };
              play(battleBgm, 0.3);
              Object.keys(keysRef.current).forEach(
                (k) => (keysRef.current[k] = false),
              );
              transitionRef.current.start(() => {
                sessionStorage.setItem(
                  'position',
                  JSON.stringify({
                    x: playerRef.current.x,
                    y: playerRef.current.y,
                    direction: playerRef.current.direction,
                  }),
                );
                sessionStorage.setItem('eventZone', 'legendary');
                sessionStorage.setItem('legendaryId', String(pokemonId));
                sessionStorage.setItem('status', 'true');
                loopRunningRef.current = false;
                navigate('/battle');
              });
            }
            break;
          }
        }
      }

      if (e.code === 'KeyC') {
        console.log(`메뉴 열기`);
        menuOpenRef.current = true;
        menuIndexRef.current = 0;
        setMenuIndex(0);
        setMenuOpen(true);
      }
      if (
        [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'Escape',
          'x',
          'X',
        ].includes(e.key)
      ) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 게임 루프 함수들 (클로저로 ref 접근)
    function startTileMove() {
      const player = playerRef.current;
      const deltas = {
        back: [0, -TILE],
        front: [0, TILE],
        left: [-TILE, 0],
        right: [TILE, 0],
      };
      const [dx, dy] = deltas[player.direction];
      const nextX = roundPos(player.x + dx);
      const nextY = roundPos(player.y + dy);
      const nextCol = Math.floor(nextX / TILE);
      const nextRow = Math.floor(nextY / TILE);

      player.currentFrame = WALK_CYCLE[player.cycleIndex];
      player.cycleIndex = (player.cycleIndex + 1) % 4;

      // 아이템 타일도 획득 전까지는 통행 불가 — 획득 후 itemTileMapRef에서 제거되면 자동으로 열림
      if (
        isBlocked(nextCol, nextRow) ||
        itemTileMapRef.current.has(`${nextCol},${nextRow}`)
      ) {
        player.isBumping = true;
        player.bumpTimer = 0;
        return;
      }
      player.targetX = nextX;
      player.targetY = nextY;
      player.isMoving = true;
    }

    function update() {
      if (menuOpenRef.current || reportModalOpenRef.current) return;
      const now = performance.now();
      const player = playerRef.current;
      const keys = keysRef.current;

      if (player.isBumping) {
        player.bumpTimer++;
        if (player.bumpTimer >= BUMP_FRAMES) {
          player.isBumping = false;
          player.currentFrame = 'idle';
        }
        return;
      }

      if (player.isMoving) {
        const dx = player.targetX - player.x;
        const dy = player.targetY - player.y;

        if (Math.abs(dx) + Math.abs(dy) <= SPEED) {
          player.x = player.targetX;
          player.y = player.targetY;
          player.isMoving = false;

          const arrivedCol = Math.floor(player.x / TILE);
          const arrivedRow = Math.floor(player.y / TILE);
          const tileKey = `${arrivedCol},${arrivedRow}`;

          if (eventTileMapRef.current.has(tileKey)) {
            play(battleBgm, 0.2);
            const zone = eventTileMapRef.current.get(tileKey);
            eventTileMapRef.current.delete(tileKey);

            player.isMoving = false;
            player.isBumping = false;
            player.currentFrame = 'idle';
            player.cycleIndex = 0;
            player.activeDirection = null;
            player.holdStartTime = 0;
            Object.keys(keys).forEach((k) => (keys[k] = false));

            fadeStateRef.current = { zone };
            play(battleBgm, 0.3);

            transitionRef.current.start(() => {
              const VALID_ZONES = ['grass1', 'grass2', 'snow', 'sea', 'cave'];
              if (!VALID_ZONES.includes(fadeStateRef.current?.zone)) {
                alert(
                  `잘못된 요청입니다. (zone: ${fadeStateRef.current?.zone})`,
                );
                fadeStateRef.current = null;
                return;
              }
              sessionStorage.setItem(
                'position',
                JSON.stringify({
                  x: player.x,
                  y: player.y,
                  direction: player.direction,
                }),
              );
              sessionStorage.setItem('eventZone', fadeStateRef.current.zone);
              sessionStorage.setItem('status', 'true');
              loopRunningRef.current = false;
              navigate('/battle');
            });
            return;
          }
        } else {
          player.x = roundPos(
            player.x + Math.sign(dx) * Math.min(Math.abs(dx), SPEED),
          );
          player.y = roundPos(
            player.y + Math.sign(dy) * Math.min(Math.abs(dy), SPEED),
          );
          return;
        }
      }

      let pressedDir = null;
      if (keys['ArrowUp']) pressedDir = 'back';
      if (keys['ArrowDown']) pressedDir = 'front';
      if (keys['ArrowLeft']) pressedDir = 'left';
      if (keys['ArrowRight']) pressedDir = 'right';

      if (!pressedDir) {
        player.currentFrame = 'idle';
        player.cycleIndex = 0;
        player.holdStartTime = 0;
        player.activeDirection = null;
        return;
      }

      if (pressedDir !== player.activeDirection) {
        player.activeDirection = pressedDir;
        player.direction = pressedDir;
        player.currentFrame = 'idle';
        player.holdStartTime = now;
        player.cycleIndex = 0;
        return;
      }

      if (now - player.holdStartTime < HOLD_THRESHOLD_MS) return;

      startTileMove();
    }

    function draw() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const player = playerRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mapImgRef.current.complete && mapImgRef.current.naturalWidth > 0) {
        const img = mapImgRef.current;
        const sy = Math.max(0, img.naturalHeight - canvas.height);
        ctx.drawImage(
          img,
          0,
          sy,
          canvas.width,
          canvas.height,
          0,
          0,
          canvas.width,
          canvas.height,
        );
      }

      // ctx.font = 'bold 11px sans-serif';
      // ctx.textAlign = 'center';
      // ctx.textBaseline = 'middle';

      // for (const [key] of eventTileMapRef.current) {
      //   const [ec, er] = key.split(',').map(Number);
      //   const ex = ec * TILE + TILE / 2;
      //   const ey = er * TILE + TILE / 2;
      //   ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
      //   ctx.beginPath();
      //   ctx.arc(ex, ey, 6, 0, Math.PI * 2);
      //   ctx.fill();
      //   ctx.fillStyle = '#111';
      //   ctx.fillText('!', ex, ey);
      // }

      const ballImg = imagesRef.current['monsterball'];
      if (ballImg && ballImg.complete && ballImg.naturalWidth > 0) {
        const ballSize = TILE * 0.7;
        for (const [key] of itemTileMapRef.current) {
          const [ic, ir] = key.split(',').map(Number);
          const ix = ic * TILE + TILE / 2;
          const iy = ir * TILE + TILE / 2;
          ctx.drawImage(
            ballImg,
            Math.round(ix - ballSize / 2),
            Math.round(iy - ballSize / 2),
            ballSize,
            ballSize,
          );
        }
      }

      const spriteName = spriteMap[player.direction][player.currentFrame];
      const img = imagesRef.current[spriteName];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const w = img.naturalWidth * SCALE;
      const h = img.naturalHeight * SCALE;
      ctx.drawImage(
        img,
        Math.round(player.x - w / 2),
        Math.round(player.y + TILE / 2 - h - 8),
        w,
        h,
      );
    }

    function gameLoop() {
      if (fadeStateRef.current) {
        draw();
      } else {
        update();
        draw();
      }
      if (loopRunningRef.current) requestAnimationFrame(gameLoop);
    }

    function startLoop() {
      if (loopRunningRef.current) return;
      loopRunningRef.current = true;
      requestAnimationFrame(gameLoop);
    }

    function stopLoop() {
      loopRunningRef.current = false;
    }

    // 백그라운드 탭 처리
    const handleVisibilityChange = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };
    const handlePageHide = () => stopLoop();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    startLoop();

    return () => {
      //   clearInterval(intervalId);
      stopLoop();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    };
  }, []);

  return (
    <>
      <BattleTransition ref={transitionRef} />

      <div id='wrap' className={styles.wrap}>
        {menuOpen && (
          <div className={styles.menu}>
            {MENU_ITEMS.map((item, i) => (
              <div
                key={item}
                className={`${styles.menu_item} ${menuIndex === i ? styles.menu_item_selected : ''}`}
              >
                {menuIndex === i && (
                  <span className={styles.menu_cursor}>▶ </span>
                )}
                {item}
              </div>
            ))}
          </div>
        )}
        {reportModalOpen && (
          <div className={styles.report_modal}>
            <p>저장하시겠습니까?</p>
            <p>z: 예&nbsp;&nbsp;x: 아니오</p>
          </div>
        )}
        {secretModalOpen && (
          <div className={styles.report_modal}>
            <p>비밀 장소로 이동하겠습니까?</p>
            <p>z: 예&nbsp;&nbsp;x: 아니오</p>
          </div>
        )}
        {saveToast && <div className={styles.save_toast}>저장했습니다</div>}
        {itemToast && (
          <div className={styles.save_toast}>
            {itemToast}을(를) 획득했습니다!
          </div>
        )}
        <canvas ref={canvasRef} id='game-canvas' width='1080' height='720' />
      </div>
    </>
  );
}
