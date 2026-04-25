// Import API config, token, username and spinner
import { apiBaseUrl, apiKey } from "../api/config.js";
import { getToken, getUsername } from "../utils/storage.js";
import { showSpinner, hideSpinner } from "../utils/spinner.js";

// Get current username and token
const username = getUsername();
const token = getToken();

// Select form elements
const profileForm = document.getElementById("profile-form");
const bioInput = document.getElementById("profile-bio-input");
const avatarInput = document.getElementById("profile-avatar-input");
const bannerInput = document.getElementById("profile-banner-input");
const message = document.getElementById("profile-message");

// Reset message
function clearMessage() {
  if (message) {
    message.textContent = "";
    message.className = "form-message";
  }
}

// Show error message
function showError(text) {
  if (message) {
    message.textContent = text;
    message.className = "form-message form-message--error";
  }
}

// Show success message
function showSuccess(text) {
  if (message) {
    message.textContent = text;
    message.className = "form-message form-message--success";
  }
}

// Fetch profile data from API
async function fetchProfileData(name) {
  clearMessage();
  showSpinner();

  try {
    const response = await fetch(`${apiBaseUrl}/auction/profiles/${name}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error("Could not fetch profile");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(error);
    showError("Could not load profile.");
    return null;
  } finally {
    hideSpinner();
  }
}

// Fill form with existing profile data
function populateForm(profile) {
  if (!profile) return;

  bioInput.value = profile.bio || "";
  avatarInput.value = profile.avatar?.url || "";
  bannerInput.value = profile.banner?.url || "";
}

// Handle profile form submit
profileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  if (!token || !username) {
    window.location.href = "/auth/login.html";
    return;
  }

  const bio = bioInput.value.trim();
  const avatarUrl = avatarInput.value.trim();
  const bannerUrl = bannerInput.value.trim();

  // Build request body
  const profileData = {};

  if (bio) {
    profileData.bio = bio;
  }

  if (avatarUrl) {
    profileData.avatar = {
      url: avatarUrl,
      alt: "Profile avatar",
    };
  }

  if (bannerUrl) {
    profileData.banner = {
      url: bannerUrl,
      alt: "Profile banner",
    };
  }

  showSpinner();

  try {
    const response = await fetch(`${apiBaseUrl}/auction/profiles/${username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
      body: JSON.stringify(profileData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.errors?.[0]?.message || "Could not update profile"
      );
    }

    showSuccess("Profile updated successfully.");

    window.location.href = "/profile/profile.html";
  } catch (error) {
    console.error(error);
    showError(error.message || "Could not update profile.");
  } finally {
    hideSpinner();
  }
});

// Initialize page
(async function init() {
  if (!token || !username) {
    window.location.href = "/auth/login.html";
    return;
  }

  const profile = await fetchProfileData(username);
  populateForm(profile);
})();
