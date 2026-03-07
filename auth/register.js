// Connects register-form and sends data to registerUser-function
import { registerUser } from "./auth.js";

document.getElementById("register-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  registerUser(username, email, password);
});
