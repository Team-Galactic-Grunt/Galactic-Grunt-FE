(() => {
  function createBattleCombat(elements, state, data, view) {
    function returnToMapPage() {
      window.location.href = "./index.html";
    }

    function faintEnemyAndReturn() {
      const enemyMonster = elements.enemyMonsterEl;
      const faintDurationMs = 680;

      if (enemyMonster) {
        enemyMonster.classList.add("is-fainting");
      }

      window.setTimeout(() => {
        if (enemyMonster) {
          enemyMonster.hidden = true;
        }
        returnToMapPage();
      }, faintDurationMs + 120);
    }

    function handlePlayerDefeat() {
      const overlayDelayMs = 520;
      const wakeDelayMs = 2100;
      const promptDelayMs = 2850;

      state.battleOver = true;
      state.isResolving = false;
      view.clearBattleLogTimers();
      view.setBattleControlsEnabled(false);
      view.hideSubmenu();

      if (elements.battleStageEl) {
        elements.battleStageEl.classList.add("is-defeat");
      }

      if (elements.playerMonsterEl) {
        elements.playerMonsterEl.classList.add("is-fainting");
      }

      view.showLog("눈앞이 깜깜해졌다");

      window.setTimeout(() => {
        if (elements.battleFadeOverlay) {
          elements.battleFadeOverlay.hidden = false;
          window.requestAnimationFrame(() => {
            elements.battleFadeOverlay.classList.add("is-visible");
          });
        }
      }, overlayDelayMs);

      window.setTimeout(() => {
        if (typeof state.showDefeatBanner === "function") {
          state.showDefeatBanner("풀숲에서 눈을 떴다!");
        }
      }, wakeDelayMs);

      window.setTimeout(() => {
        if (typeof state.openDefeatRecoveryDialog === "function") {
          state.openDefeatRecoveryDialog();
        }
      }, promptDelayMs);
    }

    function endBattle(message) {
      state.battleOver = true;
      state.isResolving = false;
      view.clearBattleLogTimers();
      view.showLog(message);
      view.setBattleControlsEnabled(false);
      view.hideSubmenu();
    }

    function queueEnemyTurn() {
      if (state.battleOver) return;

      state.isResolving = true;
      view.setTurn("enemy");
      view.setBattleControlsEnabled(false);

      window.setTimeout(() => {
        if (state.battleOver) return;

        const enemySkill =
          data.enemySkills[Math.floor(Math.random() * data.enemySkills.length)];
        view.showLog(`${elements.enemyName}의 ${enemySkill.name}!`);

        state.player.currentHp = Math.max(
          0,
          state.player.currentHp - enemySkill.damage,
        );
        if (typeof state.savePlayerHp === "function") {
          state.savePlayerHp(state.player.currentHp);
        }
        view.updateHpBar(
          elements.playerHpFill,
          state.player.currentHp,
          state.player.maxHp,
          elements.playerHpValue,
        );

        if (state.player.currentHp <= 0) {
          window.setTimeout(() => {
            handlePlayerDefeat();
          }, data.logVisibleMs);
          return;
        }

        window.setTimeout(() => {
          if (state.battleOver) return;

          state.isResolving = false;
          view.setTurn("player");
          view.setBattleControlsEnabled(true);
        }, data.turnDelayMs);
      }, data.turnDelayMs);
    }

    function applySkillDamage(skill) {
      if (
        state.battleOver ||
        state.isResolving ||
        state.turn !== "player"
      ) {
        return;
      }

      view.hideSubmenu();
      view.setActiveButton(null);
      state.isResolving = true;
      view.setTurn("enemy");
      view.setBattleControlsEnabled(false);

      view.showLog(`${elements.playerName}의 ${skill.name}!`);
      state.enemy.currentHp = Math.max(
        0,
        state.enemy.currentHp - skill.damage,
      );
      view.updateHpBar(
        elements.enemyHpFill,
        state.enemy.currentHp,
        state.enemy.maxHp,
        elements.enemyHpValue,
      );

      if (state.enemy.currentHp <= 0) {
        window.setTimeout(() => {
          if (state.battleOver) return;
          endBattle(`${elements.enemyName}가 쓰러졌다!`);
          faintEnemyAndReturn();
        }, data.turnDelayMs);
        return;
      }

      window.setTimeout(queueEnemyTurn, data.turnDelayMs);
    }

    return {
      applySkillDamage,
      endBattle,
      queueEnemyTurn,
    };
  }

  window.createBattleCombat = createBattleCombat;
})();
