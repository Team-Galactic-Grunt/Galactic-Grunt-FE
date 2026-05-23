const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const SCALE = 0.3;
const TILE = 24;
const SPEED = 2.2;
const HOLD_THRESHOLD_MS = 100; // 이 시간(ms)만큼 꾹 눌러야 걷기 시작
const BUMP_FRAMES = Math.ceil(TILE / SPEED); // 부딪힘 모션 지속 프레임

const COLS = Math.floor(canvas.width / TILE);
const ROWS = Math.floor(canvas.height / TILE);

const WALK_CYCLE = ['right', 'idle', 'left', 'idle'];

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

const grass1 = [
  { c: 4, r: 8, w: 10, h: 2 },
  { c: 4, r: 10, w: 8, h: 4 },
  { c: 4, r: 14, w: 6, h: 2 },
];

const grass2 = [
  { c: 18, r: 13, w: 5, h: 1 },
  { c: 16, r: 14, w: 9, h: 1 },
  { c: 15, r: 15, w: 11, h: 4 },
];

const snow = [
  { c: 26, r: 3, w: 7, h: 1 },
  { c: 24, r: 4, w: 9, h: 2 },
  { c: 24, r: 6, w: 6, h: 1 },
  { c: 32, r: 6, w: 1, h: 1 },
  { c: 24, r: 7, w: 2, h: 1 },
  { c: 30, r: 7, w: 3, h: 1 },
];

const sea = [
  { c: 31, r: 11, w: 3, h: 1 },
  { c: 31, r: 12, w: 5, h: 2 },
  { c: 4, r: 20, w: 8, h: 1 },
  { c: 4, r: 21, w: 11, h: 4 },
];

const cave = [
  { c: 33, r: 19, w: 3, h: 1 },
  { c: 27, r: 20, w: 9, h: 1 },
  { c: 25, r: 21, w: 11, h: 1 },
  { c: 23, r: 22, w: 13, h: 1 },
  { c: 23, r: 23, w: 4, h: 2 },
  { c: 29, r: 23, w: 7, h: 2 },
];

// 지형 zone을 개별 타일 셀 키 목록으로 확장
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

// 배열에서 n개 무작위 추출 (Fisher-Yates, 중복 없음)
function pickRandom(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return new Set(copy.slice(0, Math.min(n, copy.length)));
}

const EVENT_COUNT = 10;

const grass1Events = pickRandom(zoneToCells(grass1), EVENT_COUNT);
const grass2Events = pickRandom(zoneToCells(grass2), EVENT_COUNT);
const snowEvents = pickRandom(zoneToCells(snow), EVENT_COUNT);
const seaEvents = pickRandom(zoneToCells(sea), EVENT_COUNT);
const caveEvents = pickRandom(zoneToCells(cave), EVENT_COUNT);

// 타일키 → zone 이름 통합 맵 (발생 후 삭제로 중복 방지)
const eventTileMap = new Map();
for (const k of grass1Events) eventTileMap.set(k, 'grass1');
for (const k of grass2Events) eventTileMap.set(k, 'grass2');
for (const k of snowEvents) eventTileMap.set(k, 'snow');
for (const k of seaEvents) eventTileMap.set(k, 'sea');
for (const k of caveEvents) eventTileMap.set(k, 'cave');

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

const images = {};
Object.values(spriteMap).forEach((dir) => {
  Object.values(dir).forEach((name) => {
    if (images[name]) return;
    const img = new Image();
    img.src = `../assets/images/character_images/${name}.png`;
    images[name] = img;
  });
});

// 시작 위치를 타일 그리드에 정렬 (충돌 판정과 렌더링 좌표 일치)
const startCol = Math.round(canvas.width / 2 / TILE);
const startRow = Math.round(canvas.height / 2 / TILE);
const startX = startCol * TILE + TILE / 2; // 타일 중앙
const startY = startRow * TILE + TILE / 2;

function loadSavedPosition() {
  // 맨처음에 서버에서 받아온 위치로 초기화 (유효성 검사 포함)
  // sessionStorage에 값이 없으면 서버에서 받아온 위치로 초기화
  // sessionStorage에 값이 있으면 해당 위치로 초기화 (유효성 검사 포함, 이상하면 null 반환)
  try {
    const saved = sessionStorage.getItem('position');
    if (!saved) return null;
    const { x, y, direction } = JSON.parse(saved);
    const validDirs = ['front', 'back', 'left', 'right'];
    if (
      typeof x !== 'number' ||
      typeof y !== 'number' ||
      !isFinite(x) ||
      !isFinite(y) ||
      x < 0 ||
      x > canvas.width ||
      y < 0 ||
      y > canvas.height
    )
      return null;
    return {
      x,
      y,
      direction: validDirs.includes(direction) ? direction : 'front',
    };
  } catch {
    return null;
  }
}

const savedPos = loadSavedPosition();
// sessionStorage.removeItem('position');
// sessionStorage.removeItem('eventZone');
const initX = savedPos ? savedPos.x : startX;
const initY = savedPos ? savedPos.y : startY;
const initDir = savedPos ? savedPos.direction : 'front';

const player = {
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

// null이면 일반 게임, { alpha, zone }이면 페이드 아웃 진행 중
let fadeState = null;

const keys = {};
window.addEventListener('keydown', (e) => {
  if (!e.repeat) keys[e.key] = true;
  e.preventDefault();
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

function getCurrentSpriteName() {
  return spriteMap[player.direction][player.currentFrame];
}

function roundPos(val) {
  return Math.round(val * 10) / 10;
}
function isBlocked(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return true;
  for (const o of obstacles) {
    if (col >= o.c && col < o.c + o.w && row >= o.r && row < o.r + o.h)
      return true;
  }
  return false;
}

// function startBattleTransition(onComplete) {
//   const cells = document.querySelectorAll('.bc-cell');
//   const DELAY = 60; // 각 셀 딜레이 (ms)
//   const DUR = 300; // 커지는 시간 (ms)

//   cells.forEach((cell, i) => {
//     setTimeout(() => {
//       cell.style.transition = `transform ${DUR}ms ease-in`;
//       cell.style.transform = 'scale(1)';

//       // 마지막 셀이 다 커지면 콜백
//       if (i === cells.length - 1) {
//         setTimeout(onComplete, DUR);
//       }
//     }, i * DELAY);
//   });
// }

function startTileMove() {
  const deltas = {
    back: [0, -TILE],
    front: [0, TILE],
    left: [-TILE, 0],
    right: [TILE, 0],
  };
  const [dx, dy] = deltas[player.direction];
  const nextX = roundPos(player.x + dx);
  const nextY = roundPos(player.y + dy);
  const nextCol = Math.floor(nextX / TILE); // 타일 중앙 좌표엔 Math.floor
  const nextRow = Math.floor(nextY / TILE);

  // 이동 프레임 (벽 충돌 여부 관계없이 스프라이트는 전환)
  player.currentFrame = WALK_CYCLE[player.cycleIndex];
  player.cycleIndex = (player.cycleIndex + 1) % 4;

  if (isBlocked(nextCol, nextRow)) {
    // 제자리 부딪힘 모션
    player.isBumping = true;
    player.bumpTimer = 0;
    return;
  }

  player.targetX = nextX;
  player.targetY = nextY;
  player.isMoving = true;
}

function update() {
  // 부딪힘 모션 진행
  if (player.isBumping) {
    player.bumpTimer++;
    if (player.bumpTimer >= BUMP_FRAMES) {
      player.isBumping = false;
      player.currentFrame = 'idle';
    }
    return;
  }

  // 슬라이드 진행 (입력과 무관하게 끝까지)
  if (player.isMoving) {
    const dx = player.targetX - player.x;
    const dy = player.targetY - player.y;

    if (Math.abs(dx) + Math.abs(dy) <= SPEED) {
      player.x = player.targetX;
      player.y = player.targetY;
      player.isMoving = false;

      // 도착 타일 이벤트 확인
      const arrivedCol = Math.floor(player.x / TILE);
      const arrivedRow = Math.floor(player.y / TILE);
      const tileKey = `${arrivedCol},${arrivedRow}`;
      if (eventTileMap.has(tileKey)) {
        const zone = eventTileMap.get(tileKey);
        eventTileMap.delete(tileKey);
        console.log(`[${zone}] 이벤트 발생!`);
        // 움직임 즉시 정지
        player.isMoving = false;
        player.isBumping = false;
        player.currentFrame = 'idle';
        player.cycleIndex = 0;
        player.activeDirection = null;
        player.holdStartTime = 0;
        for (const k of Object.keys(keys)) keys[k] = false;
        // 페이드 아웃 시작
        fadeState = { alpha: 0, zone };
        return;
      }
    } else {
      player.x = roundPos(
        player.x + Math.sign(dx) * Math.min(Math.abs(dx), SPEED),
      );
      player.y = roundPos(
        player.y + Math.sign(dy) * Math.min(Math.abs(dy), SPEED),
      );
      return; // 슬라이드 중엔 입력 처리 스킵
    }
  }

  // 눌린 방향키 감지
  let pressedDir = null;
  if (keys['ArrowUp']) pressedDir = 'back';
  if (keys['ArrowDown']) pressedDir = 'front';
  if (keys['ArrowLeft']) pressedDir = 'left';
  if (keys['ArrowRight']) pressedDir = 'right';

  if (!pressedDir) {
    // 키 없음 - 완전 정지
    player.currentFrame = 'idle';
    player.cycleIndex = 0;
    player.holdStartTime = 0;
    player.activeDirection = null;
    return;
  }

  if (pressedDir !== player.activeDirection) {
    // 방향 전환: 즉시 방향 변경, 타이머 리셋
    const wasWalking =
      player.activeDirection !== null &&
      performance.now() - player.holdStartTime >= HOLD_THRESHOLD_MS;
    player.activeDirection = pressedDir;
    player.direction = pressedDir;
    player.currentFrame = 'idle';
    player.holdStartTime = performance.now();
    // 항상 _right(index 0)부터 시작
    player.cycleIndex = 0;
    return; // 이번 프레임은 방향만 바꾸고 대기
  }

  // 누른 시간이 threshold 미만이면 방향만 보임 (이동 안 함)
  if (performance.now() - player.holdStartTime < HOLD_THRESHOLD_MS) return;

  // threshold 넘었으면 걷기
  startTileMove();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 장애물 렌더링
  ctx.fillStyle = 'rgba(80, 50, 20, 0)';
  ctx.strokeStyle = 'rgba(50, 30, 10, 0)';
  ctx.lineWidth = 1;
  for (const o of obstacles) {
    const ox = o.c * TILE;
    const oy = o.r * TILE;
    const ow = o.w * TILE;
    const oh = o.h * TILE;
    ctx.fillRect(ox, oy, ow, oh);
    ctx.strokeRect(ox, oy, ow, oh);
  }

  ctx.fillStyle = 'rgba(136, 255, 136, 0)';
  ctx.strokeStyle = 'rgba(100, 200, 100, 0)';
  for (const g of grass1) {
    const gx = g.c * TILE;
    const gy = g.r * TILE;
    const gw = g.w * TILE;
    const gh = g.h * TILE;
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeRect(gx, gy, gw, gh);
  }
  for (const g of grass2) {
    const gx = g.c * TILE;
    const gy = g.r * TILE;
    const gw = g.w * TILE;
    const gh = g.h * TILE;
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeRect(gx, gy, gw, gh);
  }

  ctx.fillStyle = 'rgba(229, 229, 229, 0)';
  ctx.strokeStyle = 'rgba(214, 214, 214, 0)';
  for (const s of snow) {
    const sx = s.c * TILE;
    const sy = s.r * TILE;
    const sw = s.w * TILE;
    const sh = s.h * TILE;
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeRect(sx, sy, sw, sh);
  }

  ctx.fillStyle = 'rgba(80, 179, 255, 0)';
  ctx.strokeStyle = 'rgba(114, 189, 255, 0)';
  for (const s of sea) {
    const sx = s.c * TILE;
    const sy = s.r * TILE;
    const sw = s.w * TILE;
    const sh = s.h * TILE;
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeRect(sx, sy, sw, sh);
  }

  ctx.fillStyle = 'rgba(172, 115, 59, 0)';
  ctx.strokeStyle = 'rgba(182, 137, 86, 0)';
  for (const s of cave) {
    const sx = s.c * TILE;
    const sy = s.r * TILE;
    const sw = s.w * TILE;
    const sh = s.h * TILE;
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeRect(sx, sy, sw, sh);
  }

  // 이벤트 타일 마커 렌더링
  // ctx.textAlign = 'center';
  // ctx.textBaseline = 'middle';
  for (const [key] of eventTileMap) {
    const [ec, er] = key.split(',').map(Number);
    const ex = ec * TILE + TILE / 2;
    const ey = er * TILE + TILE / 2;
    // ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';

    // ctx.beginPath();
    // ctx.arc(ex, ey, 5, 0, Math.PI * 2);
    // ctx.fill();
    // ctx.fillStyle = '#333';
    // ctx.fillText('!', ex, ey + 0.5);
  }

  const img = images[getCurrentSpriteName()];
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const w = img.naturalWidth * SCALE;
  const h = img.naturalHeight * SCALE;
  ctx.drawImage(
    img,
    Math.round(player.x - w / 2), // 수평: 타일 중앙 기준
    Math.round(player.y + TILE / 2 - h - 2), // 수직: 발이 타일 하단에 위치
    w,
    h,
  );
}

function gameLoop() {
  if (fadeState) {
    draw();
    fadeState.alpha = Math.min(1, fadeState.alpha + 1 / 60);
    ctx.fillStyle = `rgba(0,0,0,${fadeState.alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (fadeState.alpha >= 1) {
      sessionStorage.setItem(
        'position',
        JSON.stringify({
          x: player.x,
          y: player.y,
          direction: player.direction,
        }),
      );
      sessionStorage.setItem('eventZone', fadeState.zone);
      sessionStorage.setItem('status', 'true');
      window.location.href = `../pages/test.html`;
      return;
    }
  } else {
    update();
    draw();
  }
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
