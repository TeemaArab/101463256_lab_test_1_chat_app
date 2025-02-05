
require('dotenv').config({ path: './backend/.env' });


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIO = require("socket.io");
const http = require("http");
const authRoutes = require("./routes/authRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// this our Middleware
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGO_URI;
console.log('Mongo URI:', mongoUri); // Debugging step
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));


// Sample Route
app.get("/", (req, res) => {
    res.send("Chat Server is running...");
});

// Socket.io connection
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", ({ room }) => {
        socket.join(room);
        socket.to(room).emit("message", { message: "A new user joined the room!" });
    });

    socket.on("chatMessage", ({ room, message }) => {
        io.to(room).emit("message", { message });
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

// Use Routes
app.use("/api/auth", authRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
