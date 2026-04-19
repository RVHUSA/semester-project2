// Import API config, token and spinner
import { apiBaseUrl, apiKey } from "../api/config.js";
import { getToken } from "../utils/storage.js";
import { showSpinner, hideSpinner } from "../utils/spinner.js";

// Select form elements
const form = document.getElementById("create-listing-form");
const message = document.getElementById("create-listing-message");

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

// Handle form submit
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const token = getToken();

  if (!token) {
    window.location.href = "/auth/login.html";
    return;
  }

  // Get values from form
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const tagsInput = document.getElementById("tags").value.trim();
  const imageUrl = document.getElementById("image-url").value.trim();
  const endsAtInput = document.getElementById("ends-at").value;

  // Convert comma-separated tags into array
  const tags = tagsInput
    ? tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  // Convert comma-separated image URLs into media array
  const media = imageUrl
    ? imageUrl
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url) => ({
          url,
          alt: "Listing image",
        }))
    : [];

  if (!endsAtInput) {
    showError("Please select an end date.");
    return;
  }

  const endsAtDate = new Date(endsAtInput);

  if (Number.isNaN(endsAtDate.getTime())) {
    showError("Please enter a valid end date.");
    return;
  }

  // Convert datetime-local value to ISO string
  const endsAt = endsAtDate.toISOString();

  // Build request body
  const listingData = {
    title,
    description,
    tags,
    media,
    endsAt,
  };

  showSpinner();

  try {
    const response = await fetch(`${apiBaseUrl}/auction/listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
      body: JSON.stringify(listingData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Create listing error:", data);
      throw new Error(data.errors?.[0]?.message || "Could not create listing");
    }

    showSuccess("Listing created successfully.");

    // Redirect to single listing page
    window.location.href = `/listings/listingSingle.html?id=${data.data.id}`;
  } catch (error) {
    console.error(error);
    showError(error.message || "Could not create listing.");
  } finally {
    hideSpinner();
  }
});
