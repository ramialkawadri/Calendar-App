// This is the main JS file that will run first

// Sass files
import '../styles/general.scss';

// Javascript files
import Table from './table';
import StorageHandler from './storage';
import moment from 'moment';

const storageHandler = new StorageHandler();
const calendar = new Table(
    document.getElementById('calendar-table'),
    storageHandler
);
const getCalendar = () => calendar;
const currentDate = document.querySelector('.nav__current-date');

calendar.generateEmptyTable();
currentDate.textContent =
    calendar.getCurrentMonthName() + ' ' + calendar.getCurrentYear();

document.querySelector('.nav__movement_left').addEventListener('click', () => {
    calendar.previous();
    currentDate.textContent =
        calendar.getCurrentMonthName() + ' ' + calendar.getCurrentYear();
});

document.querySelector('.nav__movement_right').addEventListener('click', () => {
    calendar.next();
    currentDate.textContent =
        calendar.getCurrentMonthName() + ' ' + calendar.getCurrentYear();
});

document.querySelector('.nav__today').addEventListener('click', () => {
    calendar.today();
    currentDate.textContent =
        calendar.getCurrentMonthName() + ' ' + calendar.getCurrentYear();
});

document.querySelector('.nav__number-of-days').value = '7';

document
    .querySelector('.nav__number-of-days')
    .addEventListener('change', (e) => {
        calendar.generateEmptyTable(
            moment(calendar.currentTimestamp),
            Number(e.target.value)
        );
    });

export { getCalendar };

console.log('working');
