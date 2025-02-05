
// Handle form submission
$(document).ready(function () {
    $("#signupForm").on("submit", function (e) {
        e.preventDefault(); // Prevent page reload

        const userData = {
            username: $("#username").val(),
            firstname: $("#firstname").val(),
            lastname: $("#lastname").val(),
            password: $("#password").val(),
        };

        $.ajax({
            url: "http://localhost:5000/api/auth/signup",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(userData),
            success: function () {
                alert("Signup successful! Please login.");
                window.location.href = "login.html"; // Redirect to login page
            },
            error: function (xhr) {
                const error = xhr.responseJSON?.message || "Signup failed!";
                $("#error").text(error);
            },
        });
    });
});
