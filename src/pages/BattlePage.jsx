import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import styles from './battlePage.module.css';
import { postBattlePokemon } from '../api/postBattlePokemon';
import { useBattleLog } from '../hooks/useBattleLog';
import { useBattle } from '../hooks/useBattle';
import { useBgm } from '../context/BgmContext';
import { battleBgm } from '../assets/bgm';
import { navigateToMap } from '../utils/navigateToMap';
import LogComponent from '../components/LogComponent';
import MovePanel from '../components/battle/MovePanel';
import PokemonSelectPanel from '../components/battle/PokemonSelectPanel';
import FaintPanel from '../components/battle/FaintPanel';
import Pokemon from '../components/battle/Pokemon';
import EnemyPokemon from '../components/battle/EnemyPokemon';
import OpenTransition from '../components/animation/OpenTransition';

const ACTION_MENU = ['싸운다', '포켓몬', '가방', '도망가기'];

function eventZoneCheck(zone) {
  return zone === 'grass1' || zone === 'grass2' ? 'grass' : zone;
}

// function syncCurrentPokemon() {
//   const cp = JSON.parse(sessionStorage.getItem('currentPokemon') || 'null');
//   if (!cp) return;
//   const list = JSON.parse(sessionStorage.getItem('isMyPokemon') || '[]');
//   sessionStorage.setItem(
//     'isMyPokemon',
//     JSON.stringify(list.map((p) => (p.catchId === cp.catchId ? cp : p))),
//   );
// }

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
  const myPokemon = JSON.parse(sessionStorage.getItem('isMyPokemon') || '[]');
  const currentIndex = myPokemon.findIndex(
    (pokemon) => pokemon.currentHp !== 0,
  );
  const bag = JSON.parse(sessionStorage.getItem('bag') || '[]');
  const avgLevel = myPokemon.length
    ? myPokemon.reduce((sum, p) => sum + p.level, 0) / myPokemon.length
    : 1;

  const navigate = useNavigate();
  const [enemy, setEnemy] = useState(null);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [phase, setPhase] = useState('intro'); // 'intro' | 'select' | 'fight' | 'pokemon' | 'bag' | 'executing' | 'end'
  const [moveIndex, setMoveIndex] = useState(0);

  const audioStepRef = useRef(0);
  const prevWaitingRef = useRef(false);
  const openRef = useRef(null);

  const { displayText, waiting, addLog, advance, onQueueEmpty } =
    useBattleLog();
  // const { play, stop } = useBgm();
  const { executeTurn } = useBattle({ addLog });

  // 마운트: BGM + 화면 열기 + 포켓몬 fetch
  useEffect(() => {
    // play(battleBgm, 0.2);
    openRef.current.start();

    if (currentIndex === -1) {
      alert('싸울 수 있는 포켓몬이 없다!');
      navigate('/map');
      return;
    }

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyX') {
        e.preventDefault();
        setPhase('select');
      }
    });

    postBattlePokemon({ eventZone, avgLevel })
      .then((data) => {
        setEnemy(data);
        sessionStorage.setItem('enemyPokemon', JSON.stringify(data));
        sessionStorage.setItem(
          'currentPokemon',
          JSON.stringify(
            myPokemon[
              myPokemon.findIndex((pokemon) => pokemon.currentHp !== 0)
            ] || null,
          ),
        );
        window.dispatchEvent(new CustomEvent('enemyPokemonUpdated'));
        window.dispatchEvent(new CustomEvent('currentPokemonUpdated'));
        // const currentIndex = myPokemon.findIndex(
        //   (pokemon) => pokemon.currentHp !== 0,
        // );
        if (currentIndex !== -1) {
          setCurrentPokemon(myPokemon[currentIndex]);
          addLog(`야생 ${data.name}이(가) 나타났다!`);
          playAudio(data.cryUrl);
          addLog(`가랏! ${myPokemon[currentIndex].name}!`);
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

  // 행동 메뉴 선택 (싸운다 / 포켓몬 / 가방 / 도망가기)
  const handleActionSelect = (idx) => {
    switch (idx) {
      case 0: // 싸운다
        setMoveIndex(0);
        setPhase('fight');
        break;
      case 1:
        setMoveIndex(0);
        setPhase('pokemon');
        break;
      case 2:
        setMoveIndex(0);
        setPhase('bag');
        break;
      case 3: // 도망가기
        navigateToMap(navigate);
        break;
      default:
        break;
    }
  };

  // 포켓몬 교체 (sessionStorage 교체는 PokemonSelectPanel이 처리)
  const handlePokemonSelect = (selected, prevHp) => {
    if (prevHp > 0) addLog(`돌아와! ${currentPokemon.name}!`);
    setCurrentPokemon(selected);
    playAudio(selected.cryUrl);
    addLog(`가랏! ${selected.name}!`);
    addLog('무엇을 할까?');
    advance();
    setPhase('executing');
    onQueueEmpty(() => setPhase('select'));
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
        setMoveIndex(0);
        if (hasOthers) {
          setPhase('faint');
        } else {
          navigateToMap(navigate);
        }
      }
    });
  };

  const renderBottomPanel = () => {
    switch (phase) {
      case 'faint':
        return (
          <div style={{ display: 'flex', gap: '-5px' }}>
            <LogComponent
              displayText={displayText}
              waiting={waiting}
              size='short'
            />
            <FaintPanel
              onSwitch={() => {
                setMoveIndex(0);
                setPhase('pokemon');
              }}
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
            <MovePanel
              moves={ACTION_MENU}
              moveIndex={moveIndex}
              onMove={setMoveIndex}
              onSelect={handleActionSelect}
            />
          </div>
        );
      case 'fight':
        return (
          <div style={{ display: 'flex', gap: '-5px' }}>
            <LogComponent
              displayText={displayText}
              waiting={waiting}
              size='short'
            />
            <MovePanel
              moves={currentPokemon?.moves?.map((m) => m.koName)}
              moveIndex={moveIndex}
              onMove={setMoveIndex}
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
            <PokemonSelectPanel
              selectedIndex={moveIndex}
              onMove={setMoveIndex}
              onSelect={handlePokemonSelect}
            />
          </div>
        );
      case 'bag':
        return (
          <div style={{ position: 'relative', display: 'flex', gap: '-5px' }}>
            <div></div>
            <LogComponent
              displayText={displayText}
              waiting={waiting}
              size='short'
            />
            <MovePanel
              moves={moveIndex}
              moveIndex={moveIndex}
              onMove={setMoveIndex}
              onSelect={handleFightSelect}
            />
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
      <div
        className={styles.wrap_battle}
        style={{
          backgroundImage: `url(/src/assets/images/battle_images/${eventZoneCheck(eventZone)}_bg.png)`,
          height: '554px',
        }}
      >
        {enemy && <EnemyPokemon eventZone={eventZoneCheck(eventZone)} />}
        {showPlayer && <Pokemon eventZone={eventZoneCheck(eventZone)} />}
      </div>

      <div style={{ display: 'flex', width: '1080px' }}>
        {renderBottomPanel()}
      </div>
    </div>
  );
}
