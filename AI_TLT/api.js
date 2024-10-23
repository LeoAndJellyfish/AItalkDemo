// api.js
import axios from "axios";
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export const sendMessageToOpenAI = async (message) => {
  try {
    const response = await axios.post(
      "https://api.lingyiwanwu.com/v1/chat/completions",
      {
        model: "yi-lightning",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "Error retrieving response from OpenAI.";
  }
};
