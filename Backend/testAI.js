const generateAIResponse = require("./services/aiService");

const testAI = async () => {
    try {
        const question = "Explain Java in very simple words";

        console.log("Sending question to AI...");
        console.log("Question:", question);

        const answer = await generateAIResponse(question);

        console.log("\nAI Response:");
        console.log(answer);

    } catch (error) {
        console.error("\nAI Test Failed:");
        console.error(error.message);
    }
};

testAI();