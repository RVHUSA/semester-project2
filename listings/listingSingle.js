// Import API config, token and profile refresh function
import { apiBaseUrl, apiKey } from "../api/config.js";
import { getToken } from "../utils/storage.js";
import { fetchProfile } from "../api/profile.js";
import { updateNavbarUser } from "../components/navbar.js";

// Get listing id from URL
const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

// Select elements inside the article
const title = document.getElementById("listing-title");
const image = document.getElementById("listing-image");
const description = document.getElementById("listing-description");
const tags = document.getElementById("listing-tags");
const ends = document.getElementById("listing-ends");
const seller = document.getElementById("listing-seller");

const bidForm = document.getElementById("listing-bid-form");
const bidInput = document.getElementById("listing-bid-input");
const bidButton = document.getElementById("listing-bid-button");
const bidMessage = document.getElementById("listing-bid-message");

const bidsList = document.getElementById("listing-bids-list");

const prevButton = document.getElementById("image-prev");
const nextButton = document.getElementById("image-next");

// Track images
let media = [];
let currentImageIndex = 0;

// Fetch one listing from the API
async function fetchListing(id) {
  try {
    const response = await fetch(
      `${apiBaseUrl}/auction/listings/${id}?_seller=true&_bids=true`
    );

    if (!response.ok) {
      throw new Error("Could not fetch listing");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(error);
    title.textContent = "Failed to load listing.";
    return null;
  }
}

// Update current image in the gallery
function updateImage() {
  if (!media.length) {
    // If there are no images - show placeholder and hide navigation buttons
    image.src = "https://placehold.co/600x400";
    image.alt = "Listing image";
    // Hide buttons since there is nothing to navigate
    prevButton.classList.add("is-hidden");
    nextButton.classList.add("is-hidden");
    return;
  }

  // Set current image based on index
  image.src = media[currentImageIndex].url;
  image.alt = media[currentImageIndex].alt || "Listing image";

  // If only one image - hide nav buttons
  if (media.length < 2) {
    prevButton.classList.add("is-hidden");
    nextButton.classList.add("is-hidden");
  } else {
    // If multiple images - show nav buttons
    prevButton.classList.remove("is-hidden");
    nextButton.classList.remove("is-hidden");
  }
}

// Render list of bids
function renderBids(bids) {
  bidsList.innerHTML = "";

  // If there are bids - create list of items
  if (bids?.length) {
    bids.forEach((bid) => {
      const li = document.createElement("li");

      // Show bidder and bids used
      li.textContent = `${bid.bidder.name}: ${bid.amount} credits`;
      bidsList.appendChild(li);
    });
  } else {
    // If no bids - show fallback message
    const li = document.createElement("li");
    li.textContent = "No bids yet.";
    bidsList.appendChild(li);
  }
}

// Fill page with listing data from API
function displayListing(listing) {
  if (!listing) return;

  // Check if the listing is still active
  const isActive = new Date(listing.endsAt) > new Date();

  // Get the current token from localStorage
  const token = getToken();

  // Fill listing info
  title.textContent = listing.title;
  description.textContent = listing.description || "No description available.";

  // Show tags
  tags.textContent = listing.tags?.length
    ? `Tags: ${listing.tags.join(", ")}`
    : "No tags";

  // Display end date and seller
  ends.textContent = `Ends at: ${new Date(listing.endsAt).toLocaleString()}`;
  seller.textContent = `Seller: ${listing.seller?.name || "Unknown"}`;

  // Set images (fallback to placeholder)
  media = listing.media?.length
    ? listing.media
    : [{ url: "https://placehold.co/600x400", alt: "Listing image" }];

  // Display the first image first
  currentImageIndex = 0;
  updateImage();

  // Render bid history list
  renderBids(listing.bids);

  // Reset bid message
  bidMessage.textContent = "";
  bidMessage.className = "listing-card_expired-message";

  // Hide bid form if user is not logged-in or listing is expired
  if (!token || !isActive) {
    bidForm.classList.add("is-hidden");
  } else {
    bidForm.classList.remove("is-hidden");
  }

  // Show message if listing is expired
  if (!isActive) {
    bidMessage.textContent = "Bidding has ended.";
    bidMessage.classList.add("text-danger");
  }

  // Show message if user is not logged-in
  if (!token && isActive) {
    bidMessage.innerHTML = `You must <a href="/auth/login.html">log in</a> to place a bid.`;
  }

  // Handle bid submission
  bidButton.onclick = async () => {
    const currentToken = getToken();

    // Redirect to login if the user is no longer logged in
    if (!currentToken) {
      window.location.href = "/auth/login.html";
      return;
    }

    const amount = Number(bidInput.value);

    // Validate the bid amount
    if (!amount || amount <= 0) {
      bidMessage.textContent = "Enter a valid bid.";
      bidMessage.className = "listing-card_expired-message text-danger";
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
        window.location.href = "/auth/login.html";
        return;
      }

      // Handle action that is not allowed
      if (response.status === 403) {
        bidMessage.textContent = "You are not allowed to bid on this listing.";
        bidMessage.className = "listing-card_expired-message text-danger";
        return;
      }

      if (!response.ok) {
        throw new Error("Bid failed");
      }

      // Clear the input field after a successful bid
      bidInput.value = "";

      // Show success message
      bidMessage.textContent = "Bid placed successfully.";
      bidMessage.className = "listing-card_expired-message text-success";

      // Refresh profile data and update navbar credits
      const updatedUser = await fetchProfile();
      if (updatedUser) {
        updateNavbarUser(updatedUser);
      }

      // Refresh listing data and re-render page
      const updatedListing = await fetchListing(listing.id);
      displayListing(updatedListing);
    } catch (error) {
      console.error(error);
      bidMessage.textContent = "Could not place bid.";
      bidMessage.className = "listing-card_expired-message text-danger";
    }
  };
}

// Go to previous image in gallery
prevButton.addEventListener("click", () => {
  if (!media.length) return;
  // Wraps around to last image in gallery
  currentImageIndex = (currentImageIndex - 1 + media.length) % media.length;
  updateImage();
});

// Go to next image in gallery
nextButton.addEventListener("click", () => {
  if (!media.length) return;
  // Wraps around to first image in gallery
  currentImageIndex = (currentImageIndex + 1) % media.length;
  updateImage();
});

// Initialize page
(async function init() {
  const listing = await fetchListing(listingId);
  displayListing(listing);
})();
