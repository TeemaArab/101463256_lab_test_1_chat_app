const socket = io("http://localhost:5000");

// Join Room
document.getElementById("roomForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const room = document.getElementById("room").value;
    localStorage.setItem("room", room); // Save the room in localStorage

    document.getElementById("currentRoom").innerText = `Room: ${room}`;
    document.getElementById("roomForm").style.display = "none";
    document.getElementById("chatInterface").style.display = "block";

    socket.emit("joinRoom", { room }); // Notify server of the room
});

// Send Message
document.getElementById("messageForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const message = document.getElementById("messageInput").value;
    const room = localStorage.getItem("room");

    socket.emit("chatMessage", { room, message }); // Send message to server
    document.getElementById("messageInput").value = ""; 
});

// Receive Message
socket.on("message", function (data) {
    const messageDiv = document.createElement("div");
    messageDiv.textContent = data.message;
    document.getElementById("messages").appendChild(messageDiv);
});
