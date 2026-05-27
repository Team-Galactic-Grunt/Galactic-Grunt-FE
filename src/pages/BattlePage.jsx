import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './battlePage.module.css';
import { postBattlePokemon } from '../api/postBattlePokemon';

export default function BattlePage() {
  const [enemy, setEnemy] = useState(null);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const eventZone = sessionStorage.getItem('eventZone');
  const sessionMyPokemon = sessionStorage.getItem('isMyPokemon');
  const myPokemon = sessionMyPokemon ? JSON.parse(sessionMyPokemon) : [];
  const avgLevel = myPokemon.length
    ? myPokemon.reduce((sum, pokemon) => sum + pokemon.level, 0) /
      myPokemon.length
    : 1;

  useEffect(() => {
    // console.log('Event Zone:', eventZone);
    // console.log('My Pokémon:', myPokemon);
    // console.log('Average Level:', avgLevel);
    const fetchPokemon = async () => {
      try {
        const data = await postBattlePokemon({ eventZone, avgLevel });
        // console.log(data);
        setEnemy(data);
        setCurrentPokemon(myPokemon[0] || null);
      } catch (error) {
        console.error('Error fetching Pokémon:', error);
      }
    };

    fetchPokemon();
  }, []);
  return (
    <div>
      <div className={styles.wrap_battle}></div>
      <div
        style={{
          backgroundImage: `url(${enemy?.frontSprite})`,
          width: '200px',
          height: '200px',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      ></div>
      <div>
        lv. {enemy?.lv} {enemy?.name}
      </div>
      <div
        style={{
          backgroundImage: `url(${currentPokemon?.backSprite})`,
          width: '200px',
          height: '200px',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      ></div>
      <div>
        lv. {currentPokemon?.level} {currentPokemon?.name}
      </div>
    </div>
  );
}
