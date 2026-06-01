import axios from "axios";

export const postDex = async (body) => {
  console.log(body);
  try {
    await axios.post(
      "https://galactic-gruent-be.vercel.app/api/pokemonDexApi",
      body,
    );
    // console.log("get items:", response.data.data);
    // const result = response.data.data.bag;
    // return result;
  } catch (error) {
    console.error("Error saving pokedex:", error);
    throw error;
  }
};
