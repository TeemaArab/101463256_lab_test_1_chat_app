
require('dotenv').config({ path: './backend/.env' });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIO = require("socket.io");
const http = require("http");
const authRoutes = require("./routes/authRoutes");
const GroupMessage = require('./models/GroupMessage');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "http://127.0.0.1:5501", // Frontend URL
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Sample route
app.get("/", (req, res) => {
    res.send("Chat Server is running...");
});

// Socket.io connection
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", async ({ room }) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);

        try {
            const messages = await GroupMessage.find({ room })
                .sort({ timestamp: -1 })
                .limit(10);
            socket.emit("previousMessages", messages.reverse());
        } catch (error) {
            console.error("Error fetching messages:", error);
        }

        socket.to(room).emit("message", { message: "A new user joined the room!" });
    });

    // Typing indicator events
    socket.on("typing", ({ room, username }) => {
        socket.to(room).emit("userTyping", { username });
    });

    socket.on("stopTyping", ({ room }) => {
        socket.to(room).emit("userStoppedTyping");
    });

    socket.on("chatMessage", async ({ room, username, message }) => {
        try {
            const newMessage = new GroupMessage({ room, username, message, timestamp: new Date() });
            await newMessage.save();
            io.to(room).emit("message", { username, message, timestamp: new Date() });
        } catch (error) {
            console.error("Error saving message:", error);
        }
    });

    socket.on("leaveRoom", ({ room }) => {
        socket.leave(room);
        console.log(`User left room: ${room}`);
        socket.to(room).emit("message", { message: "A user has left the room!" });
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

// Use routes
app.use("/api/auth", authRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
