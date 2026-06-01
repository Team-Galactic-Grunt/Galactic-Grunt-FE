import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useBgm } from '../context/BgmContext';
import { battleBgm, secretBattleBgm } from '../assets/bgm';
import secretMapUrl from '/src/assets/images/secret_map.png'; // 720×1283 맵 이미지
import styles from './secretPage.module.css';
import BattleTransition from '../components/animation/BattleTransition';

// ── 원본 맵 이미지 크기 ──
const MAP_IMG_W = 720;
const MAP_IMG_H = 1283;

// ── 뷰포트(캔버스) 크기 ──
const VP_W = 1080;
const VP_H = 720;

// ── 맵 스케일: 가로를 VP_W에 꽉 채움 ──
const MAP_SCALE = VP_W / MAP_IMG_W; // 1.5
const SCALED_MAP_H = MAP_IMG_H * MAP_SCALE; // 1924.5

// ── 타일 / 캐릭터 ──
const TILE = Math.round(24 * MAP_SCALE); // 36px
const SPRITE_SCALE = 0.3 * MAP_SCALE;
const SPEED = 2.2 * MAP_SCALE;
const HOLD_THRESHOLD_MS = 100;
const BUMP_FRAMES = Math.ceil(TILE / SPEED);
const WALK_CYCLE = ['right', 'idle', 'left', 'idle'];

// ── 맵 그리드 크기 ──
const COLS = Math.floor(MAP_IMG_W / 24); // 원본 기준
const ROWS = Math.floor(MAP_IMG_H / 24);

// ── 충돌 장애물 (원본 타일 좌표 기준) ──
// 맵 이미지에 맞게 수정하세요
const obstacles = [
  { c: 0, r: 0, w: COLS, h: 8 }, // 상단 경계
  { c: 0, r: ROWS - 1, w: COLS, h: 1 }, // 하단 경계
  { c: 0, r: 0, w: 3, h: ROWS }, // 좌측 경계
  { c: COLS - 3, r: 0, w: 3, h: ROWS }, // 우측 경계
  { c: 3, r: ROWS - 5, w: 10, h: 4 },
  { c: COLS - 13, r: ROWS - 5, w: 10, h: 4 },
  { c: 3, r: ROWS - 7, w: 9, h: 2 },
  { c: COLS - 12, r: ROWS - 7, w: 9, h: 2 },

  { c: 3, r: ROWS - 14, w: 8, h: 7 },
  { c: COLS - 11, r: ROWS - 14, w: 8, h: 7 },

  { c: 3, r: ROWS - 22, w: 10, h: 8 },
  { c: COLS - 13, r: ROWS - 22, w: 10, h: 8 },

  { c: 3, r: 8, w: 3, h: 23 },
  { c: COLS - 6, r: 8, w: 3, h: 23 },

  { c: 10, r: ROWS - 24, w: 3, h: 2 },
  { c: COLS - 13, r: ROWS - 24, w: 2, h: 2 },

  { c: 6, r: ROWS - 32, w: 3, h: 7 },
  { c: COLS - 9, r: ROWS - 32, w: 3, h: 7 },

  { c: 6, r: 8, w: 3, h: 6 },
  { c: COLS - 9, r: 8, w: 3, h: 6 },
];

const SECRET_POKEMON_BASE = [{ c: 13, r: 15.5, w: 4, h: 4 }];

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

// ── 유틸 ──
function roundPos(val) {
  return Math.round(val * 10) / 10;
}

function isBlocked(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return true;
  return obstacles.some(
    (o) => col >= o.c && col < o.c + o.w && row >= o.r && row < o.r + o.h,
  );
}

// ── 카메라: 플레이어 Y 기준, 맵 경계 클램프 ──
// player.x/y 는 스케일된 픽셀 좌표
function getCamera(playerX, playerY) {
  const camX = Math.max(
    0,
    Math.min(playerX - VP_W / 2, SCALED_MAP_H * (MAP_IMG_W / MAP_IMG_H) - VP_W),
  );
  const camY = Math.max(0, Math.min(playerY - VP_H / 2, SCALED_MAP_H - VP_H));
  return { camX: 0, camY }; // X는 맵 너비 = VP_W 라 고정
}

// ── 컴포넌트 ──
export default function SecretPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pokemonId = state?.id ?? null;

  console.log(pokemonId);

  const secret_pokemon = SECRET_POKEMON_BASE.map((p) => ({
    ...p,
    imgs: pokemonId
      ? [
          `/src/assets/images/secret_images/${pokemonId}_1.png`,
          `/src/assets/images/secret_images/${pokemonId}_2.png`,
        ]
      : [],
  }));

  const canvasRef = useRef(null);
  const mapImgRef = useRef(new Image());
  const imagesRef = useRef({});
  const playerRef = useRef(null);
  const keysRef = useRef({});
  const loopRunningRef = useRef(false);
  const transitionRef = useRef(null);
  const secretPokemonMapRef = useRef(new Map()); // tile key → pokemon index, 비어있으면 통과 가능

  const { play, stop } = useBgm();

  useEffect(() => {
    // play(mainBgm);

    // 맵 이미지 로드
    mapImgRef.current.src = secretMapUrl;

    // 스프라이트 로드
    Object.values(spriteMap).forEach((dir) => {
      Object.values(dir).forEach((name) => {
        if (!imagesRef.current[name]) {
          const img = new Image();
          img.src = `/src/assets/images/character_images/${name}.png`;
          imagesRef.current[name] = img;
        }
      });
    });

    // 시크릿 포켓몬 이미지 로드 + 통행 불가 타일 등록
    // pokedex에서 이미 포획(catch: true)된 포켓몬은 등록하지 않음 → 이미지 미표시 + 통과 가능
    const pokedex = JSON.parse(sessionStorage.getItem('pokedex') || '[]');
    secret_pokemon.forEach((p, i) => {
      const isCaught =
        pokemonId != null &&
        pokedex.find((entry) => entry.id === pokemonId)?.catch === true;
      if (isCaught) return;

      (p.imgs ?? []).forEach((src, f) => {
        if (!imagesRef.current[`secret_${i}_${f}`]) {
          const img = new Image();
          img.src = src;
          imagesRef.current[`secret_${i}_${f}`] = img;
        }
      });
      const rowStart = Math.floor(p.r);
      const rowEnd = Math.floor(p.r + p.h);
      const colStart = Math.floor(p.c);
      const colEnd = Math.floor(p.c + p.w);
      for (let row = rowStart; row < rowEnd; row++) {
        for (let col = colStart; col < colEnd; col++) {
          secretPokemonMapRef.current.set(`${col},${row}`, i);
        }
      }
    });

    // ── 초기 위치: 맵 하단 중앙 (타일 중심에 배치) ──
    const startCol = Math.floor(COLS / 2);
    const startRow = ROWS - 4;
    const startX = startCol * TILE + TILE / 2;
    const startY = startRow * TILE + TILE / 2;

    playerRef.current = {
      x: startX,
      y: startY,
      targetX: startX,
      targetY: startY,
      direction: 'back', // 처음엔 위를 보게
      isMoving: false,
      isBumping: false,
      bumpTimer: 0,
      cycleIndex: 0,
      currentFrame: 'idle',
      holdStartTime: 0,
      activeDirection: null,
    };

    // ── 키보드 이벤트 ──
    const handleKeyDown = (e) => {
      if (!e.repeat) keysRef.current[e.key] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      // Z 키: 앞 타일에 시크릿 포켓몬이 있으면 배틀 시작
      if (e.code === 'KeyZ') {
        const player = playerRef.current;
        if (!player) return;
        const col = Math.floor(player.x / TILE);
        const row = Math.floor(player.y / TILE);
        const faceDeltas = {
          back: [0, -1],
          front: [0, 1],
          left: [-1, 0],
          right: [1, 0],
        };
        const [dc, dr] = faceDeltas[player.direction];
        const checkKey = `${col + dc},${row + dr}`;
        if (secretPokemonMapRef.current.has(checkKey)) {
          play(secretBattleBgm, 0.3);
          Object.keys(keysRef.current).forEach(
            (k) => (keysRef.current[k] = false),
          );
          transitionRef.current.start(() => {
            loopRunningRef.current = false;
            sessionStorage.setItem('eventZone', '???');
            // sessionStorage.setItem('legendaryId', String(pokemonId));
            navigate('/battle', { state: { id: pokemonId } });
          });
          return;
        }
      }
      // X 키: 이전 맵으로
      if (e.code === 'KeyX') {
        navigate('/map');
      }
    };
    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // ── 게임 루프 ──
    function startTileMove() {
      const player = playerRef.current;
      const deltas = {
        back: [0, -TILE],
        front: [0, TILE],
        left: [-TILE, 0],
        right: [TILE, 0],
      };
      const [dx, dy] = deltas[player.direction];

      // 스케일된 좌표 → 원본 타일 좌표로 변환해서 충돌 체크
      const nextX = roundPos(player.x + dx);
      const nextY = roundPos(player.y + dy);
      const nextCol = Math.floor(nextX / TILE);
      const nextRow = Math.floor(nextY / TILE);

      player.currentFrame = WALK_CYCLE[player.cycleIndex];
      player.cycleIndex = (player.cycleIndex + 1) % 4;

      if (
        isBlocked(nextCol, nextRow) ||
        secretPokemonMapRef.current.has(`${nextCol},${nextRow}`)
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
      const mapImg = mapImgRef.current;

      ctx.clearRect(0, 0, VP_W, VP_H);

      // ── 카메라 계산 ──
      const { camX, camY } = getCamera(player.x, player.y);

      // ── 맵 그리기 ──
      // 소스 좌표: 스케일 역산 (원본 이미지 기준)
      if (mapImg.complete && mapImg.naturalWidth > 0) {
        const srcX = camX / MAP_SCALE;
        const srcY = camY / MAP_SCALE;
        const srcW = VP_W / MAP_SCALE; // = MAP_IMG_W (가로 꽉참)
        const srcH = VP_H / MAP_SCALE;

        ctx.drawImage(
          mapImg,
          srcX,
          srcY,
          srcW,
          srcH, // 소스: 원본에서 카메라 기준으로 자름
          0,
          0,
          VP_W,
          VP_H, // 대상: 캔버스 전체
        );
      }

      // ── 장애물 시각화 (카메라 오프셋 적용) ──
      //   ctx.save();
      //   ctx.fillStyle = 'rgba(255, 50, 50, 0.45)';
      //   ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
      //   ctx.lineWidth = 2;
      //   for (const o of obstacles) {
      //     const x = o.c * TILE - camX;
      //     const y = o.r * TILE - camY;
      //     const w = o.w * TILE;
      //     const h = o.h * TILE;
      //     ctx.fillRect(x, y, w, h);
      //     ctx.strokeRect(x, y, w, h);
      //   }
      //   ctx.restore();

      for (let i = 0; i < secret_pokemon.length; i++) {
        // secretPokemonMapRef에 해당 인덱스 타일이 없으면 이미 사라진 포켓몬
        const isActive = [...secretPokemonMapRef.current.values()].some(
          (v) => v === i,
        );
        if (!isActive) continue;

        const p = secret_pokemon[i];
        const zoneX = p.c * TILE - camX;
        const zoneY = p.r * TILE - camY;
        const zoneW = p.w * TILE;
        const zoneH = p.h * TILE;
        const frameIdx = Math.floor(performance.now() / 1000) % p.imgs.length;
        const pokemonImg = imagesRef.current[`secret_${i}_${frameIdx}`];
        if (pokemonImg && pokemonImg.complete && pokemonImg.naturalWidth > 0) {
          const scale = Math.min(
            zoneW / pokemonImg.naturalWidth,
            zoneH / pokemonImg.naturalHeight,
          );
          const iw = pokemonImg.naturalWidth * scale;
          const ih = pokemonImg.naturalHeight * scale;
          ctx.drawImage(
            pokemonImg,
            zoneX + (zoneW - iw) / 2,
            zoneY + (zoneH - ih) / 2,
            iw,
            ih,
          );
        }
      }

      // ── 캐릭터 그리기 ──
      const screenX = player.x - camX;
      const screenY = player.y - camY;

      const spriteName = spriteMap[player.direction][player.currentFrame];
      const img = imagesRef.current[spriteName];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const w = img.naturalWidth * SPRITE_SCALE;
      const h = img.naturalHeight * SPRITE_SCALE;
      ctx.drawImage(
        img,
        Math.round(screenX - w / 2),
        Math.round(screenY + TILE / 2 - h - 8),
        w,
        h,
      );
    }

    function gameLoop() {
      update();
      draw();
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

    const handleVisibilityChange = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', stopLoop);

    startLoop();

    return () => {
      stopLoop();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', stopLoop);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div id='wrap' className={styles.wrap}>
      <BattleTransition ref={transitionRef} />
      <canvas
        ref={canvasRef}
        id='secret-canvas'
        width={VP_W}
        height={VP_H}
        style={{ display: 'block', imageRendering: 'pixelated' }}
      />
    </div>
  );
}
