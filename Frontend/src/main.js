import './style.css';


// ==============================
// GET ELEMENTS
// ==============================

const loginBtn = document.getElementById('loginBtn');

const loginModal = document.getElementById('loginModal');

const closeLogin = document.getElementById('closeLogin');

const loginForm = document.getElementById('loginForm');


// ==============================
// OPEN LOGIN POPUP
// ==============================

loginBtn.addEventListener('click', function () {

    loginModal.style.display = 'flex';

});


// ==============================
// CLOSE LOGIN POPUP
// ==============================

closeLogin.addEventListener('click', function () {

    loginModal.style.display = 'none';

});


// ==============================
// CLOSE WHEN CLICKING OUTSIDE
// ==============================

loginModal.addEventListener('click', function (event) {

    if (event.target === loginModal) {

        loginModal.style.display = 'none';

    }

});


// ==============================
// LOGIN FORM
// ==============================

loginForm.addEventListener('submit', function (event) {

    event.preventDefault();


    const username =
        document.getElementById('username').value.trim();


    const password =
        document.getElementById('password').value.trim();


    // Check empty fields

    if (username === '' || password === '') {

        alert('Please enter username and password.');

        return;
    }


    // Temporary frontend testing

    alert('Login details entered successfully!');

});