import { useEffect, useState } from 'react';
import styles from './pokemon.module.css';

export default function EnemyPokemon({ eventZone }) {
  const [enemyPokemon, setEnemyPokemon] = useState(
    () => JSON.parse(sessionStorage.getItem('enemyPokemon') || 'null'),
  );
  const [catchSprite, setCatchSprite] = useState(null); // 볼 던질 때 이미지 교체

  useEffect(() => {
    const sync = () => {
      setEnemyPokemon(JSON.parse(sessionStorage.getItem('enemyPokemon') || 'null'));
    };
    const onCatch = (e) => setCatchSprite(`/src/assets/images/bag_images/${e.detail.id}.png`);
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
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}
        >
          <div>{enemyPokemon?.name}</div>
          <div>Lv. {enemyPokemon?.level}</div>
        </div>

        <div
          style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
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
                width: `${(currentHp / maxHp) * 100}%`,
                height: '100%',
                backgroundColor: 'green',
              }}
            ></div>
          </div>
        </div>
      </div>

      <div style={{ width: '300px', height: '300px', position: 'relative' }}>
        <div
          className={`${styles.pokemon} ${styles.enemy_pokemon}`}
          style={{ backgroundImage: `url(${catchSprite ?? enemyPokemon?.frontSprite})` }}
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
