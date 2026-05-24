(() => {
  const escMenu = document.getElementById("esc-menu");
  const battleScreen = document.getElementById("battle-screen");
  const battleButton = document.querySelector("#esc-menu .battle");
  const battleClose = document.getElementById("battle-close");
  const gameCanvas = document.getElementById("game-canvas");
  const encounterScriptId = "encounter-script";
  const playerHpStorageKey = "galactic-grunt.playerHp";
  const playerHealPendingKey = "galactic-grunt.playerHealPending";
  const battleZoneStorageKey = "galactic-grunt.battleZone";
  const BATTLE_ZONE_THEMES = new Set(["grass", "snow", "sea", "cave"]);

  const elements = {
    battleLogList: document.getElementById("battle-log-list"),
    battleLogSubtitle: document.getElementById("battle-log-subtitle"),
    battleActions: document.querySelector(".battle-actions"),
    battleActionButtons: document.querySelectorAll(".battle-action"),
    battleSubmenu: document.getElementById("battle-submenu"),
    battleSubmenuTitle: document.getElementById("battle-submenu-title"),
    battleSubmenuList: document.getElementById("battle-submenu-list"),
    battleStageEl: document.querySelector(".battle-stage"),
    battleFadeOverlay: document.querySelector(".battle-fade-overlay"),
    battleDefeatBanner: document.querySelector(".battle-defeat-banner"),
    battleDefeatDialog: document.getElementById("battle-defeat-dialog"),
    battleDefeatYes: document.getElementById("battle-defeat-yes"),
    battleDefeatNo: document.getElementById("battle-defeat-no"),
    enemyMonsterEl: document.querySelector(".battle-monster--enemy"),
    playerMonsterEl: document.querySelector(".battle-monster--player"),
    enemyNameEl: document.querySelector(".battle-panel--enemy .battle-name"),
    playerNameEl: document.querySelector(".battle-panel--player .battle-name"),
    enemyHpFill: document.querySelector(".battle-hp-fill--enemy"),
    enemyHpValue: document.querySelector(".battle-panel--enemy .battle-hp-value"),
    playerHpFill: document.querySelector(".battle-hp-fill--player"),
    playerHpValue: document.querySelector(".battle-panel--player .battle-hp-value"),
  };

  const data = window.BattleData;

  function readStoredPlayerHp(fallbackHp, maxHp) {
    if (!window.sessionStorage) return fallbackHp;
    const rawText = window.sessionStorage.getItem(playerHpStorageKey);
    if (rawText === null) return fallbackHp;

    const rawHp = Number(rawText);
    if (!Number.isFinite(rawHp)) return fallbackHp;
    return Math.max(0, Math.min(rawHp, maxHp));
  }

  function writeStoredPlayerHp(hp) {
    if (!window.sessionStorage) return;
    window.sessionStorage.setItem(playerHpStorageKey, String(hp));
  }

  function markPlayerHealPending() {
    if (!window.sessionStorage) return;
    window.sessionStorage.setItem(playerHealPendingKey, "1");
  }

  function clearPlayerHealPending() {
    if (!window.sessionStorage) return;
    window.sessionStorage.removeItem(playerHealPendingKey);
  }

  function isPlayerHealPending() {
    if (!window.sessionStorage) return false;
    return window.sessionStorage.getItem(playerHealPendingKey) === "1";
  }

  function normalizeBattleZone(zone) {
    if (zone === "grass1" || zone === "grass2") return "grass";
    if (zone === "water") return "sea";
    if (BATTLE_ZONE_THEMES.has(zone)) return zone;
    return "grass";
  }

  function readBattleZone() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("zone");
    const fromStorage = window.sessionStorage
      ? window.sessionStorage.getItem(battleZoneStorageKey)
      : null;

    return normalizeBattleZone(fromQuery || fromStorage || "grass");
  }

  function writeBattleZone(zone) {
    if (!window.sessionStorage) return;
    window.sessionStorage.setItem(battleZoneStorageKey, normalizeBattleZone(zone));
  }

  function ensureEncounterScript() {
    if (!gameCanvas || battleScreen) return;
    if (document.getElementById(encounterScriptId)) return;

    const script = document.createElement("script");
    script.id = encounterScriptId;
    script.src = "../js/encounter.js";
    script.async = true;
    document.head.appendChild(script);
  }

  ensureEncounterScript();

  if (!battleScreen) {
    if (isPlayerHealPending()) {
      writeStoredPlayerHp(window.BattleData?.player?.maxHp ?? 0);
      clearPlayerHealPending();
    }
    return;
  }

  if (!data || !window.createBattleView || !window.createBattleCombat) {
    return;
  }

  const battleZone = readBattleZone();
  writeBattleZone(battleZone);
  document.body.dataset.battleZone = battleZone;
  if (battleScreen) {
    battleScreen.dataset.battleZone = battleZone;
  }

  const enemyName =
    elements.enemyNameEl?.textContent?.trim() || data.enemy.nameFallback;
  const playerName =
    elements.playerNameEl?.textContent?.trim() || data.player.nameFallback;

  elements.enemyName = enemyName;
  elements.playerName = playerName;

  function getPlayerLeadPokemonName() {
    const lead =
      data.party?.[0]?.name ||
      data.playerParty?.[0]?.name ||
      data.player?.party?.[0]?.name ||
      data.player?.team?.[0]?.name;
    return lead || playerName;
  }

  const state = {
    battleOver: false,
    isResolving: false,
    turn: "player",
    submenuOpen: false,
    activeTab: null,
    logTimer: null,
    logClearTimer: null,
    savePlayerHp: writeStoredPlayerHp,
    markPlayerHealPending,
    player: {
      currentHp: readStoredPlayerHp(data.player.startHp, data.player.maxHp),
      maxHp: data.player.maxHp,
    },
    enemy: {
      currentHp: data.enemy.startHp,
      maxHp: data.enemy.maxHp,
    },
  };

  if (!window.sessionStorage?.getItem(playerHpStorageKey)) {
    writeStoredPlayerHp(state.player.currentHp);
  }

  const view = window.createBattleView(elements, state, data);
  const combat = window.createBattleCombat(elements, state, data, view);

  function setMenuOpen(nextOpen) {
    if (!escMenu) return;
    escMenu.classList.toggle("show", nextOpen);
  }

  function setBattleMode(active) {
    document.body.classList.toggle("battle-mode", active);
    battleScreen.hidden = !active;
    battleScreen.setAttribute("aria-hidden", String(!active));
  }

  function goToBattlePage() {
    writeBattleZone("grass");
    window.location.href = "./battle.html?zone=grass";
  }

  function goToMapPage() {
    window.location.href = "./index.html";
  }

  function closeSubmenuAndClearActive() {
    view.hideSubmenu();
    view.setActiveButton(null);
  }

  function showDefeatBanner(message) {
    if (!elements.battleDefeatBanner) return;
    elements.battleDefeatBanner.textContent = message;
    elements.battleDefeatBanner.hidden = false;
    if (elements.battleFadeOverlay) {
      elements.battleFadeOverlay.classList.add("is-deeper");
    }
  }

  function openDefeatRecoveryDialog() {
    if (!elements.battleDefeatDialog) return;
    elements.battleDefeatDialog.hidden = false;
    elements.battleDefeatDialog.setAttribute("aria-hidden", "false");
  }

  function closeDefeatRecoveryDialog() {
    if (!elements.battleDefeatDialog) return;
    elements.battleDefeatDialog.hidden = true;
    elements.battleDefeatDialog.setAttribute("aria-hidden", "true");
  }

  function returnToMapAfterRecovery(recovered) {
    if (recovered) {
      state.player.currentHp = state.player.maxHp;
      writeStoredPlayerHp(state.player.currentHp);
      view.updateHpBar(
        elements.playerHpFill,
        state.player.currentHp,
        state.player.maxHp,
        elements.playerHpValue,
      );
    }

    closeDefeatRecoveryDialog();
    window.setTimeout(() => {
      goToMapPage();
    }, 250);
  }

  function resetBattlePresentation() {
    closeSubmenuAndClearActive();
    view.setTurn("player");
    view.setBattleControlsEnabled(true);
    view.showLog(`야생의 ${enemyName}가 튀어나왔다!`);
    window.setTimeout(() => {
      if (state.battleOver) return;
      view.showLog(`가라 ${getPlayerLeadPokemonName()}!`);
    }, data.logVisibleMs);
    view.updateHpBar(
      elements.enemyHpFill,
      state.enemy.currentHp,
      state.enemy.maxHp,
      elements.enemyHpValue,
    );
    view.updateHpBar(
      elements.playerHpFill,
      state.player.currentHp,
      state.player.maxHp,
      elements.playerHpValue,
    );
    writeStoredPlayerHp(state.player.currentHp);

    if (elements.enemyMonsterEl) {
      elements.enemyMonsterEl.hidden = false;
      elements.enemyMonsterEl.classList.remove("is-fainting");
    }

    if (elements.playerMonsterEl) {
      elements.playerMonsterEl.hidden = false;
      elements.playerMonsterEl.classList.remove("is-fainting");
    }

    if (elements.battleStageEl) {
      elements.battleStageEl.classList.remove("is-defeat");
    }

    if (elements.battleFadeOverlay) {
      elements.battleFadeOverlay.hidden = true;
      elements.battleFadeOverlay.classList.remove("is-visible");
      elements.battleFadeOverlay.classList.remove("is-deeper");
    }

    if (elements.battleDefeatBanner) {
      elements.battleDefeatBanner.hidden = true;
      elements.battleDefeatBanner.textContent = "";
    }

    if (elements.battleDefeatDialog) {
      elements.battleDefeatDialog.hidden = true;
      elements.battleDefeatDialog.setAttribute("aria-hidden", "true");
    }
  }

  function bindActionButtons() {
    elements.battleActionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (state.battleOver || state.isResolving) return;

        const tab = button.dataset.tab || "skills";

        if (tab === "run") {
          closeSubmenuAndClearActive();
          view.setActiveButton(tab);
          view.showLog("무사히 도망쳤다!");
          window.setTimeout(() => {
            if (document.body.classList.contains("battle-mode")) {
              goToMapPage();
            }
          }, 650);
          return;
        }

        if (tab !== "skills") {
          closeSubmenuAndClearActive();
          return;
        }

        if (state.submenuOpen && state.activeTab === tab) {
          closeSubmenuAndClearActive();
          return;
        }

        view.renderSubmenu(tab);
        view.setActiveButton(tab);
      });
    });
  }

  function bindSubmenuButtons() {
    if (!elements.battleSubmenuList) return;

    elements.battleSubmenuList.addEventListener("click", (event) => {
      if (state.battleOver || state.isResolving) return;

      const itemButton = event.target.closest(".battle-submenu__button");
      if (!itemButton) return;

      if (state.activeTab === "skills") {
        const index = Number(itemButton.dataset.skillIndex);
        const skill = data.skills[index];
        if (!skill) return;

        closeSubmenuAndClearActive();
        combat.applySkillDamage(skill);
        return;
      }

      closeSubmenuAndClearActive();
    });
  }

  function bindGlobalKeys() {
    window.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();

      if (document.body.classList.contains("battle-mode")) {
        goToMapPage();
        return;
      }

      if (escMenu) {
        setMenuOpen(!escMenu.classList.contains("show"));
      }
    });
  }

  function bindShellButtons() {
    if (battleButton) {
      battleButton.addEventListener("click", () => {
        setMenuOpen(false);
        goToBattlePage();
      });
    }

    if (battleClose) {
      battleClose.addEventListener("click", () => {
        if (document.body.classList.contains("battle-mode")) {
          goToMapPage();
          return;
        }

        setBattleMode(false);
        setMenuOpen(false);
      });
    }
  }

  if (elements.battleDefeatYes) {
    elements.battleDefeatYes.addEventListener("click", () => {
      returnToMapAfterRecovery(true);
    });
  }

  if (elements.battleDefeatNo) {
    elements.battleDefeatNo.addEventListener("click", () => {
      returnToMapAfterRecovery(false);
    });
  }

  state.openDefeatRecoveryDialog = openDefeatRecoveryDialog;
  state.showDefeatBanner = showDefeatBanner;
  state.closeDefeatRecoveryDialog = closeDefeatRecoveryDialog;

  bindActionButtons();
  bindSubmenuButtons();
  bindGlobalKeys();
  bindShellButtons();
  resetBattlePresentation();
})();
