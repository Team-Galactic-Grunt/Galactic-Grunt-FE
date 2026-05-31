import { useEffect, useState } from 'react';
import styles from './pokemon.module.css';

export default function Pokemon({ eventZone }) {
  const [currentPokemon, setCurrentPokemon] = useState(() =>
    JSON.parse(sessionStorage.getItem('currentPokemon') || 'null'),
  );

  useEffect(() => {
    const sync = () => {
      setCurrentPokemon(
        JSON.parse(sessionStorage.getItem('currentPokemon') || 'null'),
      );
    };
    window.addEventListener('currentPokemonUpdated', sync);
    return () => window.removeEventListener('currentPokemonUpdated', sync);
  }, [currentPokemon]);

  return (
    <div className={`${styles.stage_player} ${styles.stage}`}>
      <div className={`${styles.status} ${styles.player_status}`}>
        <div style={{ padding: '10px 20px' }}>
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div>{currentPokemon?.name}</div>
            <div>Lv. {currentPokemon?.level}</div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 'bold',
            }}
            className={styles.no_bold_font}
          >
            HP
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '10px',
                backgroundColor: 'gray',
                marginLeft: '20px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: `${((currentPokemon?.currentHp ?? 0) / (currentPokemon?.maxHp ?? 1)) * 100}%`,
                  height: '100%',
                  backgroundColor: 'green',
                }}
              ></div>
            </div>
          </div>

          <div
            style={{
              textAlign: 'right',
              lineHeight: '20px',
              wordSpacing: '-5px',
              fontWeight: 'bold',
            }}
          >
            {currentPokemon?.currentHp ?? 0} / {currentPokemon?.maxHp ?? 0}
          </div>
        </div>

        <div>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '8px',
              backgroundColor: 'lightgray',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: `${((currentPokemon?.currentExp ?? 0) / (currentPokemon?.needExp ?? 10000)) * 100}%`,
                height: '100%',
                backgroundColor: 'blue',
              }}
            ></div>
          </div>
        </div>
      </div>

      <div style={{ width: '300px', height: '300px', position: 'relative' }}>
        <div
          className={`${styles.pokemon} ${styles.player_pokemon}`}
          style={{ backgroundImage: `url(${currentPokemon?.backSprite})` }}
        ></div>
        <div
          className={`${styles.ground} ${styles.player_ground}`}
          style={{
            backgroundImage: `url(/src/assets/images/battle_images/${eventZone}_stage.png)`,
          }}
        />
      </div>
    </div>
  );
}
