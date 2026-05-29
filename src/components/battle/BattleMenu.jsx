import React from 'react';

function BattleMenu() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'white',
        // padding: '20px',
        boxSizing: 'border-box',
        width: '200px',
        height: '166px',
      }}
    >
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          border: '5px solid gray',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>싸운다</div>
          <div>도감</div>
        </div>
        <div></div>
      </div>
    </div>
  );
}

export default BattleMenu;
