import React from 'react';
import { Outlet } from 'react-router';
import styles from './defaultLayout.module.css';

export default function DefaultLayout() {
  return (
    <div className={styles.wrap}>
      <div className={styles.wrap_outlet}>
        <Outlet />
      </div>
    </div>
  );
}
