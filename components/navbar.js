// Import functions for accessing user data and clearing storage
import { getUser, clearStorage } from "../utils/storage.js";

// Import function to fetch updated profile data from API
import { fetchProfile } from "../api/profile.js";

// Wait until DOM is fully loaded before running navbar setup
document.addEventListener("DOMContentLoaded", async () => {
  await setupNavbar();
});

async function setupNavbar() {
  // Get user from localStorage
  let user = getUser();

  // Try to refresh profile data if user is logged-in
  const refreshedUser = await fetchProfile();
  if (refreshedUser) {
    user = refreshedUser;
  }

  // Toggle button and mobile menu
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  // Desktop sections (logged-in vs guest)
  const desktopAuthArea = document.getElementById("desktop-auth-area");
  const desktopGuestArea = document.getElementById("desktop-guest-area");

  // Mobile sections
  const mobileUserSummary = document.getElementById("mobile-user-summary");
  const mobileAuthArea = document.getElementById("mobile-auth-area");
  const mobileGuestArea = document.getElementById("mobile-guest-area");

  // Elements where username and credits will be displayed
  const desktopUsername = document.getElementById("desktop-username");
  const desktopCredits = document.getElementById("desktop-credits");
  const mobileUsername = document.getElementById("mobile-username");
  const mobileCredits = document.getElementById("mobile-credits");

  // Logout buttons (desktop + mobile)
  const logoutBtn = document.getElementById("logout-btn");
  const mobileLogoutBtn = document.getElementById("mobile-logout-btn");

  // Toggle mobile menu open/close
  menuToggle?.addEventListener("click", () => {
    mobileMenu?.classList.toggle("open");
  });

  // Close mobile menu when a link is clicked
  document
    .querySelectorAll(
      ".nav-menu-mobile .nav-link, .nav-menu-mobile .nav-user-link"
    )
    .forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu?.classList.remove("open");
      });
    });

  // If user is logged-in set username and credits (fallback to 1000 if not available)
  if (user) {
    if (desktopUsername) {
      desktopUsername.textContent = user.name || "Profile";
    }

    if (desktopCredits) {
      desktopCredits.textContent = `Credits: ${user.credits ?? 1000}`;
    }

    if (mobileUsername) {
      mobileUsername.textContent = user.name || "Profile";
    }

    if (mobileCredits) {
      mobileCredits.textContent = `Credits: ${user.credits ?? 1000}`;
    }

    // Show authenticated UI
    desktopAuthArea?.classList.remove("is-hidden");
    mobileUserSummary?.classList.remove("is-hidden");
    mobileAuthArea?.classList.remove("is-hidden");

    // Hide guest UI
    desktopGuestArea?.classList.add("is-hidden");
    mobileGuestArea?.classList.add("is-hidden");

    // Logout functionality
    logoutBtn?.addEventListener("click", handleLogout);
    mobileLogoutBtn?.addEventListener("click", handleLogout);
  } else {
    // If user is not logged-in → show guest UI
    desktopAuthArea?.classList.add("is-hidden");
    mobileUserSummary?.classList.add("is-hidden");
    mobileAuthArea?.classList.add("is-hidden");

    desktopGuestArea?.classList.remove("is-hidden");
    mobileGuestArea?.classList.remove("is-hidden");
  }
}

// Logout: clear storage and redirect to homepage
function handleLogout() {
  clearStorage();
  window.location.href = "/index.html";
}
