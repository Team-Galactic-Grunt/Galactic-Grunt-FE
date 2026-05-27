import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './battlePage.module.css';
import { postBattlePokemon } from '../api/postBattlePokemon';

export default function BattlePage() {
  const [enemy, setEnemy] = useState(null);
  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const data = await postBattlePokemon();
        console.log(data);
        setEnemy(data);
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
      <div>{enemy?.koName}</div>
    </div>
  );
}
