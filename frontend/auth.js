// This handles the registration and login forms
const registerOverlay = document.querySelector('.register-overlay');
const loginOverlay = document.querySelector('.login-overlay');

const registerButton = document.querySelector('.register-button');
const loginButton = document.querySelector('.login-button');
const logoutButton = document.querySelector('.logout-button');

// Showing the forms
registerButton.addEventListener('click', () =>
    registerOverlay.classList.remove('hidden')
);

loginButton.addEventListener('click', () =>
    loginOverlay.classList.remove('hidden')
);

// Hiding the forms
const hideRegisterOverlay = () => registerOverlay.classList.add('hidden');
const hideLoginOverlay = () => loginOverlay.classList.add('hidden');

registerOverlay
    .querySelector('.close-button')
    .addEventListener('click', hideRegisterOverlay);
loginOverlay
    .querySelector('.close-button')
    .addEventListener('click', hideLoginOverlay);

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
    } else {
        alert('Error in login, try again.');
    }
});
