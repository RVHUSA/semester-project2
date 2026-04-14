// Import API config and token
import { apiBaseUrl, apiKey } from "../api/config.js";
import { getToken } from "../utils/storage.js";

// Get listing id from URL
const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

// Select form elements
const form = document.getElementById("edit-listing-form");
const message = document.getElementById("edit-listing-message");
const deleteButton = document.getElementById("listing-delete-button");

// Fetch listing data from API
async function fetchListing(id) {
  if (!id) {
    message.textContent = "Missing listing id.";
    message.className = "text-danger";
    return null;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/auction/listings/${id}`);

    if (!response.ok) {
      throw new Error("Could not fetch listing");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(error);
    message.textContent = "Could not load listing.";
    message.className = "text-danger";
    return null;
  }
}

// Fill form with existing listing data
function populateForm(listing) {
  if (!listing) return;

  document.getElementById("title").value = listing.title || "";
  document.getElementById("description").value = listing.description || "";
  document.getElementById("tags").value = listing.tags?.join(", ") || "";
  document.getElementById("image-url").value =
    listing.media?.map((item) => item.url).join(", ") || "";
}

// Handle form submit
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const token = getToken();

  if (!token) {
    window.location.href = "/auth/login.html";
    return;
  }

  // Get updated values
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const tagsInput = document.getElementById("tags").value.trim();
  const imageUrl = document.getElementById("image-url").value.trim();

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

  // Build request body
  const updatedListing = {
    title,
    description,
    tags,
    media,
  };

  try {
    const response = await fetch(
      `${apiBaseUrl}/auction/listings/${listingId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
        body: JSON.stringify(updatedListing),
      }
    );

    if (!response.ok) {
      throw new Error("Could not update listing");
    }

    message.textContent = "Listing updated successfully.";
    message.className = "text-success";

    // Redirect to single listing page
    window.location.href = `/listings/listingSingle.html?id=${listingId}`;
  } catch (error) {
    console.error(error);
    message.textContent = "Could not update listing.";
    message.className = "text-danger";
  }
});

// Handle delete button
deleteButton.addEventListener("click", async () => {
  const token = getToken();

  if (!token) {
    window.location.href = "/auth/login.html";
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to delete this listing?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${apiBaseUrl}/auction/listings/${listingId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Could not delete listing");
    }

    window.location.href = "/index.html";
  } catch (error) {
    console.error(error);
    message.textContent = "Could not delete listing.";
    message.className = "text-danger";
  }
});

// Initialize page
(async function init() {
  const listing = await fetchListing(listingId);
  populateForm(listing);
})();
