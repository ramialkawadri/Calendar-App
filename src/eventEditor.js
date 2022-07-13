import { generateEvent as generateEventEl } from './event';

const moment = require('moment');

const tabel = document.getElementById('calendar-table');
// The elment that contains the visual style for adding a new event
const eventEditorEl = document.getElementById('add-event');
const titleInputEl = eventEditorEl.querySelector('#event-name');
const descriptionInputEl = eventEditorEl.querySelector('#event-description');

// This variable contains the placeholder that is temporarily created
let selectedEventEl;

// Inidcates if the selected event is a placeholder or not
let isPlaceholder;

const clearInputsAndClose = () => {
  titleInputEl.value = '';
  descriptionInputEl.value = '';
  hideEditor();
};

const isHidden = () => eventEditorEl.classList.contains('hidden');

// Updates the title and description of the placeholder to those written
// inside the text fields
const updateSelectedElementValues = () => {
  if (selectedEventEl) {
    const title = titleInputEl.value ? titleInputEl.value : '(Unnamed)';
    selectedEventEl.querySelector('.title').textContent = title;
    selectedEventEl.setAttribute('title', titleInputEl.value);

    const description = descriptionInputEl.value;
    selectedEventEl.querySelector('.description').textContent = description;
    selectedEventEl.setAttribute('description', descriptionInputEl.value);
  }
};

titleInputEl.addEventListener('input', updateSelectedElementValues);
descriptionInputEl.addEventListener('input', updateSelectedElementValues);

eventEditorEl.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
  isPlaceholder = false;
  clearInputsAndClose();
});

const removePlaceholder = () => {
  if (selectedEventEl && isPlaceholder) {
    selectedEventEl.remove();
    selectedEventEl = null;
  }
};

const hideEditor = () => {
  eventEditorEl.classList.add('hidden');
  titleInputEl.value = '';
  descriptionInputEl.value = '';

  removePlaceholder();
};

eventEditorEl
  .querySelector('.exit-button')
  .addEventListener('click', hideEditor);

/* 
  Show the event editor, parentEl is the cell element, eventEl is the selected
  or null to create a new placeholder, isNew denote if the element is already added
  or not.
*/
const showEventEditor = (
  parentEl,
  eventEl = null,
  startTimestamp = moment().valueOf()
) => {
  // Checking if we are already editing the same element
  if (eventEl === selectedEventEl && !isHidden()) {
    return;
  }

  // Removes the placeholder in case
  removePlaceholder();

  // Means an unnamed element
  if (!eventEl) {
    isPlaceholder = true;
    selectedEventEl = generateEventEl(parentEl, startTimestamp);
  } else {
    isPlaceholder = false;
    selectedEventEl = eventEl;
  }

  // Showing the element
  eventEditorEl.classList.remove('hidden');

  // Calculating the position
  let topPosition =
    parentEl.getBoundingClientRect().top +
    window.scrollY -
    parentEl.offsetHeight;
  // Making sure that the event form does not overflow in y-axes
  if (topPosition + eventEditorEl.offsetHeight > tabel.offsetHeight) {
    topPosition += parentEl.offsetHeight;
    const movingFactor = 1.1;
    topPosition -= movingFactor * eventEditorEl.offsetHeight;
  }
  eventEditorEl.style.top = `${topPosition}px`;

  let leftPosition =
    parentEl.getBoundingClientRect().left +
    window.scrollX +
    parentEl.offsetWidth;

  // Making sure that the event form does not overflow in x-axes
  if (leftPosition + eventEditorEl.offsetWidth > tabel.offsetWidth) {
    leftPosition -= parentEl.offsetWidth + eventEditorEl.offsetWidth;
  }
  eventEditorEl.style.left = `${leftPosition}px`;

  updateEventEditorTimes();

  // Update the text fields values
  titleInputEl.value = selectedEventEl.getAttribute('title');
  descriptionInputEl.value = selectedEventEl.getAttribute('description');
};

const updateEventEditorTimes = () => {
  if (selectedEventEl) {
    const startTimestamp = Number(selectedEventEl.getAttribute('start-time'));
    const endTimestamp = Number(selectedEventEl.getAttribute('end-time'));

    const timeFormat = 'ddd, MM, MMM HH:mm';
    eventEditorEl.querySelector('.from').textContent =
      moment(startTimestamp).format(timeFormat);

    eventEditorEl.querySelector('.to').textContent =
      moment(endTimestamp).format(timeFormat);
  }
};

export { showEventEditor };
