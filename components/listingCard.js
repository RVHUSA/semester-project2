// Select the HTML template used to create listing cards
const template = document.getElementById("listing-card-template");

// Create and return a single listing card
export function createListingCard(listing) {
  // Clone the template content
  const templateContent = template.content.cloneNode(true);

  // Select elements inside the template
  const column = templateContent.querySelector(".listing-card-wrapper");
  const image = templateContent.querySelector(".listing-card__image");
  const title = templateContent.querySelector(".listing-card__title");
  const description = templateContent.querySelector(
    ".listing-card__description"
  );
  const bids = templateContent.querySelector(".listing-card__bids");
  const ends = templateContent.querySelector(".listing-card__ends");
  const expiredMessage = templateContent.querySelector(
    ".listing-card__expired-message"
  );

  // Fill the card with data from the listing
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

  // Hide the expired message if the listing is still active
  if (isActive) {
    expiredMessage.classList.add("is-hidden");
  }

  return column;
}
