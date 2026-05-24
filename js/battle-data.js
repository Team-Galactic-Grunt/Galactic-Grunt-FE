(() => {
  const battleData = {
    logVisibleMs: 1400,
    logFadeMs: 180,
    turnDelayMs: 650,
    player: {
      nameFallback: "팽도리",
      startHp: 60,
      maxHp: 60,
    },
    enemy: {
      nameFallback: "찌르꼬",
      startHp: 60,
      maxHp: 60,
    },
    skills: [
      { name: "물대포", damage: 14 },
      { name: "거품", damage: 10 },
      { name: "몸통박치기", damage: 8 },
      { name: "회전부리", damage: 18 },
    ],
    enemySkills: [
      { name: "날개치기", damage: 8 },
      { name: "몸통박치기", damage: 7 },
      { name: "회전부리", damage: 10 },
    ],
    tabs: {
      skills: {
        title: "기술 목록",
      },
      items: {
        title: "지닌 물건",
        items: ["몬스터볼 x12", "상처약 x5", "기력의 조각 x2", "빨간사탕 x1"],
      },
      pokemon: {
        title: "지닌 포켓몬",
        items: [
          "팽도리 Lv.42 HP 60/60",
          "찌르꼬 Lv.17 HP 60/60",
          "Leafin Lv.21 HP 60/60",
        ],
      },
    },
  };

  battleData.tabs.skills.items = battleData.skills;

  window.BattleData = battleData;
})();
