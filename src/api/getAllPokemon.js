import axios from 'axios';

export const getAllPokemon = async () => {
  try {
    const response = await axios.get(
      //   'http://localhost:3000/api/getAllPokemon',
      'https://galactic-gruent-be.vercel.app/api/getAllPokemon',
    );
    console.log('Fetched Pokémon:', response.data.result);
    return response.data.result;
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
    return [];
  }
};
