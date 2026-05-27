import axios from "axios";

export const getAllPokemon = async () => {
  try {
    const response = await axios.get(
      "https://galactic-gruent-be.vercel.app/api/getInitData",
    );
    console.log("Fetched Pokémon:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error fetching Pokémon:", error);
    return null;
  }
};
