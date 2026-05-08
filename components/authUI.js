// Function to hide/show auth buttons on index/frontpage

// Import function to get saved token from localStorage
import { getToken } from "../utils/storage.js";

document.addEventListener("DOMContentLoaded", () => {
  const token = getToken();
  // Select login/register button container
  const authButtons = document.getElementById("auth-buttons");

  // Hide auth buttons if token exists
  if (token && authButtons) {
    authButtons.classList.add("is-hidden");
  }
});
