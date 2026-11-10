/**
 * Navbar Component Controller
 * Renders Guest vs. Authenticated Navbar actions and coordinates navigation events.
 */

import { logout } from '../state/auth.js';

export function setupNavbar({ onOpenLogin, onNavigate }) {
  const loginBtn = document.getElementById('loginBtn');
  const authNavActions = document.getElementById('authNavActions');
  const navLinks = document.querySelectorAll('.navbar nav a');

  // Handle Login button click
  loginBtn?.addEventListener('click', () => {
    if (onOpenLogin) onOpenLogin();
  });

  // Handle Navigation clicks
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.textContent.trim().toLowerCase();
      if (onNavigate) {
        onNavigate(target);
      }
    });
  });

  // Render auth state
  return function renderNavbar(authState) {
    if (!authNavActions) return;

    if (authState.isAuthenticated && authState.user) {
      if (loginBtn) loginBtn.style.display = 'none';
      
      const roleLabel = authState.user.role || 'staff';
      authNavActions.innerHTML = `
        <div class="user-badge" title="Logged in as ${authState.user.username}">
          <span class="user-avatar">👤</span>
          <span class="user-name">${escapeHtml(authState.user.username)}</span>
          <span class="user-role-pill">${escapeHtml(roleLabel)}</span>
        </div>
        <button id="logoutBtn" class="logout-btn" title="Sign out of your account">
          Logout
        </button>
      `;

      const logoutBtn = document.getElementById('logoutBtn');
      logoutBtn?.addEventListener('click', () => {
        logout();
      });
    } else {
      if (loginBtn) loginBtn.style.display = 'inline-block';
      authNavActions.innerHTML = '';
    }
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
