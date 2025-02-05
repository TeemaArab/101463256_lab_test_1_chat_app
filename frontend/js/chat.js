document.addEventListener("DOMContentLoaded", () => {
    const socket = io("http://localhost:5000");

    const roomForm = document.getElementById("roomForm");
    const chatInterface = document.getElementById("chatInterface");
    const roomSelection = document.getElementById("roomSelection");
    const roomNameDisplay = document.getElementById("roomName");
    const messagesDiv = document.getElementById("messages");
    const messageForm = document.getElementById("messageForm");
    const messageInput = document.getElementById("messageInput");

    let username, room;

    // Join Room
    roomForm.addEventListener("submit", (e) => {
        e.preventDefault();
        username = document.getElementById("username").value.trim();
        room = document.getElementById("room").value;

        if (username && room) {
            localStorage.setItem("username", username);
            localStorage.setItem("room", room);

            roomNameDisplay.textContent = `Room name: ${room}`;
            roomSelection.style.display = "none";
            chatInterface.style.display = "block";

            socket.emit("joinRoom", { username, room });

        // Typing indicator event listeners
        const messageInput = document.getElementById("messageInput");
        let typing = false;
        let typingTimeout;
    
        messageInput.addEventListener("input", () => {
            if (!typing) {
                socket.emit("typing", { room, username });
                typing = true;
            }
    
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                socket.emit("stopTyping", { room, username });
                typing = false;
            }, 1000); // Stop typing after 1 second of inactivity
        });
    
    
    // Receive typing events
    socket.on("userTyping", ({ username }) => {
        const typingDiv = document.getElementById("typingIndicator");
        typingDiv.textContent = `${username} is typing...`;
        typingDiv.style.display = "block";
    });
    
    socket.on("userStoppedTyping", () => {
        const typingDiv = document.getElementById("typingIndicator");
        typingDiv.style.display = "none";
    });

            // Fetch previous messages
            socket.on("previousMessages", (messages) => {
                messagesDiv.innerHTML = "";
                messages.forEach(({ username, message }) => {
                    const messageDiv = document.createElement("div");
                    messageDiv.textContent = `${username}: ${message}`;
                    messagesDiv.appendChild(messageDiv);
                });
            });
        }
    });

    // Send Message
    messageForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();

        if (message) {
            socket.emit("chatMessage", { room, username, message });
            messageInput.value = ""; // Clear input
        }
    });

    // Receive new messages
    socket.on("message", ({ username, message }) => {
        const messageDiv = document.createElement("div");
        messageDiv.textContent = `${username}: ${message}`;
        messagesDiv.appendChild(messageDiv);
    });

    // Leave Room
    document.getElementById("leaveRoom").addEventListener("click", () => {
        socket.emit("leaveRoom", { room });
        localStorage.removeItem("room");
        chatInterface.style.display = "none";
        roomSelection.style.display = "block";
    });
});
