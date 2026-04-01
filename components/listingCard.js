// Import API config, token and profile refresh function
import { apiBaseUrl, apiKey } from "../api/config.js";
import { getToken } from "../utils/storage.js";
import { fetchProfile } from "../api/profile.js";

// Select the HTML template used to create listing cards
const template = document.getElementById("listing-card-template");

// Create and return a single listing card
export function createListingCard(listing) {
  // Clone the template content so each listing gets its own copy
  const templateContent = template.content.cloneNode(true);

  // Select elements inside the template
  const cardWrapper = templateContent.querySelector(".listing-card-wrapper");
  const image = templateContent.querySelector(".listing-card__image");
  const title = templateContent.querySelector(".listing-card__title");
  const description = templateContent.querySelector(
    ".listing-card__description"
  );
  const bids = templateContent.querySelector(".listing-card__bids");
  const ends = templateContent.querySelector(".listing-card__ends");

  const bidArea = templateContent.querySelector(".listing-card__bid-area");
  const bidInput = templateContent.querySelector(".listing-card__bid-input");
  const bidButton = templateContent.querySelector(".listing-card__bid-button");
  const expiredMessage = templateContent.querySelector(
    ".listing-card__expired-message"
  );

  // Fill the card with data from the API
  image.src = listing.media?.[0]?.url || "https://placehold.co/600x400";
  image.alt = listing.media?.[0]?.alt || "Listing image";

  title.textContent = listing.title;
  description.textContent = listing.description || "No description";
  bids.textContent = `Bids: ${listing._count?.bids || 0}`;
  ends.textContent = `Ends: ${new Date(listing.endsAt).toLocaleString()}`;

  // Sends to single listing page when the image is clicked
  image.addEventListener("click", () => {
    window.location.href = `/listings/listingSingle.html?id=${listing.id}`;
  });

  // Check if the listing is still active
  const isActive = new Date(listing.endsAt) > new Date();

  // Get the current token from localStorage
  const token = getToken();

  // Hide the bid area if the user is not logged in or the listing is expired
  if (!token || !isActive) {
    bidArea.classList.add("is-hidden");
  }

  // Hide the expired message if the listing is still active
  if (isActive) {
    expiredMessage.classList.add("is-hidden");
  }

  // Handle bid submission
  bidButton.addEventListener("click", async () => {
    const currentToken = getToken();

    // Redirect to login if the user is no longer logged in
    if (!currentToken) {
      alert("You must login to place a bid.");
      window.location.href = "/auth/login.html";
      return;
    }

    const amount = Number(bidInput.value);

    // Validate the bid amount
    if (!amount || amount <= 0) {
      alert("Enter a valid bid.");
      return;
    }

    try {
      // Send bid request to the API
      const response = await fetch(
        `${apiBaseUrl}/auction/listings/${listing.id}/bids`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
            "X-Noroff-API-Key": apiKey,
          },
          body: JSON.stringify({ amount }),
        }
      );

      // Handle invalid session
      if (response.status === 401) {
        alert("Your session is invalid. Please log in again.");
        window.location.href = "/auth/login.html";
        return;
      }

      // Handle action that is not allowed
      if (response.status === 403) {
        alert("You are not allowed to bid on this listing.");
        return;
      }

      if (!response.ok) {
        throw new Error("Bid failed");
      }

      alert("Bid placed!");

      // Update bid count in the UI
      const currentBidCount = listing._count?.bids || 0;
      listing._count.bids = currentBidCount + 1;
      bids.textContent = `Bids: ${listing._count.bids}`;

      // Clear the input field after a successful bid
      bidInput.value = "";

      await fetchProfile();

      // Reload page to refresh navbar credits
      window.location.reload();
    } catch (error) {
      console.error("Bid error:", error);
      alert("Could not place bid.");
    }
  });

  return cardWrapper;
}
