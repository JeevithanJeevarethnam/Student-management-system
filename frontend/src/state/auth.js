/**
 * Authentication & Session State Management
 * Encapsulates session tokens, user profile persistence, and state change subscriptions.
 */

import { request, setUnauthorizedHandler } from '../api/client.js';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'currentUser';

const listeners = new Set();

function notifyListeners() {
  const authState = {
    isAuthenticated: isAuthenticated(),
    user: getCurrentUser(),
    token: getToken(),
  };
  listeners.forEach((listener) => {
    try {
      listener(authState);
    } catch (err) {
      console.error('Auth listener error:', err);
    }
  });
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  const token = getToken();
  return Boolean(token && token.trim().length > 0);
}

export async function login(username, password) {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (response.token && response.user) {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    notifyListeners();
  }

  return response;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyListeners();
}

export function onAuthStateChanged(callback) {
  listeners.add(callback);
  // Immediately invoke with current state
  callback({
    isAuthenticated: isAuthenticated(),
    user: getCurrentUser(),
    token: getToken(),
  });
  return () => listeners.delete(callback);
}

// Auto logout on 401 Unauthorized from backend
setUnauthorizedHandler(() => {
  logout();
});
