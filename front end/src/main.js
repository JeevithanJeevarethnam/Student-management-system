import './style.css';


// ==============================
// GET ELEMENTS
// ==============================

const loginBtn = document.getElementById('loginBtn');

const loginModal = document.getElementById('loginModal');

const closeLogin = document.getElementById('closeLogin');

const loginForm = document.getElementById('loginForm');

const loginMessage = document.getElementById('loginMessage');

function showLoginMessage(message, type = 'error') {
    if (!loginMessage) return;

    loginMessage.textContent = message;
    loginMessage.className = `login-message ${type}`;
}


// ==============================
// OPEN LOGIN POPUP
// ==============================

loginBtn?.addEventListener('click', function () {

    loginModal.style.display = 'flex';
    showLoginMessage('', '');

});


// ==============================
// CLOSE LOGIN POPUP
// ==============================

closeLogin?.addEventListener('click', function () {

    loginModal.style.display = 'none';

});


// ==============================
// CLOSE WHEN CLICKING OUTSIDE
// ==============================

loginModal?.addEventListener('click', function (event) {

    if (event.target === loginModal) {

        loginModal.style.display = 'none';

    }

});


// ==============================
// LOGIN FORM
// ==============================

loginForm?.addEventListener('submit', async function (event) {

    event.preventDefault();


    const username =
        document.getElementById('username').value.trim();


    const password =
        document.getElementById('password').value.trim();


    // Check empty fields

    if (username === '' || password === '') {

        showLoginMessage('Please enter username and password.');

        return;
    }


    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Signing in...';

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json')
            ? await response.json()
            : {};

        if (!response.ok) throw new Error(data.message || 'Unable to sign in.');

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        if (loginModal) loginModal.style.display = 'none';
        loginForm.reset();
        if (!loginModal) showLoginMessage(`Welcome, ${data.user.username}!`, 'success');
    } catch (error) {
        showLoginMessage(error.message || 'Unable to reach the server. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }

});
