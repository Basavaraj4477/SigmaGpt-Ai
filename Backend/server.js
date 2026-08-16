const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// --------------------------------------------------
// Database
// --------------------------------------------------

connectDB();

// --------------------------------------------------
// API
// --------------------------------------------------

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "SigmaGPT API",
        ai: process.env.OLLAMA_MODEL || "llama3.2"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/protected", authMiddleware, (req, res) => {
    res.status(200).json({
        message: "You have access to this protected route!",
        user: req.user
    });
});

// --------------------------------------------------
// React production build
// --------------------------------------------------

const frontendPath = path.join(__dirname, "..", "Frontend", "dist");

app.use(express.static(frontendPath));

// Express 5-compatible SPA fallback.
// API requests that reach this point continue to the 404 handler.
app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
        return next();
    }

    res.sendFile(path.join(frontendPath, "index.html"));
});

// --------------------------------------------------
// 404
// --------------------------------------------------

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// --------------------------------------------------
// Error handler
// --------------------------------------------------

app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err);

    res.status(500).json({
        message: "Internal server error"
    });
});

// --------------------------------------------------
// Start
// --------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {
    console.log(`SigmaGPT server running on http://localhost:${PORT}`);
    console.log(`Open the frontend manually in your browser: http://localhost:${PORT}`);
});
