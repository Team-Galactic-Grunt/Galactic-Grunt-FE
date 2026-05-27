import axios from 'axios';

export const postBattlePokemon = async () => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/postBattlePokemon',
      // 'https://galactic-gruent-be.vercel.app/api/postBattlePokemon',
    );
    console.log('Fetched Pokémon:', response);
    return response.data.result;
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
    return [];
  }
};
