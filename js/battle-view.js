(() => {
  function getHpColors(ratio) {
    if (ratio > 0.5) return ["#3ef23f", "#1f9f1f"];
    if (ratio > 0.25) return ["#f1df3f", "#c8a91d"];
    return ["#ff6a6a", "#d62c2c"];
  }

  function createBattleView(elements, state, data) {
    function clearBattleLogTimers() {
      if (state.logTimer) {
        window.clearTimeout(state.logTimer);
        state.logTimer = null;
      }

      if (state.logClearTimer) {
        window.clearTimeout(state.logClearTimer);
        state.logClearTimer = null;
      }
    }

    function renderBattleLog(message = "") {
      if (!elements.battleLogList) return;

      elements.battleLogList.innerHTML = message
        ? `
          <li class="battle-log__item is-visible">
            <span class="battle-log__text">${message}</span>
          </li>
        `
        : "";
    }

    function showLog(message) {
      if (!elements.battleLogList) return;

      clearBattleLogTimers();
      renderBattleLog(message);

      state.logTimer = window.setTimeout(() => {
        const item = elements.battleLogList.querySelector(".battle-log__item");
        if (item) {
          item.classList.add("is-fading");
        }

        state.logClearTimer = window.setTimeout(() => {
          renderBattleLog("");
        }, data.logFadeMs);
      }, data.logVisibleMs);
    }

    function setTurn(nextTurn) {
      state.turn = nextTurn;
    }

    function setBattleControlsEnabled(enabled) {
      elements.battleActionButtons.forEach((button) => {
        button.disabled = !enabled || state.battleOver;
      });
    }

    function updateHpBar(fillEl, currentHp, maxHp, valueEl) {
      if (!fillEl || !maxHp) return;

      const hp = Math.max(0, Math.min(currentHp, maxHp));
      const ratio = hp / maxHp;
      const [topColor, bottomColor] = getHpColors(ratio);

      fillEl.style.width = `${ratio * 100}%`;
      fillEl.style.background = `linear-gradient(180deg, ${topColor}, ${bottomColor})`;

      if (valueEl) {
        valueEl.textContent = `${hp}/${maxHp}`;
      }
    }

    function hideSubmenu() {
      if (!elements.battleSubmenu) return;

      elements.battleSubmenu.hidden = true;
      state.submenuOpen = false;
      state.activeTab = null;
    }

    function setActiveButton(nextTab) {
      elements.battleActionButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.tab === nextTab);
      });
    }

    function renderSubmenu(tabKey) {
      if (
        !elements.battleSubmenu ||
        !elements.battleSubmenuTitle ||
        !elements.battleSubmenuList
      )
        return;

      const tab = data.tabs[tabKey];
      if (!tab) return;

      elements.battleSubmenuTitle.textContent = tab.title;
      elements.battleSubmenuList.innerHTML = "";
      elements.battleSubmenuList.scrollLeft = 0;

      if (tabKey === "skills") {
        elements.battleSubmenuList.classList.remove(
          "battle-submenu__list--horizontal",
        );
        elements.battleSubmenuList.innerHTML = tab.items
          .map(
            (skill, index) => `
            <li class="battle-submenu__item">
              <button type="button" class="battle-submenu__button" data-skill-index="${index}">
                <span class="battle-submenu__text">${skill.name}</span>
              </button>
            </li>
          `,
          )
          .join("");
      } else {
        elements.battleSubmenuList.classList.add(
          "battle-submenu__list--horizontal",
        );
        elements.battleSubmenuList.innerHTML = tab.items
          .map(
            (item) => `
            <li class="battle-submenu__item">
              <span class="battle-submenu__text">${item}</span>
            </li>
          `,
          )
          .join("");
      }

      elements.battleSubmenu.hidden = false;
      state.submenuOpen = true;
      state.activeTab = tabKey;
    }

    return {
      clearBattleLogTimers,
      hideSubmenu,
      renderBattleLog,
      renderSubmenu,
      setActiveButton,
      setBattleControlsEnabled,
      setTurn,
      showLog,
      updateHpBar,
    };
  }

  window.createBattleView = createBattleView;
})();
