import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import styles from './battlePage.module.css';
import { postBattlePokemon } from '../api/postBattlePokemon';
import { useBattleLog } from '../hooks/useBattleLog';
import { useBattle } from '../hooks/useBattle';
import { useBgm } from '../context/BgmContext';
import { battleBgm, secretBattleBgm } from '../assets/bgm';
import { navigateToMap } from '../utils/navigateToMap';
import { tryCatch } from '../utils/calcCatchRate';
import { setPokedexWatch, setPokedexCatch } from '../utils/updatePokedex';
import LogComponent from '../components/LogComponent';
import MovePanel from '../components/battle/MovePanel';
import PokemonSelectPanel from '../components/battle/PokemonSelectPanel';
import FaintPanel from '../components/battle/FaintPanel';
import Pokemon from '../components/battle/Pokemon';
import EnemyPokemon from '../components/battle/EnemyPokemon';
import OpenTransition from '../components/animation/OpenTransition';
import BattleTransition from '../components/animation/BattleTransition';
import FightPanel from '../components/battle/FightPanel';
import BagPanel from '../components/battle/BagPanel';
import { v4 as uuidv4 } from 'uuid';

const ACTION_MENU = ['싸운다', '포켓몬', '가방', '도망가기'];

function eventZoneCheck(zone) {
  return zone === 'grass1' || zone === 'grass2' ? 'grass' : zone;
}

function playAudio(url) {
  const audio = new Audio(url);
  audio.play().catch(() => {
    const unlock = () => {
      audio.play().catch(() => {});
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('keydown', unlock);
  });
}

export default function BattlePage() {
  const eventZone = sessionStorage.getItem('eventZone');
  // 전설 포켓몬 조우 시 MapPage에서 저장한 ID — 사용 후 즉시 제거
  const legendaryId = sessionStorage.getItem('legendaryId')
    ? Number(sessionStorage.getItem('legendaryId'))
    : null;
  if (legendaryId) sessionStorage.removeItem('legendaryId');

  const myPokemon = JSON.parse(sessionStorage.getItem('isMyPokemon') || '[]');
  const removeEmptyObject = myPokemon.filter((p) => Object.keys(p).length > 0);
  const currentIndex = removeEmptyObject.findIndex(
    (pokemon) => pokemon.currentHp !== 0,
  );

  console.log(currentIndex);
  // const bag = JSON.parse(sessionStorage.getItem('bag') || '[]');

  const navigate = useNavigate();
  const [enemy, setEnemy] = useState(null);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [phase, setPhase] = useState('intro'); // 'intro' | 'select' | 'fight' | 'pokemon' | 'bag' | 'bag-target' | 'executing' | 'end'
  const [pendingItem, setPendingItem] = useState(null); // { tab, item }

  const audioStepRef = useRef(0);
  const prevWaitingRef = useRef(false);
  const openRef = useRef(null);
  const exitTransitionRef = useRef(null);

  const { displayText, waiting, addLog, advance, onQueueEmpty } =
    useBattleLog();
  const { play, stop } = useBgm();
  const { executeTurn, executeEnemyTurn } = useBattle({ addLog });

  // 마운트: BGM + 화면 열기 + 포켓몬 fetch
  useEffect(() => {
    const eventZone = sessionStorage.getItem('eventZone');
    if (eventZone === 'legendary') {
      play(secretBattleBgm, 0.2);
    } else {
      play(battleBgm, 0.2);
    }
    openRef.current.start();

    if (currentIndex === -1) {
      alert('싸울 수 있는 포켓몬이 없다!');
      navigate('/map');
      return;
    }
    console.log('Current Pokemon:', removeEmptyObject.length);
    const avgLevel = Math.floor(
      myPokemon.reduce((sum, p) => sum + (p.level ?? 0), 0) /
        removeEmptyObject.length,
    );

    console.log(
      'Calculated average level:',
      avgLevel,
      Math.floor(myPokemon.reduce((sum, p) => sum + (p.level ?? 0), 0)),
    );

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyX') {
        e.preventDefault();
        setPhase('select');
      }
    });

    postBattlePokemon({
      eventZone,
      avgLevel,
      pokemonId: legendaryId ?? undefined,
    })
      .then((data) => {
        setEnemy(data);
        setPokedexWatch(data.id);
        sessionStorage.setItem('enemyPokemon', JSON.stringify(data));
        sessionStorage.setItem(
          'currentPokemon',
          JSON.stringify(
            removeEmptyObject[
              removeEmptyObject.findIndex((pokemon) => pokemon.currentHp !== 0)
            ] || null,
          ),
        );
        window.dispatchEvent(new CustomEvent('enemyPokemonUpdated'));
        window.dispatchEvent(new CustomEvent('currentPokemonUpdated'));
        // const currentIndex = myPokemon.findIndex(
        //   (pokemon) => pokemon.currentHp !== 0,
        // );
        if (currentIndex !== -1) {
          setCurrentPokemon(removeEmptyObject[currentIndex]);
          addLog(`야생 ${data.name}이(가) 나타났다!`);
          playAudio(data.cryUrl);
          addLog(`가랏! ${removeEmptyObject[currentIndex].name}!`);
          addLog('무엇을 할까?');
        }
      })
      .catch(console.error);

    return () => stop();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // waiting 변화: 인트로 자동 진행 + 플레이어 등장 + select 전환
  useEffect(() => {
    if (prevWaitingRef.current && !waiting) {
      if (audioStepRef.current === 0) {
        setShowPlayer(true);
        const stored = JSON.parse(
          sessionStorage.getItem('isMyPokemon') || '[]',
        );
        const idx = stored.findIndex((p) => (p.currentHp ?? 0) > 0);
        playAudio(stored[idx]?.cryUrl);
      }
      audioStepRef.current += 1;
    }
    prevWaitingRef.current = waiting;

    if (!waiting) return;

    if (audioStepRef.current < 2) {
      const timer = setTimeout(() => advance(), 1500);
      return () => clearTimeout(timer);
    }

    setPhase((prev) => (prev === 'intro' ? 'select' : prev));
  }, [waiting, advance]);

  // 전멸 시: 로그 표시 → 전체 HP 회복 → 맵으로
  const handleBlackout = () => {
    addLog('싸울 수 있는 포켓몬이 없다..');
    addLog('빛나는 눈앞이 캄캄해졌다');
    setPhase('executing');
    onQueueEmpty(() => {
      const stored = JSON.parse(sessionStorage.getItem('isMyPokemon') || '[]');
      sessionStorage.setItem(
        'isMyPokemon',
        JSON.stringify(
          stored.map((p) => ({ ...p, currentHp: p.maxHp ?? p.baseStats?.hp ?? 0 })),
        ),
      );
      exitTransitionRef.current.start(() => navigate('/map'));
    });
  };

  // 행동 메뉴 선택 (싸운다 / 포켓몬 / 가방 / 도망가기)
  const handleActionSelect = (idx) => {
    switch (idx) {
      case 0: // 싸운다
        setPhase('fight');
        break;
      case 1:
        setPhase('pokemon');
        break;
      case 2:
        setPhase('bag');
        break;
      case 3: // 도망가기
        addLog('무사히 도망쳤다!');
        advance();
        setPhase('executing');
        onQueueEmpty(() => {
          exitTransitionRef.current.start(() => navigate('/map'));
        });
        break;
      default:
        break;
    }
  };

  // 포켓몬 교체 (sessionStorage 교체는 PokemonSelectPanel이 처리)
  const handlePokemonSelect = (selected, prevHp) => {
    const isVoluntary = prevHp > 0; // 기절 교체면 false, 자발적 교체면 true

    if (isVoluntary) addLog(`돌아와! ${currentPokemon.name}!`);
    setCurrentPokemon(selected);
    playAudio(selected.cryUrl);
    addLog(`가랏! ${selected.name}!`);
    advance();
    setPhase('executing');

    if (isVoluntary) {
      // 자발적 교체: 상대도 이번 턴에 공격
      const result = executeEnemyTurn();
      onQueueEmpty(() => {
        if (result === 'player-faint') {
          const stored = JSON.parse(
            sessionStorage.getItem('isMyPokemon') || '[]',
          );
          const hasOthers = stored.some(
            (p) => p.catchId !== selected.catchId && (p.currentHp ?? 0) > 0,
          );
          if (hasOthers) setPhase('faint');
          else handleBlackout();
        } else {
          addLog('무엇을 할까?');
          setPhase('select');
        }
      });
    } else {
      // 기절 후 교체: 상대 공격 없이 바로 선택 화면으로
      onQueueEmpty(() => {
        addLog('무엇을 할까?');
        setPhase('select');
      });
    }
  };

  // 가방에서 아이템 선택 → 볼이면 포획, 나머지는 포켓몬 선택 단계로
  const handleBagSelect = (tab, item) => {
    if (tab === 'ball') {
      const ep = JSON.parse(sessionStorage.getItem('enemyPokemon') || 'null');
      if (!ep) return;

      // 볼 count 차감
      const bag = JSON.parse(sessionStorage.getItem('bag') || '{}');
      sessionStorage.setItem(
        'bag',
        JSON.stringify({
          ...bag,
          ball: (bag.ball ?? [])
            .map((i) =>
              i.name === item.name ? { ...i, count: i.count - 1 } : i,
            )
            .filter((i) => i.count > 0),
        }),
      );

      const caught = tryCatch(ep, item.name);

      // 볼 던질 때 이미지 교체
      addLog(`${ep.name}에게 ${item.name}을(를) 던졌다!`, () => {
        window.dispatchEvent(
          new CustomEvent('catchAttempt', { detail: { id: ep.id } }),
        );
      });

      advance();
      setPhase('executing');

      if (caught) {
        addLog(`야생 ${ep.name}을(를) 잡았다!`);
        const pokemonBox = JSON.parse(
          sessionStorage.getItem('pokemonBox') || '[]',
        );
        pokemonBox.push({ ...ep, catchId: uuidv4() });
        sessionStorage.setItem('pokemonBox', JSON.stringify(pokemonBox));
        setPokedexCatch(ep.id);
        onQueueEmpty(() => navigateToMap(navigate));
      } else {
        addLog(`${ep.name}이(가) 탈출했다!`, () => {
          window.dispatchEvent(new CustomEvent('catchRelease'));
        });
        const result = executeEnemyTurn();
        onQueueEmpty(() => {
          if (result === 'player-faint') {
            const stored = JSON.parse(
              sessionStorage.getItem('isMyPokemon') || '[]',
            );
            const hasOthers = stored.some(
              (p) =>
                p.catchId !== currentPokemon?.catchId && (p.currentHp ?? 0) > 0,
            );
            if (hasOthers) setPhase('faint');
            else handleBlackout();
          } else {
            addLog('무엇을 할까?');
            setPhase('select');
          }
        });
      }
      return;
    }
    setPendingItem({ tab, item });
    setPhase('bag-target');
  };

  // 아이템을 적용할 포켓몬 선택 후 처리
  const handleBagTargetSelect = (target) => {
    const { tab, item } = pendingItem;
    setPendingItem(null);

    const healed = Math.min(
      (target.currentHp ?? 0) + (item.healAmount ?? 0),
      target.maxHp ?? target.baseStats?.hp ?? 0,
    );
    const updated = { ...target, currentHp: healed };

    const isMyPokemon = JSON.parse(
      sessionStorage.getItem('isMyPokemon') || '[]',
    );
    sessionStorage.setItem(
      'isMyPokemon',
      JSON.stringify(
        isMyPokemon.map((p) => (p.catchId === target.catchId ? updated : p)),
      ),
    );
    const cp = JSON.parse(sessionStorage.getItem('currentPokemon') || 'null');
    if (cp?.catchId === target.catchId) {
      sessionStorage.setItem('currentPokemon', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('currentPokemonUpdated'));
    }

    const bag = JSON.parse(sessionStorage.getItem('bag') || '{}');
    sessionStorage.setItem(
      'bag',
      JSON.stringify({
        ...bag,
        [tab]: (bag[tab] ?? [])
          .map((i) => (i.name === item.name ? { ...i, count: i.count - 1 } : i))
          .filter((i) => i.count > 0),
      }),
    );

    addLog(`${target.name}에게 ${item.name}을(를) 사용했다!`);
    advance();
    setPhase('executing');

    const result = executeEnemyTurn();
    onQueueEmpty(() => {
      if (result === 'player-faint') {
        const stored = JSON.parse(
          sessionStorage.getItem('isMyPokemon') || '[]',
        );
        const hasOthers = stored.some(
          (p) =>
            p.catchId !== currentPokemon?.catchId && (p.currentHp ?? 0) > 0,
        );
        if (hasOthers) setPhase('faint');
        else handleBlackout();
      } else {
        addLog('무엇을 할까?');
        setPhase('select');
      }
    });
  };

  // 기술 선택 후 턴 실행
  const handleFightSelect = (idx) => {
    const result = executeTurn(idx);
    advance();
    setPhase('executing');

    onQueueEmpty(() => {
      if (result === 'continue') {
        addLog('무엇을 할까?');
        setPhase('select');
      } else if (result === 'enemy-faint') {
        navigateToMap(navigate);
      } else if (result === 'player-faint') {
        const stored = JSON.parse(
          sessionStorage.getItem('isMyPokemon') || '[]',
        );
        const hasOthers = stored.some(
          (p) =>
            p.catchId !== currentPokemon?.catchId && (p.currentHp ?? 0) > 0,
        );
        if (hasOthers) {
          setPhase('faint');
        } else {
          handleBlackout();
        }
      }
    });
  };

  const renderBottomPanel = () => {
    switch (phase) {
      case 'bag-target':
        return (
          <div style={{ display: 'flex', gap: '-5px' }}>
            <LogComponent
              displayText={displayText}
              waiting={waiting}
              size='short'
            />
            <PokemonSelectPanel
              mode='target'
              onSelect={handleBagTargetSelect}
            />
          </div>
        );
      case 'faint':
        return (
          <div style={{ display: 'flex', gap: '-5px' }}>
            <LogComponent
              displayText={displayText}
              waiting={waiting}
              size='short'
            />
            <FaintPanel
              onSwitch={() => setPhase('pokemon')}
              onEscape={() => navigate('/map')}
            />
          </div>
        );
      case 'select':
        return (
          <div style={{ display: 'flex', gap: '-5px' }}>
            <LogComponent
              displayText={displayText}
              waiting={waiting}
              size='short'
            />
            <MovePanel moves={ACTION_MENU} onSelect={handleActionSelect} />
          </div>
        );
      case 'fight':
        return (
          <div style={{ display: 'flex', gap: '-5px' }}>
            <LogComponent
              displayText={displayText}
              waiting={waiting}
              size='skill'
            />
            <FightPanel
              moves={currentPokemon?.moves}
              onSelect={handleFightSelect}
            />
          </div>
        );
      case 'pokemon':
        return (
          <div style={{ display: 'flex', gap: '-5px' }}>
            <LogComponent
              displayText={displayText}
              waiting={waiting}
              size='short'
            />
            <PokemonSelectPanel onSelect={handlePokemonSelect} />
          </div>
        );
      case 'bag':
        return (
          <div style={{ display: 'flex', gap: '-5px' }}>
            <LogComponent
              displayText={displayText}
              waiting={waiting}
              size='short'
            />
            <BagPanel onSelect={handleBagSelect} />
          </div>
        );
      default:
        return (
          <LogComponent
            displayText={displayText}
            waiting={waiting}
            advance={advance}
          />
        );
    }
  };

  return (
    <div style={{ backgroundColor: 'rgb(82, 82, 82)' }}>
      <OpenTransition ref={openRef} />
      <BattleTransition ref={exitTransitionRef} />
      <div
        className={styles.wrap_battle}
        style={{
          backgroundImage: `url(/src/assets/images/battle_images/${eventZoneCheck(eventZone || 'cave')}_bg.png)`,
          height: '554px',
        }}
      >
        {enemy && (
          <EnemyPokemon eventZone={eventZoneCheck(eventZone || 'cave')} />
        )}
        {showPlayer && (
          <Pokemon eventZone={eventZoneCheck(eventZone || 'cave')} />
        )}
      </div>

      <div style={{ display: 'flex', width: '1080px' }}>
        {renderBottomPanel()}
      </div>
    </div>
  );
}
