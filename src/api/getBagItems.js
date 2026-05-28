import axios from "axios";

export const getBagItems = async () => {
  try {
    const response = await axios.get(
      //   'http://localhost:3000/api/getAllPokemon',
      "https://galactic-gruent-be.vercel.app/api/changeItemsApi",
    );
    console.log("get items:", response.data.data);
    const result = response.data.data.bag;
    return result;
  } catch (error) {
    console.error("Error fetching Pokémon:", error);
    return [];
  }
};
