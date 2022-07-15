// This is the main JS file that will run first

// Fontawesome
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

// Javascript files
import Table from './table';

const calendar = new Table(document.getElementById('calendar-table'));
export const getCalendar = () => calendar;
calendar.generateEmptyTable();

console.log('working');
