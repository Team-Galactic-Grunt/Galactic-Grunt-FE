import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import HelpComponent from '../components/HelpComponent';
import styles from './defaultLayout.module.css';

export default function DefaultLayout() {
  const [showHelp, setShowHelp] = useState(false);
  useEffect(() => {
    if (!showHelp) return;

    const blockKeys = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener('keydown', blockKeys, true);
    return () => window.removeEventListener('keydown', blockKeys, true);
  }, [showHelp]);
  return (
    <>
      {showHelp && <HelpComponent />}
      <div className={styles.wrap}>
        <button
          className={styles.helpBtn}
          onClick={() => setShowHelp(!showHelp)}
        ></button>

        <div className={styles.wrap_outlet}>
          <Outlet />
        </div>
      </div>
    </>
  );
}
