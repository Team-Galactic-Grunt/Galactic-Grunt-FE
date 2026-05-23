(() => {
  const canvas = document.getElementById('game-canvas');

  if (!canvas || document.body.classList.contains('battle-mode')) return;

  const TILE = 24;
  const CHANCE_RATE = 0.1;
  const SCAN_INTERVAL_MS = 140;
  const ACTIVE_BATTLE_ZONES = new Set(['grass']);

  const BATTLE_ZONES = {
    grass: [
      { x: 78, y: 206, w: 238, h: 238 },
      { x: 320, y: 348, w: 248, h: 200 },
      { x: 736, y: 276, w: 164, h: 92 },
      { x: 620, y: 484, w: 302, h: 178 },
    ],
    water: [
      { x: 96, y: 548, w: 252, h: 128 },
    ],
    sea: [
      { x: 928, y: 0, w: 152, h: 744 },
    ],
  };

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
        window.location.href = './battle.html';
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
