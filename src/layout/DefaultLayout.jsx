import React from 'react';
import { Outlet } from 'react-router';

export default function DefaultLayout() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#525252',
      }}
    >
      <Outlet />
    </div>
  );
}
