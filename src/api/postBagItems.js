import axios from "axios";

export const postBagItems = async (body) => {
  console.log(body);
  try {
    await axios.post(
      // "http://localhost:3000/api/getAllPokemon",
      "https://galactic-gruent-be.vercel.app/api/changeItemsApi",
      body,
    );
    // console.log("get items:", response.data.data);
    // const result = response.data.data.bag;
    // return result;
  } catch (error) {
    console.error("Error saving bagItems:", error);
    throw error;
  }
};
