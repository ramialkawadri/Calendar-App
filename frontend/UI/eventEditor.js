import { addMinutesToTimestamp } from './time';
import moment from 'moment';

class EventEditor {
    constructor(table, storageHandler) {
        this.table = table;
        this.storageHandler = storageHandler;

        // The DOM elements
        this.eventEditorEl = this.#initDOM();
        table.getTableDOM().appendChild(this.eventEditorEl);

        this.titleInputEl = this.eventEditorEl.querySelector('.event-name');
        this.descriptionInputEl =
            this.eventEditorEl.querySelector('.event-description');

        // The time pickers for the event editor
        this.fromDateInputEl = this.eventEditorEl.querySelector('.from-date');
        this.fromTimeInputEl = this.eventEditorEl.querySelector('.from-time');
        this.toDateInputEl = this.eventEditorEl.querySelector('.to-date');
        this.toTimeInputEl = this.eventEditorEl.querySelector('.to-time');

        // We add the events for the date pickers
        this.fromDateInputEl.addEventListener(
            'change',
            this.#fromInputChangeEvent.bind(this)
        );
        this.fromTimeInputEl.addEventListener(
            'change',
            this.#fromInputChangeEvent.bind(this)
        );

        this.toDateInputEl.addEventListener(
            'change',
            this.#toInputChangeEvent.bind(this)
        );
        this.toTimeInputEl.addEventListener(
            'change',
            this.#toInputChangeEvent.bind(this)
        );

        // The selected event object and element
        this.selectedEvent = null;

        this.titleInputEl.addEventListener('input', () =>
            this.#updateEventValues()
        );

        this.descriptionInputEl.addEventListener('input', () =>
            this.#updateEventValues()
        );

        this.eventEditorEl
            .querySelector('form')
            .addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.selectedEvent) {
                    if (this.selectedEvent.isPlaceholder)
                        storageHandler.addEvent(this.selectedEvent);
                    else this.selectedEvent.saveChanges();
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
                    this.selectedEvent.removeDOMElement();
                    this.storageHandler.deleteEvent(this.selectedEvent);
                    this.hideEditor();
                }
            });
    }

    // Initialize the DOM element for the event editor, called in constructor
    #initDOM() {
        const domElement = document.createElement('div');
        domElement.classList.add('event-editor', 'hidden');

        domElement.innerHTML = `
        <div class="event-header">
          <p class="editor-title">Add an event</p>
          <button class="exit-button">
            <i class="fa-solid fa-circle-xmark exit"></i>
          </button>
        </div>

        <div class="event-form__container">
          <form>
          <div class="time">
            <div>
              <p>From:</p>
              <label for="from-date"> 
                <i class="fa-solid fa-calendar-days"></i>
                <input type="date" class="from-date" id="from-date"></input>
              </label>
              <label for="from-time">
                <i class="fa-solid fa-clock"></i> 
                <input type="time" class="from-time" id="from-time"></input>
              </label>
            </div>
            <div>
              <p>To:</p>
              <label for="to-date">
                <i class="fa-solid fa-calendar-days"></i>
                <input type="date" class="to-date" id="to-date"></input>
              </label>
              <label for="to-time">
                <i class="fa-solid fa-clock"></i> 
                <input type="time" class="to-time" id="to-time"></input>
              </label>
            </div>
          </div>
            <input
              type="text"
              class="event-name"
              name="eventName"
              placeholder="Add a title"
            />
            <input
              type="text"
              class="event-description"
              name="eventDescription"
              placeholder="Add a description"
            />
            <div class="buttons">
              <div role="button" class="button button--secondary delete-button">
                <i class="fa-solid fa-trash-can"></i> Delete
              </div>
              <button class="button button--primary">
                <i class="fa-solid fa-arrow-right-to-bracket"></i> Submit
              </button>
            </div>
          </form>
        </div>
    `;

        domElement.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        return domElement;
    }

    // This method will fire when we change the start time from the date pickers
    // it also changes the end time stamp value
    #fromInputChangeEvent() {
        // Calculating differences
        const oldTime = moment(this.selectedEvent.startTimestamp);
        const newTime = moment(
            `${this.fromDateInputEl.value} ${this.fromTimeInputEl.value}`
        );

        const startTimestamp = newTime.valueOf();
        const endTimestamp = addMinutesToTimestamp(
            this.selectedEvent.endTimestamp,
            newTime.diff(oldTime, 'minutes')
        );

        this.selectedEvent.updateEventTimes(startTimestamp, endTimestamp);
        this.updateEventEditorTimes();
    }

    // This method will fire when we change the end time from the date pickers
    #toInputChangeEvent() {
        const endTimestamp = moment(
            `${this.toDateInputEl.value} ${this.toTimeInputEl.value}`
        ).valueOf();

        // Error, we cannot have an event that ends before it begins or when it begins
        if (endTimestamp <= this.selectedEvent.startTimestamp) return;

        this.selectedEvent.updateEventTimes(
            this.selectedEvent.startTimestamp,
            endTimestamp
        );
        this.updateEventEditorTimes();
    }

    isEditorHidden() {
        return this.eventEditorEl.classList.contains('hidden');
    }

    // Updates the title and description of the event to those written
    // inside the text fields
    #updateEventValues() {
        if (this.selectedEvent) {
            this.selectedEvent.updateEventTitle(this.titleInputEl.value);
            this.selectedEvent.updateEventDescription(
                this.descriptionInputEl.value
            );
        }
    }

    // Removes the event from the DOM if it is a placeholder
    #removePlaceholder() {
        if (this.selectedEvent && this.selectedEvent.isPlaceholder) {
            this.selectedEvent.removeDOMElement();
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
        if (this.selectedEvent) this.selectedEvent.pushToNormalPosition();
        this.hideEditorVisually();
        this.#clearInputs();
        this.#removePlaceholder();
    }

    // Show the event editor at the given event object
    // Giving the mouse event will make the event editor shows at the mouse position
    showEventEditor(event, mouseEvent = null) {
        if (this.selectedEvent !== event) {
            // Removes the placeholder in case
            this.#removePlaceholder();
        }

        this.selectedEvent = event;

        if (event.isPlaceholder)
            this.eventEditorEl.querySelector('.editor-title').textContent =
                'Add a new node';
        else
            this.eventEditorEl.querySelector('.editor-title').textContent =
                'Edit';

        // Showing the element
        this.#showEditorVisually();

        // Calculating the vertical position and updating the event editor DOM position
        let topPosition =
            mouseEvent?.clientY ??
            event.parentEl.getBoundingClientRect().top +
                window.scrollY -
                event.parentEl.offsetHeight;
        // Making sure that the event form does not overflow in y-axes
        if (
            topPosition + this.eventEditorEl.offsetHeight >
            this.table.height()
        ) {
            topPosition += event.parentEl.offsetHeight;
            const movingFactor = 1.1;
            topPosition -= movingFactor * this.eventEditorEl.offsetHeight;
        }
        this.eventEditorEl.style.top = `${topPosition}px`;

        // Calculating the horizontal position and updating the event editor DOM position
        let leftPosition =
            mouseEvent?.clientX ??
            event.parentEl.getBoundingClientRect().left +
                window.scrollX +
                event.parentEl.offsetWidth;
        // Making sure that the event form does not overflow in x-axes
        if (
            leftPosition + this.eventEditorEl.offsetWidth >
            this.table.width()
        ) {
            leftPosition -=
                event.parentEl.offsetWidth + this.eventEditorEl.offsetWidth;
        }
        this.eventEditorEl.style.left = `${leftPosition}px`;

        this.updateEventEditorTimes();
        this.#updateFormValues();

        this.titleInputEl.focus();
    }

    // Update the text fields values
    #updateFormValues() {
        this.titleInputEl.value = this.selectedEvent.title;
        this.descriptionInputEl.value = this.selectedEvent.description;
    }

    // Updates the time from the selected event
    updateEventEditorTimes() {
        const startTimestamp = this.selectedEvent.startTimestamp;
        const endTimestamp = this.selectedEvent.endTimestamp;
        const dateFormat = 'YYYY-MM-DD';
        const timeFormat = 'HH:mm';
        const startTime = moment(startTimestamp);
        const endTime = moment(endTimestamp);

        this.fromDateInputEl.value = startTime.format(dateFormat);
        this.fromTimeInputEl.value = startTime.format(timeFormat);

        this.toDateInputEl.value = endTime.format(dateFormat);
        this.toDateInputEl.setAttribute('min', startTime.format(dateFormat));

        this.toTimeInputEl.value = endTime.format(timeFormat);
    }
}

export default EventEditor;
