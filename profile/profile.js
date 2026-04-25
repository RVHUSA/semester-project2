// Import API config, token, username and spinner
import { apiBaseUrl, apiKey } from "../api/config.js";
import { getToken, getUsername } from "../utils/storage.js";
import { showSpinner, hideSpinner } from "../utils/spinner.js";

// Get profile from URL if present, if not use logged-in user
const params = new URLSearchParams(window.location.search);
const profileNameParam = params.get("name");

const username = profileNameParam || getUsername();
const loggedInUsername = getUsername();
const token = getToken();

// Select profile elements
const profileName = document.getElementById("profile-name");
const profileCredits = document.getElementById("profile-credits");
const profileBio = document.getElementById("profile-bio");
const profileAvatar = document.getElementById("profile-avatar");
const profileBanner = document.getElementById("profile-banner");

// Select listing containers
const profileListingsContainer = document.getElementById("profile-listings");
const profileBidsContainer = document.getElementById("profile-bids");

// Get template
const template = document.getElementById("profile-listing-template");

// Fetch profile data from API
async function fetchProfileData(name) {
  try {
    const response = await fetch(`${apiBaseUrl}/auction/profiles/${name}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    });

    if (!response.ok) throw new Error("Could not fetch profile");

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Edit profile button is only visible for logged-in user
const editProfileButton = document.getElementById("edit-profile-button");

if (editProfileButton && username !== loggedInUsername) {
  editProfileButton.classList.add("is-hidden");
}

// Fetch listings created by profile
async function fetchUserListings(name) {
  try {
    const response = await fetch(
      `${apiBaseUrl}/auction/profiles/${name}/listings?_bids=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) throw new Error("Could not fetch listings");

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Fetch listings the user has bid on
async function fetchUserBids(name) {
  try {
    const response = await fetch(
      `${apiBaseUrl}/auction/profiles/${name}/bids?_listings=true&_bids=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) throw new Error("Could not fetch bids");

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Fill profile info on the page
function displayProfile(profile) {
  if (!profile) return;

  profileName.textContent = profile.name || "";
  profileCredits.textContent = `Credits: ${profile.credits ?? 0}`;
  profileBio.textContent = profile.bio || "No bio added yet.";

  profileAvatar.src = profile.avatar?.url || "";
  profileAvatar.alt = profile.avatar?.alt || "Profile avatar";

  profileBanner.src = profile.banner?.url || "";
  profileBanner.alt = profile.banner?.alt || "Profile banner";
}

// Create a listing card by cloning the HTML template and filling it with data
function createProfileListingCard(listing) {
  // Clone the template content (creates a copy of the card)
  const clone = template.content.cloneNode(true);

  // Select elements inside the cloned template
  const image = clone.querySelector(".listing-card_image");
  const title = clone.querySelector(".listing-card_title");
  const description = clone.querySelector(".listing-card_description");
  const ends = clone.querySelector(".listing-card_ends");
  const link = clone.querySelector(".listing-card_details-link");

  // Set image (use placeholder if no image exists)
  image.src = listing.media?.[0]?.url || "https://placehold.co/600x400";
  image.alt = listing.media?.[0]?.alt || "Listing image";

  // Fill in listing data
  title.textContent = listing.title;
  description.textContent = listing.description || "No description available.";
  ends.textContent = `Ends: ${new Date(listing.endsAt).toLocaleString()}`;

  // Link to the listing details page (listingSingle)
  link.href = `/listings/listingSingle.html?id=${listing.id}`;

  return clone;
}

// Render listings
function renderListings(listings, container) {
  if (!container) return;

  container.innerHTML = "";

  if (!listings.length) {
    const p = document.createElement("p");
    p.textContent = "No listings found.";
    container.appendChild(p);
    return;
  }

  listings.forEach((listing) => {
    const card = createProfileListingCard(listing);
    container.appendChild(card);
  });
}

// Get unique listings from bids (avoid duplicate)
function getUniqueBidListings(bids) {
  const uniqueListings = [];

  // Check if this listing is already added
  bids.forEach((bid) => {
    const exists = uniqueListings.find((item) => item.id === bid.listing?.id);

    // Only add listing if it exists and is not already in the array
    if (!exists && bid.listing) {
      uniqueListings.push(bid.listing);
    }
  });

  return uniqueListings;
}

// Initialize page
(async function init() {
  if (!token || !username) {
    window.location.href = "/auth/login.html";
    return;
  }

  showSpinner();

  try {
    // Fetch all required data (profile, listings and bids) at the same time
    const [profile, userListings, userBids] = await Promise.all([
      fetchProfileData(username),
      fetchUserListings(username),
      fetchUserBids(username),
    ]);

    // Display profile and render listings created by user
    displayProfile(profile);
    renderListings(userListings, profileListingsContainer);

    // Show listings from bids (without duplicates)
    const bidListings = getUniqueBidListings(userBids);
    renderListings(bidListings, profileBidsContainer);
  } finally {
    hideSpinner();
  }
})();
