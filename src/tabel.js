//  This file handles the generating of the calendar table and showing it
import { getTimezoneAbbre } from './time';
import { showEventEditor } from './eventEditor';
import { calculateMinutePresentage } from './utility';

const moment = require('moment');

const cellHeight = 60; // In pixels
const table = document.getElementById('calendar-table');
const tableBody = document.getElementById('calendar__body');
const tableHeader = document.getElementById('calendar__header');
let currentTimestamp;

const getCellHeight = () => cellHeight;

// Generate an empty table header with the days starting from startingTime,
// this is a helper function for generateEmptyTable
const generateTableHeader = (startingTime, numberOfDays) => {
  // Cloning the starting time
  const time = moment(startingTime);

  for (let i = 0; i <= numberOfDays; ++i) {
    const headerChild = document.createElement('div');
    if (i === 0) {
      // Showing the time zone in the first cell
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

  // Makes the table rows and add them
  for (let i = 0; i <= numberOfDays; ++i) {
    const tabelRow = document.createElement('div');
    tabelRow.classList.add('calendar__body__row');

    if (i === 0) {
      // Show the clock in the first row
      for (let j = 0; j <= 23; ++j) {
        const tabelCell = document.createElement('div');
        tabelCell.style.height = `${cellHeight}px`;
        tabelCell.classList.add('calendar__hour');

        // Formating the hour
        if (j < 10) tabelCell.textContent = `0${j}:00`;
        else tabelCell.textContent = `${j}:00`;

        tabelRow.appendChild(tabelCell);
      }
    } else {
      for (let j = 0; j <= 23; ++j) {
        const tabelCell = document.createElement('div');
        tabelCell.style.height = `${cellHeight}px`;
        tabelCell.classList.add('calendar__cell');
        tabelRow.appendChild(tabelCell);

        // Click event for showing the add event form
        tabelCell.addEventListener('click', (e) => {
          // Calculating where in the cell the user clicked, to know how far
          // we need to show the placeholder
          const minutePresentage = calculateMinutePresentage(
            e.clientY - e.target.getBoundingClientRect().top,
            tabelCell.offsetHeight
          );

          // The time stamp for the appropite day, hour, and minute
          const timestamp = moment(time)
            .add(i - 1, 'days')
            .add(j, 'hour')
            .minutes(minutePresentage * 60)
            .valueOf();
          showEventEditor(tabelCell, null, timestamp);
        });
      }
    }
    tableBody.appendChild(tabelRow);
  }
};

// Generate an empty table and views it
const generateEmptyTable = (startingTime = moment(), numberOfDays = 7) => {
  currentTimestamp = startingTime.valueOf();

  tableHeader.innerHTML = '';
  generateTableHeader(startingTime, numberOfDays);

  tableBody.innerHTML = '';
  generateTableBody(startingTime, numberOfDays);
};

// Return the cell for the timestamp, null if the timestamp is outside the tabell
const getCellParent = (timestamp) => {
  const startDate = moment(currentTimestamp),
    endDate = moment(timestamp);

  const daysDiff = endDate.diff(startDate, 'days') + 1;

  if (daysDiff < 0) return null;

  const tableRow = document.querySelectorAll('.calendar__body__row')[
    daysDiff + 1
  ];

  const tableCell =
    tableRow.querySelectorAll('.calendar__cell')[endDate.hours()];
  return tableCell;
};

export { generateEmptyTable, getCellHeight, getCellParent };
