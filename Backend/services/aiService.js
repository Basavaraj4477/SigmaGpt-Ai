const axios = require("axios");

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

const generateAIResponse = async (messages) => {
    try {
        const response = await axios.post(
            `${OLLAMA_URL}/api/chat`,
            {
                model: OLLAMA_MODEL,
                messages,
                stream: false,
                options: {
                    temperature: 0.7
                }
            },
            {
                timeout: 120000
            }
        );

        return response.data?.message?.content?.trim() || "I couldn't generate a response.";
    } catch (error) {
        console.error(
            "AI Service Error:",
            error.response?.data || error.message
        );

        throw new Error(
            "AI service is unavailable. Make sure Ollama is running with the configured model."
        );
    }
};

module.exports = generateAIResponse;
