const moment = require('moment');

const table = document.getElementById('calendar-table');
const addEventEl = document.getElementById('add-event');
const titleInputEl = addEventEl.querySelector('#event-name');
const descriptionInputEl = addEventEl.querySelector('#event-description');

let placeHolder;

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

  parentEl.appendChild(placeholderEl);
  placeHolder = placeholderEl;

  // Click event
  placeholderEl.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  updatePlaceHolderValues();
};

addEventEl.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
});

const removePlaceholder = () => {
  if (placeHolder) placeHolder.remove();
};

addEventEl.querySelector('.exit-button').addEventListener('click', () => {
  addEventEl.classList.add('hidden');
  titleInputEl.value = '';
  descriptionInputEl.value = '';

  removePlaceholder();
});

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
  if (topPosition + addEventEl.offsetHeight > table.offsetHeight) {
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
  if (leftPosition + addEventEl.offsetWidth > table.offsetWidth) {
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
