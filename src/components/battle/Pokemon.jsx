import React, { useState } from 'react';
import styles from './pokemon.module.css';

export default function Pokemon({ pokemon, eventZone, isEnemy }) {
  //   console.log('Pokemon component received props:', {
  //     pokemon,
  //     eventZone,
  //     isEnemy,
  //   });
  const [currentHp, setPokemonHp] = useState(pokemon?.baseStats?.hp || 0);

  return (
    <div
      className={`${isEnemy ? styles.stage_enemy : styles.stage_player} ${styles.stage}`}
    >
      <div
        className={`${styles.status} ${isEnemy ? styles.enemy_status : styles.player_status}`}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div>{pokemon?.name}</div>
          <div>Lv. {pokemon?.level}</div>
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
                width: `${(currentHp / pokemon?.baseStats?.hp) * 100}%`,
                height: '100%',
                backgroundColor: 'green',
              }}
            ></div>
          </div>
        </div>

        {!isEnemy && (
          <div
            style={{
              textAlign: 'right',
              lineHeight: '20px',
              wordSpacing: '-5px',
              fontWeight: 'bold',
            }}
          >
            {currentHp} / {pokemon?.baseStats?.hp || 0}
          </div>
        )}
      </div>
      <div
        style={{
          //   border: '1px solid yellow',
          width: '300px',
          height: '300px',
          position: 'relative',
        }}
      >
        <div
          className={`${styles.pokemon} ${isEnemy ? styles.enemy_pokemon : styles.player_pokemon}`}
          style={{
            backgroundImage: `url(${isEnemy ? pokemon?.frontSprite : pokemon?.backSprite})`,
          }}
        ></div>
        <div
          className={`${styles.ground} ${isEnemy ? styles.enemy_ground : styles.player_ground}`}
          style={{
            backgroundImage: `url(/src/assets/images/battle_images/${isEnemy ? `${eventZone}_enemy_stage` : `${eventZone}_stage`}.png)`,
          }}
        />
      </div>
    </div>
  );
}
