// This file handles authentication
import { getCalendar } from '../UI/index';

const registerOverlay = document.querySelector('.register-overlay');
const loginOverlay = document.querySelector('.login-overlay');

const registerButton = document.querySelector('.register-button');
const loginButton = document.querySelector('.login-button');
const logoutButton = document.querySelector('.logout-button');

// Update the UI for login
const login = () => {
    registerButton.classList.add('hidden');
    loginButton.classList.add('hidden');
    logoutButton.classList.remove('hidden');
};

// Update the UI for logout
const logout = () => {
    registerButton.classList.remove('hidden');
    loginButton.classList.remove('hidden');
    logoutButton.classList.add('hidden');
    localStorage.removeItem('token');
};

// Updates the interface when logging in / out
const authUpdateUI = async () => {
    const loggedIn = await isLoggedIn();
    if (loggedIn) login();
    else logout();
};

// Showing the forms
registerButton.addEventListener('click', () => {
    registerOverlay.classList.remove('hidden');
    registerOverlay.querySelector('input').focus();
});

loginButton.addEventListener('click', () => {
    loginOverlay.classList.remove('hidden');
    loginOverlay.querySelector('input').focus();
});

// Hiding the forms
const hideRegisterOverlay = () => registerOverlay.classList.add('hidden');
const hideLoginOverlay = () => loginOverlay.classList.add('hidden');

registerOverlay
    .querySelector('.close-button')
    .addEventListener('click', hideRegisterOverlay);
registerOverlay.addEventListener('keydown', (e) => {
    if (e?.key === 'Escape') hideRegisterOverlay();
});

loginOverlay
    .querySelector('.close-button')
    .addEventListener('click', hideLoginOverlay);
loginOverlay.addEventListener('keydown', (e) => {
    if (e?.key === 'Escape') hideLoginOverlay();
});

// Handling the submits
registerOverlay.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const request = await fetch('/createUser', {
        method: 'POST',
        body: JSON.stringify({
            name: e.target.elements.name.value,
            email: e.target.elements.email.value,
            password: e.target.elements.password.value,
        }),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });

    if (request.status === 201) {
        const data = await request.json();
        localStorage.setItem('token', data.token);

        hideRegisterOverlay();
        alert('Registration successful');
        authUpdateUI();
    } else {
        alert('Error in registration, try again.');
    }
});

loginOverlay.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const request = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify({
            email: e.target.elements.email.value,
            password: e.target.elements.password.value,
        }),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });

    if (request.status === 201) {
        const data = await request.json();
        localStorage.setItem('token', data.token);

        hideLoginOverlay();
        alert('Login successful');
        authUpdateUI();

        getCalendar().generateEmptyTable();
    } else {
        alert('Error in login, try again.');
    }
});

// Logout button
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    authUpdateUI();
    getCalendar().generateEmptyTable();
});

// Checks if the users has a valid token
const isLoggedIn = async () => {
    if (localStorage.getItem('token')) {
        const response = await fetch('/token', {
            method: 'POST',
            body: JSON.stringify({
                token: localStorage.getItem('token'),
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (response.status == 200) return true;
        else return false;
    } else return false;
};

// Updating the UI on the start
(async () => await authUpdateUI())();

export { registerButton, loginButton, logoutButton, isLoggedIn };
