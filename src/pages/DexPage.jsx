import React, { useState, useEffect } from 'react';

export default function DexPage() {
  const [dexList, setDexList] = useState([]);

  useEffect(() => {
    async function fetchDexList() {
      const response = await fetch(
        // 'https://galactic-gruent-be.vercel.app/api/getPokemonDex',
        'http://localhost:3000/api/getPokemonDex',
      );
      const data = await response.json();
      console.log('Fetched Dex List:', data.data);
      setDexList(data.data);
    }
    fetchDexList();
  }, []);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
      {dexList.map((pokemon) => (
        <div key={pokemon.id} style={{ width: '80px' }}>
          <img src={pokemon.frontSprite} alt={pokemon.name} />
          <h3
            style={{
              fontFamily: 'pokemon_font',
              textAlign: 'center',
              margin: 0,
            }}
          >
            {pokemon.watch === false ? '???' : pokemon.name}
          </h3>
        </div>
      ))}
    </div>
  );
}
