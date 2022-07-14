import Event from './event';

class EventEditor {
  constructor(tabel, tabelEl) {
    this.moment = require('moment');
    this.tabel = tabel;
    this.tabelEl = tabelEl;
    // The elment that contains the visual style for adding a new event
    this.eventEditorEl = document.getElementById('event-editor');
    this.titleInputEl = this.eventEditorEl.querySelector('#event-name');
    this.descriptionInputEl =
      this.eventEditorEl.querySelector('#event-description');

    // This variable contains the placeholder that is temporarily created
    this.selectedEventEl = null;

    // Inidcates if the selected event is a placeholder or not
    this.isPlaceholder = false;

    this.titleInputEl.addEventListener('input', () =>
      this.updateSelectedElementValues()
    );

    this.descriptionInputEl.addEventListener('input', () =>
      this.updateSelectedElementValues()
    );

    this.eventEditorEl.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.isPlaceholder = false;
      this.clearInputsAndClose();
    });

    this.eventEditorEl
      .querySelector('.exit-button')
      .addEventListener('click', () => this.hideEditor());

    this.eventEditorEl
      .querySelector('.delete-button')
      .addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectedEventEl.remove();
        this.hideEditor();
      });
  }

  clearInputsAndClose() {
    this.titleInputEl.value = '';
    this.descriptionInputEl.value = '';
    this.hideEditor();
  }

  isEditorHidden() {
    return this.eventEditorEl.classList.contains('hidden');
  }

  // Updates the title and description of the placeholder to those written
  // inside the text fields
  updateSelectedElementValues() {
    if (this.selectedEventEl) {
      const title = this.titleInputEl.value
        ? this.titleInputEl.value
        : '(Unnamed)';
      this.selectedEventEl.querySelector('.title').textContent = title;
      this.selectedEventEl.setAttribute('title', this.titleInputEl.value);

      const description = this.descriptionInputEl.value;
      this.selectedEventEl.querySelector('.description').textContent =
        description;
      this.selectedEventEl.setAttribute(
        'description',
        this.descriptionInputEl.value
      );
    }
  }

  removePlaceholder() {
    if (this.selectedEventEl && this.isPlaceholder) {
      this.selectedEventEl.remove();
      this.selectedEventEl = null;
    }
  }

  hideEditorVisually() {
    this.eventEditorEl.classList.add('hidden');
  }

  hideEditor() {
    this.hideEditorVisually();
    this.titleInputEl.value = '';
    this.descriptionInputEl.value = '';
    this.removePlaceholder();
  }

  /* 
  Show the event editor, parentEl is the cell element, eventEl is the selected
  or null to create a new placeholder, isNew denote if the element is already added
  or not.
*/
  showEventEditor(
    parentEl,
    eventEl = null,
    startTimestamp = moment().valueOf(),
    // Indicates if the element can be a placeholder or not, used for moving event
    canBePlaceHolder = true
  ) {
    // Checking if we are already editing the same element
    if (eventEl === this.selectedEventEl && !this.isEditorHidden()) {
      return;
    }

    if (canBePlaceHolder) {
      // Removes the placeholder in case
      this.removePlaceholder();
    }

    // Check if it is a placeholder or not
    if (!eventEl) {
      this.isPlaceholder = true;
      const event = new Event(this.tabel, this);
      this.selectedEventEl = event.generateEventEl(parentEl, startTimestamp);
      this.eventEditorEl.querySelector('.editor-title').textContent =
        'Add an event';
    } else {
      this.isPlaceholder = false;
      this.selectedEventEl = eventEl;
      this.eventEditorEl.querySelector('.editor-title').textContent = 'Edit';
    }

    // Showing the element
    this.eventEditorEl.classList.remove('hidden');

    // Calculating the position
    let topPosition =
      parentEl.getBoundingClientRect().top +
      window.scrollY -
      parentEl.offsetHeight;

    // Making sure that the event form does not overflow in y-axes
    if (topPosition + this.eventEditorEl.offsetHeight > this.tabel.height()) {
      topPosition += parentEl.offsetHeight;
      const movingFactor = 1.1;
      topPosition -= movingFactor * this.eventEditorEl.offsetHeight;
    }
    this.eventEditorEl.style.top = `${topPosition}px`;

    let leftPosition =
      parentEl.getBoundingClientRect().left +
      window.scrollX +
      parentEl.offsetWidth;

    // Making sure that the event form does not overflow in x-axes
    if (leftPosition + this.eventEditorEl.offsetWidth > this.tabel.width()) {
      leftPosition -= parentEl.offsetWidth + this.eventEditorEl.offsetWidth;
    }
    this.eventEditorEl.style.left = `${leftPosition}px`;

    this.updateEventEditorTimes();

    // Update the text fields values
    this.titleInputEl.value = this.selectedEventEl.getAttribute('title');
    this.descriptionInputEl.value =
      this.selectedEventEl.getAttribute('description');
  }

  // Updates the time from the selected event
  updateEventEditorTimes() {
    if (this.selectedEventEl) {
      const startTimestamp = Number(
        this.selectedEventEl.getAttribute('start-time')
      );
      const endTimestamp = Number(
        this.selectedEventEl.getAttribute('end-time')
      );

      const timeFormat = 'ddd, DD, MMM HH:mm';
      this.eventEditorEl.querySelector('.from').textContent =
        this.moment(startTimestamp).format(timeFormat);

      this.eventEditorEl.querySelector('.to').textContent =
        this.moment(endTimestamp).format(timeFormat);
    }
  }
}

export default EventEditor;
