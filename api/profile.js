// Import API settings and functions for handling user data
import { apiBaseUrl, apiKey } from "./config.js";
import { getToken, getUsername, saveUser } from "../utils/storage.js";

// Fetch the logged-in user's profile from the API
export async function fetchProfile() {
  const token = getToken();
  const username = getUsername();

  // If no token or username, user is not logged in
  if (!token || !username) return null;

  try {
    // Send request to fetch profile data
    const response = await fetch(`${apiBaseUrl}/auction/profiles/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error("Could not fetch profile");
    }

    const result = await response.json();

    // Save updated user data to localStorage
    saveUser(result.data);
    return result.data;
  } catch (error) {
    console.error("Profile fetch error:", error);
    return null;
  }
}
