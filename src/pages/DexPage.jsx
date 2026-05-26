import { useEffect, useState } from 'react';
import { loadAdminState } from '../admin/adminStorage';

export default function DexPage() {
  const [dex, setDex] = useState(() => loadAdminState().dex);

  useEffect(() => {
    const syncDex = () => {
      setDex(loadAdminState().dex);
    };

    syncDex();
    window.addEventListener('storage', syncDex);
    window.addEventListener('focus', syncDex);

    return () => {
      window.removeEventListener('storage', syncDex);
      window.removeEventListener('focus', syncDex);
    };
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>DexPage</h1>

      {dex.length === 0 ? (
        <div>도감 데이터가 없습니다.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          {dex.map((pokemon) => (
            <div
              key={pokemon.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 12,
              }}
            >
              <div>
                <strong>#{pokemon.id}</strong> {pokemon.name}
              </div>
              <div>{pokemon.unlocked ? 'Unlocked' : 'Locked'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
