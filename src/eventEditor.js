class EventEditor {
  constructor(table, storageHandler) {
    this.moment = require('moment');
    this.table = table;
    this.storageHandler = storageHandler;

    // The DOM elements
    this.eventEditorEl = table.getTableDOM().querySelector('#event-editor');
    this.titleInputEl = this.eventEditorEl.querySelector('#event-name');
    this.descriptionInputEl =
      this.eventEditorEl.querySelector('#event-description');

    // The selected event object and element
    this.selectedEvent = null;

    this.titleInputEl.addEventListener('input', () =>
      this.#updateEventValues()
    );

    this.descriptionInputEl.addEventListener('input', () =>
      this.#updateEventValues()
    );

    this.eventEditorEl.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.selectedEvent) {
        if (this.selectedEvent.isPlaceholder)
          storageHandler.addEvent(this.selectedEvent);
        else storageHandler.updateEvent(this.selectedEvent);
        this.selectedEvent.isPlaceholder = false;
        this.hideEditor();
      }
    });

    this.eventEditorEl
      .querySelector('.exit-button')
      .addEventListener('click', () => this.hideEditor());

    this.eventEditorEl
      .querySelector('.delete-button')
      .addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.selectedEvent) {
          this.selectedEvent.DOMElement.remove();
          this.storageHandler.deleteEvent(this.selectedEvent);
          this.hideEditor();
        }
      });
  }

  isEditorHidden() {
    return this.eventEditorEl.classList.contains('hidden');
  }

  // Updates the title and description of the event to those written
  // inside the text fields
  #updateEventValues() {
    if (this.selectedEvent) {
      this.selectedEvent.updateEventTitle(this.titleInputEl.value);
      this.selectedEvent.updateEventDescription(this.descriptionInputEl.value);
      this.storageHandler.updateEvent(this.selectedEvent);
    }
  }

  // Removes the event from the DOM if it is a placeholder
  #removePlaceholder() {
    if (this.selectedEvent && this.selectedEvent.isPlaceholder) {
      this.selectedEvent.DOMElement.remove();
    }
  }

  hideEditorVisually() {
    this.eventEditorEl.classList.add('hidden');
  }

  #showEditorVisually() {
    this.eventEditorEl.classList.remove('hidden');
  }

  #clearInputs() {
    this.titleInputEl.value = '';
    this.descriptionInputEl.value = '';
  }

  hideEditor() {
    this.hideEditorVisually();
    this.#clearInputs();
    this.#removePlaceholder();
  }

  // Show the event editor at the given event object
  showEventEditor(event) {
    if (this.selectedEvent !== event) {
      // Removes the placeholder in case
      this.#removePlaceholder();
    }

    this.selectedEvent = event;

    if (event.isPlaceholder)
      this.eventEditorEl.querySelector('.editor-title').textContent =
        'Add a new node';
    else this.eventEditorEl.querySelector('.editor-title').textContent = 'Edit';

    // Showing the element
    this.#showEditorVisually();

    // Calculating the vertical position and updating the event editor DOM position
    let topPosition =
      event.parentEl.getBoundingClientRect().top +
      window.scrollY -
      event.parentEl.offsetHeight;
    // Making sure that the event form does not overflow in y-axes
    if (topPosition + this.eventEditorEl.offsetHeight > this.table.height()) {
      topPosition += event.parentEl.offsetHeight;
      const movingFactor = 1.1;
      topPosition -= movingFactor * this.eventEditorEl.offsetHeight;
    }
    this.eventEditorEl.style.top = `${topPosition}px`;

    // Calculating the horizontal position and updating the event editor DOM position
    let leftPosition =
      event.parentEl.getBoundingClientRect().left +
      window.scrollX +
      event.parentEl.offsetWidth;
    // Making sure that the event form does not overflow in x-axes
    if (leftPosition + this.eventEditorEl.offsetWidth > this.table.width()) {
      leftPosition -=
        event.parentEl.offsetWidth + this.eventEditorEl.offsetWidth;
    }
    this.eventEditorEl.style.left = `${leftPosition}px`;

    this.updateEventEditorTimes();
    this.#updateFormValues();
  }

  // Update the text fields values
  #updateFormValues() {
    this.titleInputEl.value =
      this.selectedEvent.DOMElement.getAttribute('title');
    this.descriptionInputEl.value =
      this.selectedEvent.DOMElement.getAttribute('description');
  }

  // Updates the time from the selected event
  updateEventEditorTimes() {
    const startTimestamp = Number(
      this.selectedEvent.DOMElement.getAttribute('start-time')
    );
    const endTimestamp = Number(
      this.selectedEvent.DOMElement.getAttribute('end-time')
    );

    const timeFormat = 'ddd, DD, MMM HH:mm';
    this.eventEditorEl.querySelector('.from').textContent =
      this.moment(startTimestamp).format(timeFormat);

    this.eventEditorEl.querySelector('.to').textContent =
      this.moment(endTimestamp).format(timeFormat);
  }
}

export default EventEditor;
