// Import API, token, listing card component and spinner
import { apiBaseUrl } from "../api/config.js";
import { getToken } from "../utils/storage.js";
import { createListingCard } from "../components/listingCard.js";
import { showSpinner, hideSpinner } from "../utils/spinner.js";

// Select the container where listings will be displayed
const listingsContainer = document.getElementById("listings-container");

// Select page elements (search, filter and status)
const searchInput = document.getElementById("listing-search");
const tagSelect = document.getElementById("listing-tag");
const statusSelect = document.getElementById("listing-status");
const createListingButton = document.getElementById("create-listing-button");

// Show create listing button only for logged-in users
const token = getToken();

if (token) {
  createListingButton.classList.remove("is-hidden");
} else {
  createListingButton.classList.add("is-hidden");
}

// Fetch listings from API based on current search and filter values
async function fetchListings() {
  showSpinner();

  const searchValue = searchInput.value.trim();
  const tagValue = tagSelect.value;
  const statusValue = statusSelect.value;

  let url = "";

  // Use search endpoint when search input has a value
  if (searchValue) {
    url = `${apiBaseUrl}/auction/listings/search?q=${encodeURIComponent(
      searchValue
    )}`;

    if (statusValue === "true") {
      url += `&_active=true`;
    }

    if (tagValue) {
      url += `&_tag=${encodeURIComponent(tagValue)}`;
    }

    url += `&_bids=true&_seller=true`;
  } else {
    // Use normal listings endpoint when only filters are used
    url = `${apiBaseUrl}/auction/listings?_bids=true&_seller=true`;

    if (statusValue === "true") {
      url += `&_active=true`;
    }

    if (tagValue) {
      url += `&_tag=${encodeURIComponent(tagValue)}`;
    }
  }

  try {
    const response = await fetch(url);
    const result = await response.json();

    // Send data to render function
    renderListings(result.data || []);
  } catch (error) {
    console.error("Error fetching listings:", error);
    listingsContainer.innerHTML = "<p>Could not load listings.</p>";
  } finally {
    hideSpinner();
  }
}

// Render all listings to the page
function renderListings(listings) {
  // Clear previous listings
  listingsContainer.innerHTML = "";

  // Show a message if no listings are found
  if (!listings.length) {
    listingsContainer.innerHTML = "<p>No listings found.</p>";
    return;
  }

  // Create and append one card for each listing
  listings.forEach((listing) => {
    const listingCard = createListingCard(listing);
    listingsContainer.appendChild(listingCard);
  });
}

// Run search while typing
searchInput.addEventListener("input", fetchListings);

// Run filters when dropdown values change
tagSelect.addEventListener("change", fetchListings);
statusSelect.addEventListener("change", fetchListings);

// Initial load
fetchListings();
