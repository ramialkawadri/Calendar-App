//  This file handles the generating of the calendar table and showing it
import { getTimezoneAbbre } from './time';
import { calculateMinutePercentage } from './utility';
import EventEditor from './eventEditor';
import Event from './event';

class Tabel {
  constructor(tabelEl) {
    this.moment = require('moment');
    this.cellHeight = 60; // In pixels
    this.tabelEl = tabelEl;
    this.tabelBody = this.tabelEl.querySelector('#calendar__body');
    this.tabelHeader = this.tabelEl.querySelector('#calendar__header');

    // The timestamp that the table begins with
    this.currentTimestamp = 0;

    // Hold the number of days that are shown on the table
    this.numberOfDaysShown = 0;

    this.eventEditor = new EventEditor(this);
  }

  // Returns the tabel height
  height() {
    return this.tabelEl.offsetHeight;
  }

  // Returns the tabel width
  width() {
    return this.tabelEl.offsetWidth;
  }

  // Return the DOM element for the tabel
  getTabelEl() {
    return this.tabelEl;
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
      this.tabelHeader.appendChild(headerChild);
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
      const tabelRow = document.createElement('div');
      tabelRow.classList.add('calendar__body__row');

      if (i === 0) {
        // Show the clock in the first row
        for (let j = 0; j <= 23; ++j) {
          const tabelCell = document.createElement('div');
          tabelCell.style.height = `${this.getCellHeight()}px`;
          tabelCell.classList.add('calendar__hour');

          // Formating the hour
          if (j < 10) tabelCell.textContent = `0${j}:00`;
          else tabelCell.textContent = `${j}:00`;

          tabelRow.appendChild(tabelCell);
        }
      } else {
        for (let j = 0; j <= 23; ++j) {
          const tabelCell = document.createElement('div');
          tabelCell.style.height = `${this.getCellHeight()}px`;
          tabelCell.classList.add('calendar__cell');
          tabelRow.appendChild(tabelCell);

          // Click event to add a new calendar event
          tabelCell.addEventListener('click', (e) => {
            // Calculating where in the cell the user clicked, to know how far
            // we need to show the placeholder
            const minutePresentage = calculateMinutePercentage(
              e.clientY - e.target.getBoundingClientRect().top,
              this.getCellHeight()
            );

            // The timestamp for the appropriate day, hour, and minute
            const timestamp = this.moment(time)
              .add(i - 1, 'days')
              .add(j, 'hour')
              .minutes(minutePresentage * 60)
              .valueOf();

            const event = new Event(
              this,
              this.eventEditor,
              tabelCell,
              timestamp
            );
            this.eventEditor.showEventEditor(event);
          });
        }
      }
      this.tabelBody.appendChild(tabelRow);
    }
  }

  // Generate an empty table and views it
  generateEmptyTable(startingTime = this.moment(), numberOfDays = 7) {
    this.currentTimestamp = startingTime.valueOf();
    this.numberOfDaysShown = numberOfDays;

    this.tabelHeader.innerHTML = '';
    this.#generateTableHeader(startingTime, numberOfDays);

    this.tabelBody.innerHTML = '';
    this.#generateTableBody(startingTime, numberOfDays);
  }

  // Returns the cell that is showing the given timestamp, returns null if the
  // timestamp is outside the tabell
  getCellParent(timestamp) {
    const startDate = this.moment(this.currentTimestamp),
      endDate = this.moment(timestamp);
    const daysDiff = endDate.diff(startDate, 'days') + 1;

    // Outside the table
    if (daysDiff < 0 || daysDiff > this.numberOfDaysShown) return null;

    const tableRow = this.tabelEl.querySelectorAll('.calendar__body__row')[
      daysDiff + 1 // We add 1 because the first row holds the hours
    ];

    const tableCell =
      tableRow.querySelectorAll('.calendar__cell')[endDate.hours()];
    return tableCell;
  }
}

export default Tabel;
