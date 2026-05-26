import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import mainMapUrl from '/src/assets/images/main_map.png';
import styles from './mapPage.module.css';

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

const MENU_ITEMS = ['포켓몬', '도감', '가방', '리포트', '???', '닫는다'];

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
  const loopRunningRef = useRef(false);
  const fadeStateRef = useRef(null);

  const [cells, setCells] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuOpenRef = useRef(false);
  const [menuIndex, setMenuIndex] = useState(0);
  const menuIndexRef = useRef(0);

  useEffect(() => {
    sessionStorage.setItem('status', 'false');

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

    // 인카운터 이벤트 맵 생성
    const EVENT_COUNT = 12;
    Object.entries(zones).forEach(([zoneName, zoneData]) => {
      const selected = pickRandom(zoneToCells(zoneData), EVENT_COUNT);
      selected.forEach((key) => eventTileMapRef.current.set(key, zoneName));
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
    const handleKeyDown = (e) => {
      if (!e.repeat) keysRef.current[e.key] = true;

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
        } else if (e.key === 'z' || e.key === 'Z') {
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
          } else if (MENU_ITEMS[menuIndexRef.current] === '???') {
            // sessionStorage.setItem(
            //   'position',
            //   JSON.stringify({
            //     x: playerRef.current.x,
            //     y: playerRef.current.y,
            //     direction: playerRef.current.direction,
            //   }),
            // );
            console.log('맵 이동');
            // navigate('/pokemon');
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
          } else if (MENU_ITEMS[menuIndexRef.current] === '리포트') {
            alert('리포트 화면은 아직 구현되지 않았습니다.');
          }
        } else if (e.key === 'x' || e.key === 'X') {
          menuOpenRef.current = false;
          setMenuOpen(false);
          menuIndexRef.current = 0;
          setMenuIndex(0);
        }
        e.preventDefault();
        return;
      }

      if (e.key === 'c' || e.key === 'C') {
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
    function startBattleTransition(onComplete) {
      const COLS_BC = 4,
        ROWS_BC = 3;
      const CELL_COUNT = COLS_BC * ROWS_BC;
      const DELAY = 60,
        DUR = 300;

      const newCells = Array.from({ length: CELL_COUNT }, (_, i) => ({
        id: i,
        active: false,
      }));
      setCells(newCells);

      newCells.forEach((_, i) => {
        setTimeout(() => {
          setCells((prev) =>
            prev.map((cell) =>
              cell.id === i ? { ...cell, active: true } : cell,
            ),
          );
          if (i === newCells.length - 1) setTimeout(onComplete, DUR);
        }, i * DELAY);
      });
    }

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

      if (isBlocked(nextCol, nextRow)) {
        player.isBumping = true;
        player.bumpTimer = 0;
        return;
      }
      player.targetX = nextX;
      player.targetY = nextY;
      player.isMoving = true;
    }

    function update() {
      if (menuOpenRef.current) return;
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

            startBattleTransition(() => {
              const VALID_ZONES = ['grass1', 'grass2', 'snow', 'sea', 'cave'];
              if (!VALID_ZONES.includes(fadeStateRef.current?.zone)) {
                alert(
                  `잘못된 요청입니다. (zone: ${fadeStateRef.current?.zone})`,
                );
                fadeStateRef.current = null;
                setCells([]);
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
              //   sessionStorage.setItem('battleZone', fadeStateRef.current.zone);
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

      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (const [key] of eventTileMapRef.current) {
        const [ec, er] = key.split(',').map(Number);
        const ex = ec * TILE + TILE / 2;
        const ey = er * TILE + TILE / 2;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
        ctx.beginPath();
        ctx.arc(ex, ey, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.fillText('!', ex, ey);
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
      <div id='battle_change' className={styles.battle_change}>
        {cells.map((cell) => (
          <div
            key={cell.id}
            className={styles.bc_cell}
            style={{
              transition: 'transform 300ms ease-in',
              transform: cell.active ? 'scale(1)' : 'scale(0)',
            }}
          />
        ))}
      </div>

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
        <canvas ref={canvasRef} id='game-canvas' width='1080' height='720' />
      </div>
    </>
  );
}
