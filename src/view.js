import { getTimezoneAbbre } from './Time';

const moment = require('moment');

const table = document.getElementById('calendar-table');
const tableBody = document.getElementById('calendar__body');
const tableHeader = document.getElementById('calendar__header');
const addEventEl = document.getElementById('add-event');

addEventEl.querySelector('.exit-button').addEventListener('click', () => {
  addEventEl.classList.add('hidden');
});

// Generate an empty table header with the days starting from startingTime,
// this is a helper function for generateEmptyTable
const generateTableHeader = (startingTime, numberOfDays) => {
  // Cloning the starting time
  const time = moment(startingTime);

  for (let i = 0; i <= numberOfDays; ++i) {
    const headerChild = document.createElement('div');
    if (i === 0) {
      headerChild.textContent = getTimezoneAbbre();
    } else {
      const dayNameEl = document.createElement('p');
      const dayNumberEl = document.createElement('p');

      dayNameEl.textContent = time.format('ddd.');
      dayNameEl.classList.add('day-name');
      headerChild.appendChild(dayNameEl);

      dayNumberEl.textContent = time.format('D');
      dayNumberEl.classList.add('day-number');
      headerChild.appendChild(dayNumberEl);

      // Moving the date
      time.add(1, 'days');
    }
    tableHeader.appendChild(headerChild);
  }
};

// Generate an empty table body with the days starting from startingTime,
// this is a helper function for generateEmptyTable
const generateTableBody = (startingTime, numberOfDays) => {
  // Cloning the starting time, and putting starting hour, minute and second to zero
  const time = moment(startingTime)
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0);

  tableBody.classList.add('calendar__body');

  for (let i = 0; i <= numberOfDays; ++i) {
    const tabelRow = document.createElement('div');
    tabelRow.classList.add('calendar__body__row');

    if (i === 0) {
      for (let j = 0; j <= 23; ++j) {
        const tableCell = document.createElement('div');
        tableCell.classList.add('calendar__hour');
        if (j < 10) tableCell.textContent = `0${j}:00`;
        else tableCell.textContent = `${j}:00`;
        tabelRow.appendChild(tableCell);
      }
    } else {
      for (let j = 0; j <= 23; ++j) {
        const tabelCell = document.createElement('div');
        tabelCell.classList.add('calendar__cell');
        tabelRow.appendChild(tabelCell);

        tabelCell.addEventListener('click', () => {
          const timestamp = moment(time)
            .add(i - 1, 'days')
            .add(j, 'hour')
            .unix();
          showAddNewEvent(timestamp, tabelCell);
        });
      }
    }
    tableBody.appendChild(tabelRow);
  }
};

// Generate an empty table and views it
const generateEmptyTable = (startingTime = moment(), numberOfDays = 7) => {
  tableHeader.innerHTML = '';
  generateTableHeader(startingTime, numberOfDays);

  tableBody.innerHTML = '';
  generateTableBody(startingTime, numberOfDays);
};

const showAddNewEvent = (timestamp, parentEl) => {
  addEventEl.classList.remove('hidden');
  addEventEl.style.top = `${
    parentEl.getBoundingClientRect().top + window.scrollY
  }px`;

  addEventEl.style.left = `${
    parentEl.getBoundingClientRect().left + window.scrollX
  }px`;
};

export { generateEmptyTable };
