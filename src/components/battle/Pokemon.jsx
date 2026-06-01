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
              marginBottom: '5px',
            }}
          >
            <div>{currentPokemon?.name}</div>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  color: '#555',
                  width: '20px',
                  fontSize: '10px',
                  textShadow:
                    '-0.2px -0.2px 0 #555, 0.2px -0.2px 0 #555, -0.2px 0.2px 0 #555, 0.2px 0.2px 0 #555',
                }}
              >
                Lv
              </span>
              <span
                style={{
                  display: 'inline-block',
                  color: '#555',
                }}
              >
                {currentPokemon?.level}
              </span>
            </div>
          </div>

          <div className={styles.wrap_bar}>
            <span className={styles.hp_font}>HP</span>

            <div className={styles.bar_base}>
              <div
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: `${((currentPokemon?.currentHp ?? 0) / (currentPokemon?.maxHp ?? 1)) * 100}%`,
                  backgroundColor: `${(currentPokemon?.currentHp ?? 0) / (currentPokemon?.maxHp ?? 1) > 0.5 ? '#5ce74c' : (currentPokemon?.currentHp ?? 0) / (currentPokemon?.maxHp ?? 1) > 0.2 ? '#f5a623' : '#d0021b'}`,
                }}
              ></div>
            </div>
          </div>

          <div
            style={{
              textAlign: 'right',
              lineHeight: '20px',
              wordSpacing: '-5px',
              fontSize: '12px',
              marginTop: '5px',
              color: '#555',
              textShadow:
                '-0.2px -0.2px 0 #555, 0.2px -0.2px 0 #555, -0.2px 0.2px 0 #555, 0.2px 0.2px 0 #555',
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
                backgroundColor: 'skyblue',
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
