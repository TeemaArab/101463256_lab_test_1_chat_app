
//Handle login form submission
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent page reload

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    })
    .then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Invalid username or password.");
        }
    })
    .then((data) => {
        alert("Login successful!");
        localStorage.setItem("token", data.token); // Save token in localStorage
        window.location.href = "chat.html"; // Redirect to chat page
    })
    .catch((error) => {
        alert(error.message);
    });
});
