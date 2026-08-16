const express = require("express");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ==============================
// CREATE NEW CHAT
// ==============================

router.post("/", authMiddleware, async (req, res) => {
    try {
        const chat = await Chat.create({
            user: req.user._id,
            title: "New Chat"
        });

        res.status(201).json({
            message: "Chat created successfully",
            chat
        });

    } catch (error) {
        console.error("Create chat error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ==============================
// GET ALL USER CHATS
// ==============================

router.get("/", authMiddleware, async (req, res) => {
    try {
        const chats = await Chat.find({
            user: req.user._id
        }).sort({
            updatedAt: -1
        });

        res.status(200).json({
            chats
        });

    } catch (error) {
        console.error("Get chats error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ==============================
// GET SINGLE CHAT WITH MESSAGES
// ==============================

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
            chat,
            messages
        });

    } catch (error) {
        console.error("Get chat error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ==============================
// DELETE CHAT
// ==============================

router.delete("/:chatId", authMiddleware, async (req, res) => {
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

        await Message.deleteMany({
            chat: chat._id
        });

        await Chat.findByIdAndDelete(chat._id);

        res.status(200).json({
            message: "Chat deleted successfully"
        });

    } catch (error) {
        console.error("Delete chat error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


module.exports = router;