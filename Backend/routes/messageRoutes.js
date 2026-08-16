const express = require("express");

const Message = require("../models/Message");
const Chat = require("../models/Chat");
const authMiddleware = require("../middleware/authMiddleware");
const generateAIResponse = require("../services/aiService");

const router = express.Router();

const MAX_HISTORY = 30;
const MAX_MESSAGE_LENGTH = 10000;

const createTitle = (text) => {
    const cleanText = text
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^["'`]+|["'`]+$/g, "");

    if (!cleanText) {
        return "New Chat";
    }

    return cleanText.length > 42
        ? `${cleanText.slice(0, 42).trim()}...`
        : cleanText;
};

// SEND MESSAGE + AI RESPONSE
router.post("/:chatId", authMiddleware, async (req, res) => {
    try {
        const content = typeof req.body.content === "string"
            ? req.body.content.trim()
            : "";

        if (!content) {
            return res.status(400).json({
                message: "Please provide a message"
            });
        }

        if (content.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({
                message: `Message is too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`
            });
        }

        const chat = await Chat.findOne({
            _id: req.params.chatId,
            user: req.user._id
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }

        const previousMessages = await Message.find({
            chat: chat._id
        })
            .sort({ createdAt: -1 })
            .limit(MAX_HISTORY);

        previousMessages.reverse();

        const aiMessages = [
            {
                role: "system",
                content:
                    "You are SigmaGPT, a helpful, clear and friendly AI assistant. " +
                    "Answer accurately and concisely. Use plain text and readable structure. " +
                    "When explaining code, include the code directly in your response."
            },
            ...previousMessages.map((message) => ({
                role: message.role,
                content: message.content
            })),
            {
                role: "user",
                content
            }
        ];

        const userMessage = await Message.create({
            chat: chat._id,
            role: "user",
            content
        });

        const aiResponse = await generateAIResponse(aiMessages);

        const assistantMessage = await Message.create({
            chat: chat._id,
            role: "assistant",
            content: aiResponse
        });

        if (chat.title === "New Chat") {
            chat.title = createTitle(content);
        }

        chat.updatedAt = new Date();
        await chat.save();

        res.status(201).json({
            message: "Message sent successfully",
            userMessage,
            assistantMessage,
            chat
        });

    } catch (error) {
        console.error("Message error:", error);

        res.status(500).json({
            message: error.message || "Failed to process message"
        });
    }
});

// GET ALL MESSAGES FROM CHAT
router.get("/:chatId", authMiddleware, async (req, res) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.chatId,
            user: req.user._id
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }

        const messages = await Message.find({
            chat: chat._id
        }).sort({
            createdAt: 1
        });

        res.status(200).json({
            messages
        });

    } catch (error) {
        console.error("Get messages error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
