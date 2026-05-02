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

// Load more button
const loadMoreButton = document.getElementById("load-more-button");

// Page and number of listings per load)
let currentPage = 1;
const limit = 9;

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

  // Find which listings to load
  const offset = (currentPage - 1) * limit;

  // Use search endpoint when search input has a value
  if (searchValue) {
    url = `${apiBaseUrl}/auction/listings/search?q=${encodeURIComponent(
      searchValue
    )}&limit=${limit}&offset=${offset}`;

    if (statusValue === "true") {
      url += `&_active=true`;
    }

    if (tagValue) {
      url += `&_tag=${encodeURIComponent(tagValue)}`;
    }

    url += `&_bids=true&_seller=true`;
  } else {
    // Use normal listings endpoint when only filters are used
    url = `${apiBaseUrl}/auction/listings?_bids=true&_seller=true&limit=${limit}&offset=${offset}`;

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

    // Hide button if no more listings
    if (!result.data?.length || result.data.length < limit) {
      loadMoreButton?.classList.add("is-hidden");
    } else {
      loadMoreButton?.classList.remove("is-hidden");
    }
  } catch (error) {
    console.error("Error fetching listings:", error);
    listingsContainer.innerHTML = "<p>Could not load listings.</p>";
  } finally {
    hideSpinner();
  }
}

// Render all listings to the page
function renderListings(listings) {
  // Only clear listings when loading first page
  if (currentPage === 1) {
    listingsContainer.innerHTML = "";
  }

  // Show a message if no listings are found
  if (!listings.length && currentPage === 1) {
    listingsContainer.innerHTML = "<p>No listings found.</p>";
    return;
  }

  // Create and append one card for each listing
  listings.forEach((listing) => {
    const listingCard = createListingCard(listing);
    listingsContainer.appendChild(listingCard);
  });
}

// Reset page when search/filter changes
function resetAndFetchListings() {
  currentPage = 1;
  fetchListings();
}

// Run search while typing
searchInput.addEventListener("input", resetAndFetchListings);

// Run filters when dropdown values change
tagSelect.addEventListener("change", resetAndFetchListings);
statusSelect.addEventListener("change", resetAndFetchListings);

// Load next page
if (loadMoreButton) {
  loadMoreButton.addEventListener("click", () => {
    currentPage++;
    fetchListings();
  });
}

// Initial load
fetchListings();
