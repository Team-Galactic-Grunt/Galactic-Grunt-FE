import axios from 'axios';

export const postBattlePokemon = async ({ eventZone, avgLevel, pokemonId }) => {
  console.log('Posting battle Pokémon with:', {
    eventZone,
    avgLevel,
    pokemonId,
  });
  try {
    const response = await axios.post(
      // 'http://localhost:3000/api/postBattlePokemon',
      'https://galactic-gruent-be.vercel.app/api/postBattlePokemon',
      { eventZone, avgLevel, pokemonId },
    );
    console.log('Fetched Pokémon:', response);
    return response.data.result;
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
    return [];
  }
};
