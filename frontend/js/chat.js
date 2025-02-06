
document.addEventListener("DOMContentLoaded", () => {
    const roomSelection = document.getElementById("roomSelection");
    const chatInterface = document.getElementById("chatInterface");
    const roomNameElement = document.getElementById("roomName");
    const usernameInput = document.getElementById("username");
    const roomInput = document.getElementById("room");
    const messageForm = document.getElementById("messageForm");
    const messageInput = document.getElementById("messageInput");
    const messagesDiv = document.getElementById("messages");
    const typingIndicator = document.getElementById("typingIndicator");

    const socket = io("http://localhost:5000");

    // Initially show only the room selection form
    roomSelection.style.display = "block";
    chatInterface.style.display = "none";

    // Handle Room Joining
    document.getElementById("roomForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const room = roomInput.value;

        if (!username || !room) {
            alert("Please enter a username and select a room.");
            return;
        }

        localStorage.setItem("username", username);
        localStorage.setItem("room", room);

        roomNameElement.textContent = `Room: ${room}`;
        roomSelection.style.display = "none"; // Hide the room selection
        chatInterface.style.display = "block"; // Show the chat interface

        socket.emit("joinRoom", { room, username });
    });

    // Handle Incoming Messages
    socket.on("message", ({ username, message }) => {
        const messageDiv = document.createElement("div");
        messageDiv.textContent = `${username}: ${message}`;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to the latest message
    });

    // Handle Typing Indicator
    let typingTimeout;
    let isTyping = false;

    messageInput.addEventListener("input", () => {
        if (!isTyping) {
            socket.emit("typing", {
                room: localStorage.getItem("room"),
                username: localStorage.getItem("username"),
            });
            isTyping = true;
        }

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit("stopTyping", {
                room: localStorage.getItem("room"),
                username: localStorage.getItem("username"),
            });
            isTyping = false;
        }, 1000);
    });

    socket.on("userTyping", ({ username }) => {
        typingIndicator.textContent = `${username} is typing...`;
        typingIndicator.style.display = "block";
    });

    socket.on("userStoppedTyping", () => {
        typingIndicator.style.display = "none";
    });

    // Handle Message Sending
    messageForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        const username = localStorage.getItem("username");
        const room = localStorage.getItem("room");

        if (message) {
            socket.emit("chatMessage", { room, username, message });
            messageInput.value = ""; // Clear the input field
        }
    });

    // Handle Room Leaving
    document.getElementById("leaveRoom").addEventListener("click", () => {
        const room = localStorage.getItem("room");
        socket.emit("leaveRoom", { room });
        localStorage.removeItem("username");
        localStorage.removeItem("room");
        chatInterface.style.display = "none";
        roomSelection.style.display = "block";
    });
});
