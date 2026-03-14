// Handles registration and login via API + spinner
import { saveToken, saveUser } from "../utils/storage.js";
import { apiBaseUrl } from "./config.js";
import { showSpinner, hideSpinner } from "../utils/spinner.js";

// Register a new user
export async function registerUser(username, email, password) {
  const errorMessage = document.getElementById("register-error");
  if (errorMessage) errorMessage.textContent = "";

  showSpinner();

  try {
    const response = await fetch(`${apiBaseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: username,
        email,
        password,
      }),
    });

    const data = await response.json();

    // If registration is successful redirect to login
    if (response.ok) {
      window.location.href = "./login.js";
    } else {
      if (errorMessage) {
        errorMessage.textContent =
          data.errors?.[0]?.message || "Unknown error occurred.";
      }
    }
  } catch (error) {
    console.error("Network error:", error);

    if (errorMessage) {
      errorMessage.textContent = "Network error. Please try again later.";
    }
  } finally {
    hideSpinner();
  }
}

// Log in existing user
export async function loginUser(email, password) {
  const errorMessage = document.getElementById("login-error");
  if (errorMessage) errorMessage.textContent = "";

  showSpinner();

  try {
    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // If login successful store token and user info
    if (response.ok) {
      saveToken(data.data.accessToken);
      saveUser(data.data);

      window.location.href = "/index.html";
    } else {
      if (errorMessage) {
        errorMessage.textContent =
          data.errors?.[0]?.message || "Unknown error occurred.";
      }
    }
  } catch (error) {
    console.error("Network error:", error);

    if (errorMessage) {
      errorMessage.textContent = "Network error. Please try again later.";
    }
  } finally {
    hideSpinner();
  }
}
