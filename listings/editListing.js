// Import API config, token and spinner
import { apiBaseUrl, apiKey } from "../api/config.js";
import { getToken } from "../utils/storage.js";
import { showSpinner, hideSpinner } from "../utils/spinner.js";

// Get listing id from URL
const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

// Select form elements
const form = document.getElementById("edit-listing-form");
const message = document.getElementById("edit-listing-message");
const deleteButton = document.getElementById("listing-delete-button");

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

// Fetch listing data from API
async function fetchListing(id) {
  clearMessage();

  if (!id) {
    showError("Missing listing id.");
    return null;
  }

  showSpinner();

  try {
    const response = await fetch(`${apiBaseUrl}/auction/listings/${id}`);

    if (!response.ok) {
      throw new Error("Could not fetch listing");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(error);
    showError("Could not load listing.");
    return null;
  } finally {
    hideSpinner();
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
  clearMessage();

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

  showSpinner();

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

    showSuccess("Listing updated successfully.");

    // Redirect to single listing page
    window.location.href = `/listings/listingSingle.html?id=${listingId}`;
  } catch (error) {
    console.error(error);
    showError("Could not update listing.");
  } finally {
    hideSpinner();
  }
});

// Handle delete button
deleteButton.addEventListener("click", async () => {
  clearMessage();

  const token = getToken();

  if (!token) {
    window.location.href = "/auth/login.html";
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to delete this listing?"
  );

  if (!confirmed) return;

  showSpinner();

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
    showError("Could not delete listing.");
  } finally {
    hideSpinner();
  }
});

// Initialize page
(async function init() {
  const listing = await fetchListing(listingId);
  populateForm(listing);
})();
