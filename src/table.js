//  This file handles the generating of the calendar table and showing it
import { getTimezoneAbbre } from './time';
import { calculateMinutePercentage } from './utility';
import EventEditor from './eventEditor';
import Event from './event';

class Table {
  constructor(tableEl, cellHeight = 60) {
    this.moment = require('moment');
    this.cellHeight = cellHeight; // In pixels
    this.tableEl = tableEl;
    this.tableBody = tableEl.querySelector('#calendar__body');
    this.tableHeader = tableEl.querySelector('#calendar__header');

    // The timestamp that the table begins with
    this.currentTimestamp = 0;
    // Hold the number of days that are shown on the table
    this.numberOfDaysShown = 0;

    this.eventEditor = new EventEditor(this);
  }

  // Returns the table height
  height() {
    return this.tableEl.offsetHeight;
  }

  // Returns the table width
  width() {
    return this.tableEl.offsetWidth;
  }

  // Return the DOM element for the table
  getTableDOM() {
    return this.tableEl;
  }

  getCellHeight() {
    return this.cellHeight;
  }

  // Generate the table header with the days starting from startingTime,
  // this is a helper function for generateEmptyTable
  #generateTableHeader(startingTime, numberOfDays) {
    // Cloning the starting time
    const time = this.moment(startingTime);

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
      this.tableHeader.appendChild(headerChild);
    }
  }

  // Generate the table body with the days starting from startingTime,
  // this is a helper function for generateEmptyTable
  #generateTableBody(startingTime, numberOfDays) {
    // Cloning the starting time, and putting starting hour, minute and second to zero
    const time = this.moment(startingTime)
      .set('hour', 0)
      .set('minute', 0)
      .set('second', 0);

    // Making the table rows and adding them
    for (let i = 0; i <= numberOfDays; ++i) {
      const tableRow = document.createElement('div');
      tableRow.classList.add('calendar__body__row');

      if (i === 0) {
        // Show the clock in the first row
        for (let j = 0; j <= 23; ++j) {
          const tableCell = document.createElement('div');
          tableCell.style.height = `${this.getCellHeight()}px`;
          tableCell.classList.add('calendar__hour');

          // Formatting the hour
          if (j < 10) tableCell.textContent = `0${j}:00`;
          else tableCell.textContent = `${j}:00`;

          tableRow.appendChild(tableCell);
        }
      } else {
        for (let j = 0; j <= 23; ++j) {
          const tableCell = document.createElement('div');
          tableCell.style.height = `${this.getCellHeight()}px`;
          tableCell.classList.add('calendar__cell');
          tableRow.appendChild(tableCell);

          // Click event to add a new calendar event
          tableCell.addEventListener('click', (e) => {
            // Calculating where in the cell the user clicked, to know how far
            // we need to show the placeholder
            const minutePercentage = calculateMinutePercentage(
              e.clientY - e.target.getBoundingClientRect().top,
              this.getCellHeight()
            );

            // The timestamp for the appropriate day, hour, and minute
            const timestamp = this.moment(time)
              .add(i - 1, 'days')
              .add(j, 'hour')
              .minutes(minutePercentage * 60)
              .valueOf();

            const event = new Event(
              this,
              this.eventEditor,
              tableCell,
              timestamp
            );
            this.eventEditor.showEventEditor(event);
          });
        }
      }
      this.tableBody.appendChild(tableRow);
    }
  }

  // Generate an empty table and views it
  generateEmptyTable(startingTime = this.moment(), numberOfDays = 7) {
    this.currentTimestamp = startingTime.valueOf();
    this.numberOfDaysShown = numberOfDays;

    this.tableHeader.innerHTML = '';
    this.#generateTableHeader(startingTime, numberOfDays);

    this.tableBody.innerHTML = '';
    this.#generateTableBody(startingTime, numberOfDays);
  }

  // Returns the cell that is showing the given timestamp, returns null if the
  // timestamp is outside the table
  getCellParent(timestamp) {
    const startDate = this.moment(this.currentTimestamp),
      endDate = this.moment(timestamp);
    const daysDiff = endDate.diff(startDate, 'days') + 1;

    // Outside the table
    if (daysDiff < 0 || daysDiff + 1 > this.numberOfDaysShown) return null;

    const tableRow = this.tableEl.querySelectorAll('.calendar__body__row')[
      daysDiff + 1 // We add 1 because the first row holds the hours
    ];

    const tableCell =
      tableRow.querySelectorAll('.calendar__cell')[endDate.hours()];
    return tableCell;
  }
}

export default Table;
