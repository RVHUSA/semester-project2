// Keys used to store auth data in localStorage
const TOKEN_KEY = "token";
const USER_KEY = "user";

// Save the auth token to localStorage as a plain string
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

// Retrieve the auth token from localStorage
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Save user info to localStorage as JSON
export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Retrieve the stored user from localStorage
export function getUser() {
  const value = localStorage.getItem(USER_KEY);
  return value ? JSON.parse(value) : null;
}

// Get username from the stored user
export function getUsername() {
  const user = getUser();
  return user ? user.name : null;
}

// Remove key from localStorage
export function clearKey(key) {
  localStorage.removeItem(key);
}

// Clear stored auth data (token and user)
export function clearStorage() {
  clearKey(TOKEN_KEY);
  clearKey(USER_KEY);
}
