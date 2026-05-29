import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import styles from './battlePage.module.css';
import { postBattlePokemon } from '../api/postBattlePokemon';
import { useBattleLog } from '../hooks/useBattleLog';
import { useBattle } from '../hooks/useBattle';
import { useBgm } from '../context/BgmContext';
import { battleBgm } from '../assets/bgm';
import LogComponent from '../components/LogComponent';
import ManualLogComponent from '../components/ManualLogComponent';
import MovePanel from '../components/battle/MovePanel';
import Pokemon from '../components/battle/Pokemon';
import OpenTransition from '../components/animation/OpenTransition';

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
  const navigate = useNavigate();
  const [enemy, setEnemy] = useState(null);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  // phase: 'intro' | 'select' | 'executing' | 'end'
  const [phase, setPhase] = useState('intro');
  const [moveIndex, setMoveIndex] = useState(0);

  const audioStepRef = useRef(0);
  const prevWaitingRef = useRef(false);
  const openRef = useRef(null);

  const eventZone = sessionStorage.getItem('eventZone');
  const { displayText, waiting, addLog, advance, onQueueEmpty } = useBattleLog();
  const { play, stop } = useBgm();
  const { playerHp, enemyHp, executeTurn } = useBattle({ player: currentPokemon, enemy, addLog });

  useEffect(() => {
    play(battleBgm, 0.2);
    openRef.current.start();
    return () => stop();
  }, []);

  // 인트로: 처음 2개 메시지 자동 진행
  useEffect(() => {
    if (!waiting || audioStepRef.current >= 2) return;
    const timer = setTimeout(() => advance(), 1500);
    return () => clearTimeout(timer);
  }, [waiting, advance]);

  // waiting true→false: step 증가 + 플레이어 등장
  useEffect(() => {
    if (prevWaitingRef.current && !waiting) {
      if (audioStepRef.current === 0) {
        setShowPlayer(true);
        playAudio(currentPokemon?.cryUrl);
      }
      audioStepRef.current += 1;
    }
    prevWaitingRef.current = waiting;
  }, [waiting, currentPokemon]);

  // "무엇을 할까?" 대기 상태 → select 전환
  useEffect(() => {
    if (waiting && phase === 'intro' && audioStepRef.current >= 2) {
      setPhase('select');
    }
  }, [waiting, phase]);

  // 포켓몬 fetch + 인트로 로그
  useEffect(() => {
    const sessionMyPokemon = sessionStorage.getItem('isMyPokemon');
    const myPokemon = sessionMyPokemon ? JSON.parse(sessionMyPokemon) : [];
    const avgLevel = myPokemon.length
      ? myPokemon.reduce((sum, p) => sum + p.level, 0) / myPokemon.length
      : 1;

    const fetchPokemon = async () => {
      try {
        const data = await postBattlePokemon({ eventZone, avgLevel });
        setEnemy(data);
        if (myPokemon[0]) {
          setCurrentPokemon(myPokemon[0]);
          addLog(`야생 ${data.name}이(가) 나타났다!`);
          playAudio(data.cryUrl);
          addLog(`가랏! ${myPokemon[0].name}!`);
          addLog('무엇을 할까?');
        }
      } catch (error) {
        console.error('Error fetching Pokémon:', error);
      }
    };

    fetchPokemon();
  }, [addLog, eventZone]);

  const handleMoveSelect = (idx) => {
    const result = executeTurn(idx);
    advance(); // "무엇을 할까?" dismiss
    setPhase('executing');

    onQueueEmpty(() => {
      if (result === 'continue') {
        addLog('무엇을 할까?');
        setPhase('select');
      } else {
        setPhase('end');
        onQueueEmpty(() => navigate('/map'));
      }
    });
  };

  const bg = eventZoneCheck(eventZone);

  return (
    <div>
      <OpenTransition ref={openRef} />
      <div
        className={styles.wrap_battle}
        style={{
          backgroundImage: `url(/src/assets/images/battle_images/${bg}_bg.png)`,
          height: '554px',
        }}
      >
        {enemy && (
          <Pokemon pokemon={enemy} eventZone={bg} isEnemy={true} currentHp={enemyHp} />
        )}
        {showPlayer && (
          <Pokemon pokemon={currentPokemon} eventZone={bg} isEnemy={false} currentHp={playerHp} />
        )}
      </div>

      <div style={{ display: 'flex', width: '1080px' }}>
        {phase === 'select' ? (
          <>
            <LogComponent displayText={displayText} waiting={waiting} />
            <MovePanel
              moves={currentPokemon?.moves}
              moveIndex={moveIndex}
              onMove={setMoveIndex}
              onSelect={handleMoveSelect}
            />
          </>
        ) : (
          <ManualLogComponent
            displayText={displayText}
            waiting={waiting}
            advance={advance}
          />
        )}
      </div>
    </div>
  );
}
