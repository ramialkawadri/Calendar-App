// This app handles the UI for the app in case of logging in / out
import { registerButton, loginButton, logoutButton, isLoggedIn } from './auth';
import { getCalendar } from '../UI/index';

// Update the UI for login
const login = () => {
    registerButton.classList.add('hidden');
    loginButton.classList.add('hidden');
    logoutButton.classList.remove('hidden');
    getCalendar().generateEmptyTable();
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

export { authUpdateUI };
