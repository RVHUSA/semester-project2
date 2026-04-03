// Import API, listing card component and spinner
import { apiBaseUrl } from "../api/config.js";
import { createListingCard } from "../components/listingCard.js";
import { showSpinner, hideSpinner } from "../utils/spinner.js";

// Select the container where listings will be displayed
const listingsContainer = document.getElementById("listings-container");

// Fetch all listings from the API
async function fetchListings() {
  showSpinner();

  try {
    const response = await fetch(
      `${apiBaseUrl}/auction/listings?_bids=true&_active=true`
    );
    const result = await response.json();

    renderListings(result.data);
  } catch (error) {
    console.error("Error fetching listings:", error);
    listingsContainer.innerHTML = "<p>Could not load listings.</p>";
  } finally {
    hideSpinner();
  }
}

// Render all listings to the page
function renderListings(listings) {
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

fetchListings();
