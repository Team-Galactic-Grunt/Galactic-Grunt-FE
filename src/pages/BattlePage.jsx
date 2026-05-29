import { useState, useEffect, useRef } from 'react';
import styles from './battlePage.module.css';
import { postBattlePokemon } from '../api/postBattlePokemon';
import { useBattleLog } from '../hooks/useBattleLog';
import { useBgm } from '../context/BgmContext';
import { battleBgm } from '../assets/bgm';
import LogComponent from '../components/LogComponent';
import Pokemon from '../components/battle/Pokemon';
import OpenTransition from '../components/animation/OpenTransition';

function eventZoneCheck(zone) {
  const backgroundUrl = zone === 'grass1' || zone === 'grass2' ? 'grass' : zone;
  return backgroundUrl;
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
  const [enemy, setEnemy] = useState(null);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const audioStepRef = useRef(0);
  const prevWaitingRef = useRef(false);
  const openRef = useRef(null);

  const eventZone = sessionStorage.getItem('eventZone');
  const { displayText, waiting, addLog, advance } = useBattleLog();
  const { play, stop } = useBgm();

  // 배틀 페이지 로드되면 바로 열기
  useEffect(() => {
    play(battleBgm, 0.2);
    openRef.current.start();
    return () => {
      stop();
    };
  }, []);

  // JSX

  // 인트로 메시지(야생..., 가랏!) 자동 진행
  useEffect(() => {
    if (!waiting || audioStepRef.current >= 2) return;
    const timer = setTimeout(() => advance(), 1500);
    return () => clearTimeout(timer);
  }, [waiting, advance]);

  // waiting true→false 전환마다 step 증가 + 플레이어 등장 처리
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

  return (
    <div>
      <OpenTransition ref={openRef} />
      <div
        className={styles.wrap_battle}
        style={{
          backgroundImage: `url(/src/assets/images/battle_images/${eventZoneCheck(eventZone)}_bg.png)`,
          height: '554px',
        }}
      >
        {enemy && (
          <Pokemon
            pokemon={enemy}
            eventZone={eventZoneCheck(eventZone)}
            isEnemy={true}
          />
        )}
        {showPlayer && (
          <Pokemon
            pokemon={currentPokemon}
            eventZone={eventZoneCheck(eventZone)}
            isEnemy={false}
          />
        )}
      </div>
      <LogComponent displayText={displayText} waiting={waiting} />
    </div>
  );
}
