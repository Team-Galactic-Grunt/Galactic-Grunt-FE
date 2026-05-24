(() => {
  const canvas = document.getElementById('game-canvas');

  if (!canvas || document.body.classList.contains('battle-mode')) return;

  const TILE = 24;
  const CHANCE_RATE = 0.1;
  const SCAN_INTERVAL_MS = 140;
  const BATTLE_ZONE_STORAGE_KEY = 'galactic-grunt.battleZone';

  const BATTLE_ZONE_LAYOUTS = {
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

  const BATTLE_ZONE_THEME = {
    grass1: 'grass',
    grass2: 'grass',
    snow: 'snow',
    sea: 'sea',
    cave: 'cave',
  };

  const ACTIVE_BATTLE_ZONES = new Set(Object.keys(BATTLE_ZONE_LAYOUTS));

  const BATTLE_ZONES = Object.fromEntries(
    Object.entries(BATTLE_ZONE_LAYOUTS).map(([zoneType, rects]) => [
      zoneType,
      rects.map(({ c, r, w, h }) => ({
        x: c * TILE,
        y: r * TILE,
        w: w * TILE,
        h: h * TILE,
      })),
    ]),
  );

  const offscreen = document.createElement('canvas');
  const offscreenCtx = offscreen.getContext('2d', { willReadFrequently: true });
  const bgCanvas = document.createElement('canvas');
  const bgCtx = bgCanvas.getContext('2d', { willReadFrequently: true });

  let bgImage = null;
  let bgReady = false;
  let lastCellKey = null;
  let isTransitioning = false;

  const backgroundUrl = getComputedStyle(canvas)
    .backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];

  if (backgroundUrl) {
    bgImage = new Image();
    bgImage.src = backgroundUrl;
    bgImage.onload = () => {
      bgCanvas.width = bgImage.naturalWidth;
      bgCanvas.height = bgImage.naturalHeight;
      bgCtx.drawImage(bgImage, 0, 0);
      bgReady = true;
    };
  }

  function canvasToBackgroundSample(x, y) {
    if (!bgReady) return null;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imageWidth = bgImage.naturalWidth;
    const imageHeight = bgImage.naturalHeight;

    const scale = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight);
    const displayWidth = imageWidth * scale;
    const displayHeight = imageHeight * scale;
    const offsetX = (canvasWidth - displayWidth) / 2;
    const offsetY = canvasHeight - displayHeight;

    if (
      x < offsetX ||
      y < offsetY ||
      x >= offsetX + displayWidth ||
      y >= offsetY + displayHeight
    ) {
      return null;
    }

    const sourceX = Math.floor((x - offsetX) / scale);
    const sourceY = Math.floor((y - offsetY) / scale);

    if (
      sourceX < 0 ||
      sourceY < 0 ||
      sourceX >= imageWidth ||
      sourceY >= imageHeight
    ) {
      return null;
    }

    return {
      x: sourceX,
      y: sourceY,
      pixel: bgCtx.getImageData(sourceX, sourceY, 1, 1).data,
    };
  }

  function pointInRect(x, y, rect) {
    return x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
  }

  function getBattleZoneAt(x, y) {
    for (const [zoneType, rects] of Object.entries(BATTLE_ZONES)) {
      if (!ACTIVE_BATTLE_ZONES.has(zoneType)) continue;
      if (rects.some((rect) => pointInRect(x, y, rect))) {
        return zoneType;
      }
    }
    return null;
  }

  function saveBattleZone(zoneType) {
    const battleZone = BATTLE_ZONE_THEME[zoneType] || 'grass';

    try {
      window.sessionStorage?.setItem(BATTLE_ZONE_STORAGE_KEY, battleZone);
    } catch {
      // Ignore storage failures and keep the redirect working.
    }

    return battleZone;
  }

  function findPlayerFootPoint() {
    const { width, height } = canvas;
    offscreen.width = width;
    offscreen.height = height;
    offscreenCtx.clearRect(0, 0, width, height);
    offscreenCtx.drawImage(canvas, 0, 0);

    const imageData = offscreenCtx.getImageData(0, 0, width, height).data;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        if (imageData[index + 3] <= 20) continue;

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }

    if (maxX < 0) return null;

    return {
      x: Math.round((minX + maxX) / 2),
      y: Math.max(0, maxY - 1),
    };
  }

  function maybeStartBattle() {
    if (isTransitioning || !bgReady) return;

    const footPoint = findPlayerFootPoint();
    if (!footPoint) return;

    const cellX = Math.floor(footPoint.x / TILE);
    const cellY = Math.floor(footPoint.y / TILE);
    const cellKey = `${cellX},${cellY}`;

    if (cellKey !== lastCellKey) {
      lastCellKey = cellKey;

      const sample = canvasToBackgroundSample(footPoint.x, footPoint.y);
      if (!sample) return;

      const [r, g, b, a] = sample.pixel;
      const zoneType = getBattleZoneAt(sample.x, sample.y);

      if (a < 20 || !zoneType) return;

      if (Math.random() < CHANCE_RATE) {
        isTransitioning = true;
        const battleZone = saveBattleZone(zoneType);
        window.location.href = `./battle.html?zone=${encodeURIComponent(battleZone)}`;
      }
      return;
    }

    const sample = canvasToBackgroundSample(footPoint.x, footPoint.y);
    if (!sample) return;

    const [r, g, b, a] = sample.pixel;
    const zoneType = getBattleZoneAt(sample.x, sample.y);

    if (a < 20 || !zoneType) {
      lastCellKey = null;
    }
  }

  setInterval(maybeStartBattle, SCAN_INTERVAL_MS);
})();
