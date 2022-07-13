// This file is for handling the add event form and its placeholder
import { getCellHeight } from './tabel';
import { getElementHeightFromCSS } from './utility';

const moment = require('moment');

const tabel = document.getElementById('calendar-table');
// The elment that contains the visual style for adding a new event
const addEventEl = document.getElementById('add-event');
const titleInputEl = addEventEl.querySelector('#event-name');
const descriptionInputEl = addEventEl.querySelector('#event-description');

// This variable contains the placeholder that is temporarily created
let placeHolder;

// Updates the title and description of the placeholder to those written
// inside the text fields
const updatePlaceHolderValues = () => {
  if (placeHolder) {
    placeHolder.querySelector('.title').textContent = titleInputEl.value
      ? titleInputEl.value
      : '(Unnamed)';
    placeHolder.querySelector('.description').textContent =
      descriptionInputEl.value;
  }
};

titleInputEl.addEventListener('input', updatePlaceHolderValues);
descriptionInputEl.addEventListener('input', updatePlaceHolderValues);

// A function that adds the appropite events for enabling resizing
const enableResizeEvents = (resizeBoxEl, placholderEl) => {
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
      const containerElHeight = getElementHeightFromCSS(placholderEl);
      placholderEl.style.height = `${containerElHeight + changeValue}px`;
    }

    while (difference < 0 && difference <= -cellHeight / 4) {
      difference += changeValue;
      const containerElHeight = getElementHeightFromCSS(placholderEl);
      placholderEl.style.height = `${Math.max(
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
  const resizeBoxResizeHeight = '200px';

  // When the resize begin we update the positions and start an interval, and
  // update the resize box height
  resizeBoxEl.addEventListener('mousedown', (e) => {
    mousePosition.lastUpdatedY =
      e.clientY - placholderEl.getBoundingClientRect().top;
    interval = setInterval(resizeEventFunction, 100);
    resizeBoxEl.style.height = resizeBoxResizeHeight;
  });

  // Updates the mouse position
  resizeBoxEl.addEventListener('mousemove', (e) => {
    mousePosition.currentY =
      e.clientY - placholderEl.getBoundingClientRect().top;
  });

  // Stops the resize function
  const stopInterval = () => {
    console.log(initialResizeElementHeight);
    resizeBoxEl.style.height = `${initialResizeElementHeight}px`;
    if (interval) clearInterval(interval);
  };

  resizeBoxEl.addEventListener('mouseup', stopInterval);
  resizeBoxEl.addEventListener('mouseleave', stopInterval);
};

// Generate a temporarily placeholder so it helps the user with making an event
const generatePlaceholderElement = (parentEl, timestamp) => {
  const placeholderEl = document.createElement('div');
  const titleEl = document.createElement('p');
  titleEl.classList.add('title');
  titleEl.textContent = '(Unnamed)';
  placeholderEl.appendChild(titleEl);

  // Calculating the veritcal offset
  placeholderEl.style.top = `${
    (moment(timestamp).minute() / 60) * parentEl.offsetHeight
  }px`;

  const descriptionEl = document.createElement('p');
  descriptionEl.classList.add('description');
  placeholderEl.appendChild(descriptionEl);

  placeholderEl.classList.add('event');
  placeholderEl.style.height = `${parentEl.offsetHeight}px`;

  parentEl.appendChild(placeholderEl);
  placeHolder = placeholderEl;

  // No click event, but we stop them so that the calendar doesnot show
  // another placeholder
  placeholderEl.addEventListener('click', (e) => e.stopPropagation());

  /* 
    This is a div that we put at the end of the placeholder, it is invisible
    but gives the appropite mouse cursor and changes it size while resizing so
    that it helps resizing the container.
  */
  const resizeBoxEl = document.createElement('div');
  resizeBoxEl.classList.add('resize-box');
  placeholderEl.appendChild(resizeBoxEl);

  // Enable resizing
  enableResizeEvents(resizeBoxEl, placeholderEl);

  updatePlaceHolderValues();
};

addEventEl.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
});

const removePlaceholder = () => {
  if (placeHolder) placeHolder.remove();
};

const hideAddEvent = () => {
  addEventEl.classList.add('hidden');
  titleInputEl.value = '';
  descriptionInputEl.value = '';

  removePlaceholder();
};

addEventEl
  .querySelector('.exit-button')
  .addEventListener('click', hideAddEvent);

const showAddNewEvent = (timestamp, parentEl) => {
  removePlaceholder();
  generatePlaceholderElement(parentEl, timestamp);

  // Showing the element
  addEventEl.classList.remove('hidden');

  let topPosition =
    parentEl.getBoundingClientRect().top +
    window.scrollY -
    parentEl.offsetHeight;
  // Making sure that the event form does not overflow in y-axes
  if (topPosition + addEventEl.offsetHeight > tabel.offsetHeight) {
    topPosition += parentEl.offsetHeight;
    const movingFactor = 1.1;
    topPosition -= movingFactor * addEventEl.offsetHeight;
  }
  addEventEl.style.top = `${topPosition}px`;

  let leftPosition =
    parentEl.getBoundingClientRect().left +
    window.scrollX +
    parentEl.offsetWidth;
  // Making sure that the event form does not overflow in x-axes
  if (leftPosition + addEventEl.offsetWidth > tabel.offsetWidth) {
    leftPosition -= parentEl.offsetWidth + addEventEl.offsetWidth;
  }
  addEventEl.style.left = `${leftPosition}px`;

  // Updating the times
  const timeFormat = 'ddd, MM, MMM HH:mm';
  addEventEl.querySelector('.from').textContent =
    moment(timestamp).format(timeFormat);

  addEventEl.querySelector('.to').textContent = moment(timestamp)
    .add(1, 'hour')
    .format(timeFormat);
};

export { showAddNewEvent };
