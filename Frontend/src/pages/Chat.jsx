import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

function formatMessage(text) {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
        if (part.startsWith("```")) {
            const lines = part.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "");
            return (
                <pre className="code-block" key={index}>
                    <code>{lines.trim()}</code>
                </pre>
            );
        }

        return part.split("\n").map((line, lineIndex) => (
            <span key={`${index}-${lineIndex}`}>
                {line}
                {lineIndex < part.split("\n").length - 1 && <br />}
            </span>
        ));
    });
}

function Chat() {
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const getConfig = () => ({
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        loadChats();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, loading]);

    const loadChats = async () => {
        try {
            const response = await axios.get(
                `${API}/chats`,
                getConfig()
            );

            setChats(response.data.chats);
        } catch (err) {
            console.error("Load chats error:", err);
            setError("Unable to load your chats.");
        }
    };

    const createChat = async () => {
        try {
            setError("");

            const response = await axios.post(
                `${API}/chats`,
                {},
                getConfig()
            );

            const newChat = response.data.chat;

            setChats((prev) => [newChat, ...prev]);
            setCurrentChat(newChat);
            setMessages([]);
            setInput("");
            setSidebarOpen(false);

            setTimeout(() => textareaRef.current?.focus(), 100);
        } catch (err) {
            console.error("Create chat error:", err);
            setError(
                err.response?.data?.message ||
                "Unable to create a new chat."
            );
        }
    };

    const openChat = async (chat) => {
        try {
            setError("");

            const response = await axios.get(
                `${API}/chats/${chat._id}`,
                getConfig()
            );

            setCurrentChat(response.data.chat);
            setMessages(response.data.messages);
            setSidebarOpen(false);
        } catch (err) {
            console.error("Open chat error:", err);
            setError(
                err.response?.data?.message ||
                "Unable to open this chat."
            );
        }
    };

    const deleteChat = async (chatId) => {
        const confirmed = window.confirm(
            "Delete this chat permanently?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await axios.delete(
                `${API}/chats/${chatId}`,
                getConfig()
            );

            setChats((prev) =>
                prev.filter((chat) => chat._id !== chatId)
            );

            if (currentChat?._id === chatId) {
                setCurrentChat(null);
                setMessages([]);
            }
        } catch (err) {
            console.error("Delete chat error:", err);
            setError(
                err.response?.data?.message ||
                "Unable to delete this chat."
            );
        }
    };

    const sendMessage = async () => {
        const content = input.trim();

        if (!content || !currentChat || loading) {
            return;
        }

        setInput("");
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                `${API}/messages/${currentChat._id}`,
                { content },
                getConfig()
            );

            setMessages((prev) => [
                ...prev,
                response.data.userMessage,
                response.data.assistantMessage
            ]);

            if (response.data.chat) {
                setCurrentChat(response.data.chat);

                setChats((prev) =>
                    prev
                        .map((chat) =>
                            chat._id === response.data.chat._id
                                ? response.data.chat
                                : chat
                        )
                        .sort(
                            (a, b) =>
                                new Date(b.updatedAt) -
                                new Date(a.updatedAt)
                        )
                );
            }
        } catch (err) {
            console.error("Send message error:", err);

            setError(
                err.response?.data?.message ||
                "SigmaGPT could not process your message."
            );
        } finally {
            setLoading(false);

            setTimeout(() => {
                textareaRef.current?.focus();
            }, 50);
        }
    };

    const handleInput = (e) => {
        setInput(e.target.value);

        e.target.style.height = "auto";
        e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="chat-app">

            {sidebarOpen && (
                <button
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                />
            )}

            <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>

                <div className="sidebar-top">
                    <div className="logo">
                        <span className="logo-mark">✦</span>
                        <span>SigmaGPT</span>
                    </div>

                    <button
                        className="new-chat-btn"
                        onClick={createChat}
                    >
                        <span>＋</span>
                        New chat
                    </button>

                    <div className="history-title">
                        <span>Chats</span>
                        {chats.length > 0 && (
                            <span>{chats.length}</span>
                        )}
                    </div>

                    <div className="chat-list">
                        {chats.length === 0 ? (
                            <div className="no-chats">
                                Your conversations will appear here.
                            </div>
                        ) : (
                            chats.map((chat) => (
                                <div
                                    className={`chat-item-wrapper ${
                                        currentChat?._id === chat._id
                                            ? "active"
                                            : ""
                                    }`}
                                    key={chat._id}
                                >
                                    <button
                                        className="chat-item"
                                        onClick={() => openChat(chat)}
                                    >
                                        <span className="chat-item-icon">◦</span>
                                        <span>{chat.title}</span>
                                    </button>

                                    <button
                                        className="delete-chat-btn"
                                        onClick={() => deleteChat(chat._id)}
                                        title="Delete chat"
                                        aria-label={`Delete ${chat.title}`}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="sidebar-bottom">
                    <div className="user-info">
                        <div className="avatar">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>

                        <div className="user-details">
                            <strong>{user?.name || "User"}</strong>
                            <small>{user?.email || ""}</small>
                        </div>
                    </div>

                    <button
                        className="logout-btn"
                        onClick={logout}
                    >
                        <span>↪</span>
                        Log out
                    </button>
                </div>
            </aside>

            <main className="chat-main">

                <header className="chat-header">
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open sidebar"
                    >
                        ☰
                    </button>

                    <div className="header-title">
                        <span className="header-brand">SigmaGPT</span>
                        <span className="header-separator">/</span>
                        <span>
                            {currentChat?.title || "New conversation"}
                        </span>
                    </div>

                    <button
                        className="header-new-chat"
                        onClick={createChat}
                        title="New chat"
                    >
                        ＋
                    </button>
                </header>

                {error && (
                    <div className="error-banner">
                        <span>{error}</span>
                        <button onClick={() => setError("")}>×</button>
                    </div>
                )}

                <div className="messages">
                    {!currentChat && (
                        <div className="welcome">
                            <div className="welcome-icon">✦</div>

                            <h1>
                                How can I help you today?
                            </h1>

                            <p>
                                Ask SigmaGPT to explain, write, analyze, or brainstorm.
                            </p>

                            <div className="suggestion-grid">
                                <button
                                    onClick={() => {
                                        createChat();
                                        setInput("Explain Java OOP with an example");
                                    }}
                                >
                                    <strong>Learn</strong>
                                    <span>Explain Java OOP with an example</span>
                                </button>

                                <button
                                    onClick={() => {
                                        createChat();
                                        setInput("Give me 5 DSA interview questions");
                                    }}
                                >
                                    <strong>Practice</strong>
                                    <span>Give me 5 DSA interview questions</span>
                                </button>

                                <button
                                    onClick={() => {
                                        createChat();
                                        setInput("Help me build a React project");
                                    }}
                                >
                                    <strong>Build</strong>
                                    <span>Help me build a React project</span>
                                </button>

                                <button
                                    onClick={() => {
                                        createChat();
                                        setInput("Explain MongoDB in simple words");
                                    }}
                                >
                                    <strong>Understand</strong>
                                    <span>Explain MongoDB in simple words</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {currentChat && messages.length === 0 && (
                        <div className="empty-chat">
                            <div className="empty-chat-icon">✦</div>
                            <h2>Start a conversation</h2>
                            <p>
                                Ask SigmaGPT anything. Your conversation will be saved automatically.
                            </p>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message._id}
                            className={`message-row ${
                                message.role === "user"
                                    ? "user-row"
                                    : "assistant-row"
                            }`}
                        >
                            <div className="message-avatar">
                                {message.role === "user"
                                    ? user?.name?.charAt(0).toUpperCase() || "U"
                                    : "✦"}
                            </div>

                            <div className="message-content">
                                <div className="message-name">
                                    {message.role === "user"
                                        ? "You"
                                        : "SigmaGPT"}
                                </div>

                                <div className="message-text">
                                    {formatMessage(message.content)}
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="message-row assistant-row">
                            <div className="message-avatar">✦</div>

                            <div className="message-content">
                                <div className="message-name">
                                    SigmaGPT
                                </div>

                                <div className="typing-indicator">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="input-area">
                    <div className="input-box">
                        <textarea
                            ref={textareaRef}
                            placeholder={
                                currentChat
                                    ? "Message SigmaGPT..."
                                    : "Start a new chat to begin..."
                            }
                            value={input}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            disabled={!currentChat || loading}
                            rows={1}
                        />

                        <button
                            className="send-btn"
                            onClick={sendMessage}
                            disabled={
                                !currentChat ||
                                !input.trim() ||
                                loading
                            }
                            aria-label="Send message"
                        >
                            ↑
                        </button>
                    </div>

                    <div className="input-hint">
                        <span>Enter to send</span>
                        <span>Shift + Enter for a new line</span>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Chat;
