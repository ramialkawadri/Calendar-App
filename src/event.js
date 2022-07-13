import { showEventEditor } from './eventEditor';
import { getCellHeight } from './tabel';
import { getElementHeightFromCSS } from './utility';

const moment = require('moment');

// A function that adds the appropite events for enabling resizing
const enableResizeEvents = (resizeBoxEl, eventEl) => {
  let mousePosition = {
    lastUpdatedY: 0,
    currentY: 0,
  };

  const cellHeight = getCellHeight(); // In pixels
  // How often can we change the height, this is equal to 15 minutes or 1/4 the height
  const changeValue = cellHeight / 4.0;
  // If the change is less than this valeu then we do nothing
  const smallChangeValue = cellHeight / 5.0;

  // The function that execute while the user is holding the mouse button
  const resizeEventFunction = () => {
    let difference = mousePosition.currentY - mousePosition.lastUpdatedY;

    // Too small change
    if (-smallChangeValue <= difference && difference <= smallChangeValue)
      return;

    while (difference >= changeValue) {
      difference -= changeValue;
      const containerElHeight = getElementHeightFromCSS(eventEl);
      eventEl.style.height = `${containerElHeight + changeValue}px`;
    }

    while (difference < 0 && difference <= -cellHeight / 4) {
      difference += changeValue;
      const containerElHeight = getElementHeightFromCSS(eventEl);
      eventEl.style.height = `${Math.max(
        containerElHeight - changeValue,
        changeValue // It cannot be smaller than 1/4 the height
      )}px`;
    }

    // Updating the position
    mousePosition.lastUpdatedY = mousePosition.currentY - difference;
  };

  let interval;

  const initialResizeElementHeight = resizeBoxEl.offsetHeight;
  // The resize height for the resize box
  const resizeBoxResizeHeight = `${getCellHeight() * 5}px`;

  // The interval periode of the resize event in milliseconds
  const intervalPeriode = 0;

  // When the resize begin we update the positions and start an interval, and
  // update the resize box height
  resizeBoxEl.addEventListener('mousedown', (e) => {
    mousePosition.lastUpdatedY =
      e.clientY - eventEl.getBoundingClientRect().top;
    interval = setInterval(resizeEventFunction, intervalPeriode);
    resizeBoxEl.style.height = resizeBoxResizeHeight;
  });

  // Updates the mouse position
  resizeBoxEl.addEventListener('mousemove', (e) => {
    mousePosition.currentY = e.clientY - eventEl.getBoundingClientRect().top;
  });

  // Stops the resize function
  const stopInterval = () => {
    resizeBoxEl.style.height = `${initialResizeElementHeight}px`;
    if (interval) clearInterval(interval);
  };

  resizeBoxEl.addEventListener('mouseup', stopInterval);
  resizeBoxEl.addEventListener('mouseleave', stopInterval);
};

// Generate a temporarily placeholder so it helps the user with making an event
const generateEventEl = (
  parentEl,
  startTimestamp,
  endTimestamp = null,
  title = '',
  description = ''
) => {
  if (!endTimestamp) {
    endTimestamp = moment(startTimestamp).add(1, 'hour').valueOf();
  }

  const eventEl = document.createElement('div');
  const titleEl = document.createElement('p');
  titleEl.classList.add('title');
  titleEl.textContent = '(Unnamed)';
  eventEl.appendChild(titleEl);

  // Calculating the veritcal offset
  eventEl.style.top = `${
    (moment(startTimestamp).minute() / 60) * parentEl.offsetHeight
  }px`;

  const descriptionEl = document.createElement('p');
  descriptionEl.classList.add('description');
  eventEl.appendChild(descriptionEl);

  eventEl.classList.add('event');
  eventEl.style.height = `${parentEl.offsetHeight}px`;

  parentEl.appendChild(eventEl);

  // No click event, but we stop them so that the calendar doesnot show
  // another placeholder
  eventEl.addEventListener('click', (e) => {
    e.stopPropagation();
    showEventEditor(parentEl, eventEl);
  });

  /* 
    This is a div that we put at the end of the placeholder, it is invisible
    but gives the appropite mouse cursor and changes it size while resizing so
    that it helps resizing the container.
  */
  const resizeBoxEl = document.createElement('div');
  resizeBoxEl.classList.add('resize-box');
  eventEl.appendChild(resizeBoxEl);

  // Enable resizing
  enableResizeEvents(resizeBoxEl, eventEl);

  eventEl.setAttribute('start-time', startTimestamp);
  eventEl.setAttribute('end-time', endTimestamp);

  eventEl.setAttribute('title', title);
  eventEl.setAttribute('description', description);

  return eventEl;
};

export { generateEventEl as generateEvent };
