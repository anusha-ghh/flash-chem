// let DOM load
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login_form");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const user = document.getElementById("username").value;
        const pass = document.getElementById("password").value;

        // credentials
        if (user === "asiatic" && pass === "amulet") {
            window.location.href = "usersets.html"; // move to next page
        } else {
            alert("Invalid username or password!"); // show error message
        }
    });
});
