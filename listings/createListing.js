// Import API config and token
import { apiBaseUrl, apiKey } from "../api/config.js";
import { getToken } from "../utils/storage.js";

// Select form elements
const form = document.getElementById("create-listing-form");
const message = document.getElementById("create-listing-message");

// Handle form submit
form.addEventListener("submit", async (event) => {
  event.preventDefault();

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
    ? imageUrl.split(",").map((url) => ({
        url: url.trim(),
        alt: "Listing image",
      }))
    : [];

  // Convert datetime-local value to ISO string
  const endsAt = new Date(endsAtInput).toISOString();

  // Build request body
  const listingData = {
    title,
    description,
    tags,
    media,
    endsAt,
  };

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

    if (!response.ok) {
      throw new Error("Could not create listing");
    }

    const result = await response.json();

    message.textContent = "Listing created successfully.";
    message.className = "text-success";

    // Redirect to single listing page
    window.location.href = `/listings/listingSingle.html?id=${result.data.id}`;
  } catch (error) {
    console.error(error);
    message.textContent = "Could not create listing.";
    message.className = "text-danger";
  }
});
