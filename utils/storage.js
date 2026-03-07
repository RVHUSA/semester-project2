// Keys used to store auth data in localStorage
const TOKEN_KEY = "token";
const USER_KEY = "user";

// Save the auth token to localStorage
export function saveToken(token) {
  saveToStorage(TOKEN_KEY, token);
}

// Retrieve the auth token from localStorage
export function getToken() {
  return getFromStorage(TOKEN_KEY);
}

// Save user info to localStorage
export function saveUser(user) {
  saveToStorage(USER_KEY, user);
}

// Retrieve the stored user from localStorage
export function getUser() {
  return getFromStorage(USER_KEY);
}

// Get username from the stored user
export function getUsername() {
  const user = getUser();
  return user ? user.name : null;
}

// Remove a key from localStorage
export function clearKey(key) {
  localStorage.removeItem(key);
}

// Clear stored auth data (token and user)
export function clearStorage() {
  clearKey(TOKEN_KEY);
  clearKey(USER_KEY);
}

// Helper function to store data in localStorage as JSON
function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Helper function to retrieve and parse JSON data from localStorage
function getFromStorage(key) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}
