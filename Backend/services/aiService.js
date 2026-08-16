const axios = require("axios");

const OLLAMA_CLOUD_URL = "https://ollama.com/api/chat";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gpt-oss:20b";

const generateAIResponse = async (messages) => {
    try {
        if (!process.env.OLLAMA_API_KEY) {
            throw new Error("OLLAMA_API_KEY is not configured");
        }

        const response = await axios.post(
            OLLAMA_CLOUD_URL,
            {
                model: OLLAMA_MODEL,
                messages,
                stream: false,
                options: {
                    temperature: 0.7
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 120000
            }
        );

        const content = response.data?.message?.content?.trim();

        if (!content) {
            throw new Error("Ollama returned an empty response");
        }

        return content;
    } catch (error) {
        console.error(
            "AI Service Error:",
            error.response?.data || error.message
        );

        throw new Error(
            "AI service is unavailable. Please try again later."
        );
    }
};

module.exports = generateAIResponse;