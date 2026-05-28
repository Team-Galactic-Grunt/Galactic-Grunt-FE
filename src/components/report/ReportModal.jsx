import React, { useEffect } from 'react';
import styles from './menu.module.css';
import { postReport } from '../../api/postReport';

export default function ReportModal({ playerRef }) {
  // const position = sessionStorage.getItem('position')
  //   ? JSON.parse(sessionStorage.getItem('position'))
  //   : null;
  const bag = sessionStorage.getItem('bag')
    ? JSON.parse(sessionStorage.getItem('bag'))
    : null;
  const isMyPokemon = sessionStorage.getItem('isMyPokemon')
    ? JSON.parse(sessionStorage.getItem('isMyPokemon'))
    : null;
  const pokemonBox = sessionStorage.getItem('pokemonBox')
    ? JSON.parse(sessionStorage.getItem('pokemonBox'))
    : null;

  useEffect(() => {
    postReport({
      position: {
        x: playerRef.current.x,
        y: playerRef.current.y,
        direction: playerRef.current.direction,
      },
      bag,
      isMyPokemon,
      pokemonBox,
    });
  }, []);

  return (
    <div className={styles.menu}>
      <div>저장하시겠습니까?</div>
      <div>z: 예 x: 아니오</div>
    </div>
  );
}
