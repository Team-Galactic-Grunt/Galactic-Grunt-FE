import axios from 'axios';

export const postReport = async ({
  position,
  bag,
  isMyPokemon,
  pokemonBox,
}) => {
  console.log(position, bag, isMyPokemon, pokemonBox);
  try {
    const response = await axios.post(
      'http://localhost:3000/api/postReport',
      // 'https://galactic-gruent-be.vercel.app/api/postReport',
      { position, bag, isMyPokemon, pokemonBox },
    );
    console.log('postReport result:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
    return [];
  }
};
