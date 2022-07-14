// This is the main JS file that will run first

// Fontawesome
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

// Javascript files
import Tabel from './tabel';

const calendar = new Tabel(document.getElementById('calendar-table'));

export const getCalendar = () => calendar;
calendar.generateEmptyTable();

// generateEmptyTable();

console.log('working');

// TODO: Refactor the following: event.js, eventEditor.js, tabel.js
