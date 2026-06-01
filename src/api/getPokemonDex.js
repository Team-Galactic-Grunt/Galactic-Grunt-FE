import axios from "axios";
export const getPokemonDex = async () => {
  try {
    const response = await axios.get(
      "https://galactic-gruent-be.vercel.app/api/pokemonDexApi",
    );
    console.log("status:", response.status);
    console.log("get data:", response.data);
    const result = response.data.data;
    return result;
  } catch (error) {
    console.error("Error fetching PokemonDex status:", error.response?.status);
    console.error("Error fetching PokemonDex data:", error.response?.data);
    return [];
  }
};
