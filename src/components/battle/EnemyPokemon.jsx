import { useEffect, useState } from 'react';
import styles from './pokemon.module.css';

export default function EnemyPokemon({ eventZone }) {
  const [enemyPokemon, setEnemyPokemon] = useState(() =>
    JSON.parse(sessionStorage.getItem('enemyPokemon') || 'null'),
  );
  const [catchSprite, setCatchSprite] = useState(null); // 볼 던질 때 이미지 교체

  useEffect(() => {
    const sync = () => {
      setEnemyPokemon(
        JSON.parse(sessionStorage.getItem('enemyPokemon') || 'null'),
      );
    };
    const onCatch = (e) =>
      setCatchSprite(`/src/assets/images/bag_images/${e.detail.id}.png`);
    const onRelease = () => setCatchSprite(null);

    window.addEventListener('enemyPokemonUpdated', sync);
    window.addEventListener('catchAttempt', onCatch);
    window.addEventListener('catchRelease', onRelease);
    return () => {
      window.removeEventListener('enemyPokemonUpdated', sync);
      window.removeEventListener('catchAttempt', onCatch);
      window.removeEventListener('catchRelease', onRelease);
    };
  }, []);

  const maxHp = enemyPokemon?.maxHp ?? enemyPokemon?.baseStats?.hp ?? 1;
  const currentHp = enemyPokemon?.currentHp ?? maxHp;

  return (
    <div className={`${styles.stage_enemy} ${styles.stage}`}>
      <div
        className={`${styles.status} ${styles.enemy_status}`}
        style={{ padding: '10px 20px' }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '5px',
          }}
        >
          <div>{enemyPokemon?.name}</div>
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
              {enemyPokemon?.level}
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
                width: `${(currentHp / maxHp) * 100}%`,
                backgroundColor: `${currentHp / maxHp > 0.5 ? '#5ce74c' : currentHp / maxHp > 0.2 ? '#f5a623' : '#d0021b'}`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div style={{ width: '300px', height: '300px', position: 'relative' }}>
        <div
          className={`${styles.pokemon} ${styles.enemy_pokemon}`}
          style={{
            backgroundImage: `url(${catchSprite ?? enemyPokemon?.frontSprite})`,
          }}
        ></div>
        <div
          className={`${styles.ground} ${styles.enemy_ground}`}
          style={{
            backgroundImage: `url(/src/assets/images/battle_images/${eventZone}_enemy_stage.png)`,
          }}
        />
      </div>
    </div>
  );
}
