/**
 * Main Application Bootstrap & View Coordinator
 * Coordinates Auth State, Navbar, Dashboard, and Login Modal interactions.
 */

import './style.css';
import { onAuthStateChanged, login, isAuthenticated } from './state/auth.js';
import { setupNavbar } from './components/navbar.js';
import { setupDashboard } from './components/dashboard.js';

// ==========================================
// DOM ELEMENTS
// ==========================================

const loginModal = document.getElementById('loginModal');
const closeLogin = document.getElementById('closeLogin');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

const heroSection = document.getElementById('heroSection');
const featuresSection = document.getElementById('featuresSection');
const appDashboard = document.getElementById('appDashboard');

const heroViewStudentsBtn = document.getElementById('heroViewStudentsBtn');
const heroLearnMoreBtn = document.getElementById('heroLearnMoreBtn');

// ==========================================
// LOGIN MODAL CONTROLLER
// ==========================================

function showLoginModal(prefilledMessage = '') {
  if (!loginModal) return;
  loginModal.style.display = 'flex';
  if (prefilledMessage) {
    showLoginMessage(prefilledMessage, 'error');
  } else {
    showLoginMessage('');
  }
  document.getElementById('username')?.focus();
}

function closeLoginModal() {
  if (!loginModal) return;
  loginModal.style.display = 'none';
  showLoginMessage('');
  loginForm?.reset();
}

function showLoginMessage(message, type = 'error') {
  if (!loginMessage) return;
  loginMessage.textContent = message;
  loginMessage.className = `login-message ${type}`;
  loginMessage.style.display = message ? 'block' : 'none';
}

closeLogin?.addEventListener('click', closeLoginModal);

loginModal?.addEventListener('click', (event) => {
  if (event.target === loginModal) {
    closeLoginModal();
  }
});

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const submitButton = loginForm.querySelector('button[type="submit"]');

  const username = usernameInput.value.trim();
  // IMPORTANT: Do NOT trim passwords to avoid corrupting intentional whitespace
  const password = passwordInput.value;

  if (!username || !password) {
    showLoginMessage('Please enter both username and password.');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Signing in...';
  showLoginMessage('');

  try {
    await login(username, password);
    closeLoginModal();
  } catch (error) {
    showLoginMessage(error.message || 'Invalid credentials or server unavailable.');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Login';
  }
});

// ==========================================
// VIEW SWITCHING COORDINATOR
// ==========================================

const dashboard = setupDashboard();

const renderNavbar = setupNavbar({
  onOpenLogin: () => showLoginModal(),
  onNavigate: (target) => {
    if (target === 'students') {
      if (isAuthenticated()) {
        appDashboard?.scrollIntoView({ behavior: 'smooth' });
      } else {
        showLoginModal('Please log in to access the Student Directory.');
      }
    } else if (target === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'about') {
      featuresSection?.scrollIntoView({ behavior: 'smooth' });
    } else if (target === 'courses') {
      if (isAuthenticated()) {
        alert('The Courses module is scheduled for Phase 3.');
      } else {
        showLoginModal('Please log in to explore courses.');
      }
    }
  },
});

function renderViewState(authState) {
  if (authState.isAuthenticated) {
    // Hide public landing content
    if (heroSection) heroSection.style.display = 'none';
    if (featuresSection) featuresSection.style.display = 'none';

    // Show authenticated dashboard
    if (appDashboard) {
      appDashboard.style.display = 'block';
      dashboard.loadStudents();
    }
  } else {
    // Show public landing content
    if (heroSection) heroSection.style.display = 'flex';
    if (featuresSection) featuresSection.style.display = 'block';

    // Hide authenticated dashboard
    if (appDashboard) appDashboard.style.display = 'none';
  }
}

// Hero Action Buttons
heroViewStudentsBtn?.addEventListener('click', () => {
  if (isAuthenticated()) {
    appDashboard?.scrollIntoView({ behavior: 'smooth' });
  } else {
    showLoginModal('Please sign in to access Student Information.');
  }
});

heroLearnMoreBtn?.addEventListener('click', () => {
  featuresSection?.scrollIntoView({ behavior: 'smooth' });
});

// ==========================================
// APPLICATION INITIALIZATION
// ==========================================

// Subscribe navbar and view state to authentication changes
onAuthStateChanged((authState) => {
  renderNavbar(authState);
  renderViewState(authState);
});
