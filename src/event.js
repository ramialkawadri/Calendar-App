import { getElementHeightFromCSS } from './utility';
import { v4 as uuidv4 } from 'uuid';
import {
  addDaysToTimeStamp,
  addMinutesToTimestamp,
  subtractMinutesFromTimestamp,
  subtractDaysFromTimeStamp,
} from './time';

class Event {
  constructor(
    table,
    eventEditor,
    parentEl,
    storageHandler,
    startTimestamp,
    endTimestamp = null,
    title = '',
    description = '',
    isPlaceholder = true,
    id = ''
  ) {
    this.moment = require('moment');
    this.table = table;
    this.eventEditor = eventEditor;
    this.storageHandler = storageHandler;

    // The DOM event element, it will changes its value in #initDOM function
    this.eventEl = null;

    // Represents the cell containing the event
    this.parentEl = parentEl;

    this.startTimestamp = startTimestamp;

    // If no end time stamp is given, the duration of the event will be 1 hour
    if (endTimestamp === null) {
      endTimestamp = this.moment(startTimestamp).add(1, 'hour').valueOf();
    }
    this.endTimestamp = endTimestamp;
    this.title = title;
    this.description = description;

    // A placeholder event is an event that is not yet added to the table but
    // used to help creating a new event
    this.isPlaceholder = isPlaceholder;
    this.id = id ? id : uuidv4();

    this.#initDOM();
  }

  // It initialize the DOM for the event, it is called from the constructor
  #initDOM() {
    const eventEl = document.createElement('div');
    const elementsContainer = document.createElement('div');
    const titleEl = document.createElement('p');
    const descriptionEl = document.createElement('p');

    // Fixing the title
    titleEl.classList.add('title');
    titleEl.textContent = this.title ? this.title : '(Unnamed)';
    elementsContainer.appendChild(titleEl);

    // Fixing the description
    descriptionEl.classList.add('description');
    descriptionEl.textContent = this.description;
    elementsContainer.appendChild(descriptionEl);

    elementsContainer.classList.add('event-container');
    eventEl.appendChild(elementsContainer);
    eventEl.classList.add('event');

    // Changing the height and the vertical offset
    eventEl.style.height = `${this.#height}px`;
    eventEl.style.top = `${this.#verticalOffset}px`;
    this.parentEl.appendChild(eventEl);

    /* 
      This is a div that we put at the end of the placeholder, it is invisible
      but gives the appropriate mouse cursor and changes it size while resizing so
      that it helps resizing the container.
    */
    const resizeBoxEl = document.createElement('div');
    resizeBoxEl.classList.add('resize-box');
    eventEl.appendChild(resizeBoxEl);

    eventEl.setAttribute('start-time', this.startTimestamp);
    eventEl.setAttribute('end-time', this.endTimestamp);
    eventEl.setAttribute('title', this.title);
    eventEl.setAttribute('description', this.description);
    eventEl.setAttribute('uuid', this.id);

    // Enable resizing, moving and updating the eventEl
    this.eventEl = eventEl;
    this.#enableResizeEvents(resizeBoxEl);
    this.#enableMovingEvents();

    this.eventEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.eventEditor.showEventEditor(this);
    });
  }

  // Returns the DOM element for the event
  get DOMElement() {
    return this.eventEl;
  }

  // Calculates the event height from the time, 1 hour is equal 1 cell height,
  // minutes converts to percentages
  get #height() {
    const startTime = this.moment(this.startTimestamp),
      endTime = this.moment(this.endTimestamp);
    return (
      endTime.diff(startTime, 'hour') * this.table.getCellHeight() +
      ((endTime.minutes() - startTime.minutes()) / 60) *
        this.table.getCellHeight()
    );
  }

  // Returns the vertical offset from the table cell
  get #verticalOffset() {
    const startTime = this.moment(this.startTimestamp);
    return (startTime.minute() / 60) * this.table.getCellHeight();
  }

  // A function that adds the appropriate events for enabling resizing,
  // resizeBoxEl is the invisible box at the bottom of the eventEl
  #enableResizeEvents(resizeBoxEl) {
    // The position are relative to the eventEl
    let mousePosition = {
      lastUpdatedY: 0, // Last position we updated the element on
      currentY: 0, // current mouse position
    };

    const cellHeight = this.table.getCellHeight(); // In pixels
    // How often can we change the height, this is equal to 15 minutes or 1/4 the height
    const changeValue = cellHeight / 4.0;
    // If the change is less than this value then we do nothing
    const smallChangeValue = cellHeight / 6.0;

    // The function that execute while the user is holding the mouse button
    const resizeEventFunction = () => {
      this.eventEditor.showEventEditor(this);
      let difference = mousePosition.currentY - mousePosition.lastUpdatedY;

      // Too small change
      if (-smallChangeValue <= difference && difference <= smallChangeValue)
        return;

      // Making the event bigger
      while (difference >= changeValue) {
        difference -= changeValue;
        const containerElHeight = getElementHeightFromCSS(this.eventEl);
        this.eventEl.style.height = `${containerElHeight + changeValue}px`;
        this.endTimestamp = addMinutesToTimestamp(this.endTimestamp, 15);
      }

      while (difference <= -changeValue) {
        difference += changeValue;
        const containerElHeight = getElementHeightFromCSS(this.eventEl);

        if (containerElHeight - changeValue >= changeValue) {
          this.eventEl.style.height = `${Math.max(
            containerElHeight - changeValue,
            changeValue // It cannot be smaller than 1/4 the height
          )}px`;
          this.endTimestamp = subtractMinutesFromTimestamp(
            this.endTimestamp,
            15
          );
        }
      }

      // Updating the position
      mousePosition.lastUpdatedY = mousePosition.currentY - difference;

      if (!this.isPlaceholder) {
        this.storageHandler.updateEvent(this);
      }

      // Updating the object attribute and the event time
      this.eventEl.setAttribute('end-time', this.endTimestamp);

      this.eventEditor.updateEventEditorTimes();
    };

    let interval;

    // The original resize box size
    const initialResizeElementHeight = resizeBoxEl.offsetHeight;
    // The height for the resize box while resizing
    const resizeBoxResizeHeight = `${this.table.getCellHeight() * 5}px`;

    // The interval period of the resize event in milliseconds
    const intervalPeriod = 0;

    resizeBoxEl.addEventListener('click', (e) => e.stopPropagation());

    // Indicate if the event editor was hidden at the start of editing
    let wasEditorHidden;

    const resizeEventStart = () => {
      wasEditorHidden = this.eventEditor.isEditorHidden();
      if (interval) clearInterval(interval);
      resizeBoxEl.style.height = resizeBoxResizeHeight;
      interval = setInterval(resizeEventFunction, intervalPeriod);
    };

    // When the resize begin we update the positions and start an interval, and
    // update the resize box height
    resizeBoxEl.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      mousePosition.lastUpdatedY =
        e.clientY - this.eventEl.getBoundingClientRect().top;
      mousePosition.currentY = mousePosition.lastUpdatedY;
      resizeEventStart();
    });

    resizeBoxEl.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      mousePosition.lastUpdatedY =
        e.touches[0].clientY - this.eventEl.getBoundingClientRect().top;
      mousePosition.currentY = mousePosition.lastUpdatedY;
      resizeEventStart();
    });

    // Updates the mouse position
    resizeBoxEl.addEventListener('mousemove', (e) => {
      mousePosition.currentY =
        e.clientY - this.eventEl.getBoundingClientRect().top;
    });
    resizeBoxEl.addEventListener('touchmove', (e) => {
      mousePosition.currentY =
        e.touches[0].clientY - this.eventEl.getBoundingClientRect().top;
    });

    // Stops the resize function
    const stopInterval = () => {
      resizeBoxEl.style.height = `${initialResizeElementHeight}px`;
      if (interval) {
        clearInterval(interval);
        interval = null;
      }

      if (wasEditorHidden) {
        this.eventEditor.hideEditor();
      }
    };

    ['mouseup', 'mouseleave', 'mouseout', 'touchend', 'touchcancel'].forEach(
      (name) => {
        resizeBoxEl.addEventListener(name, stopInterval.bind(this));
      }
    );
  }

  #enableMovingEvents() {
    // The position are relative to the eventEl
    const mousePosition = {
      x: 0,
      y: 0,
      lastUpdatedY: 0,
    };

    // A variable to indicate if we have moved the event or not
    let hasMoved = false;

    const cellWidth = this.eventEl.parentNode.offsetWidth,
      cellHeight = this.table.getCellHeight();

    const movingFunction = () => {
      // If the changes are less or equal than this nothing happen in any direction
      const xGapError = cellWidth / 2.0;
      const yGapError = cellHeight / 6.0;

      // Moving left
      while (mousePosition.x < -xGapError) {
        hasMoved = true;
        this.startTimestamp = subtractDaysFromTimeStamp(this.startTimestamp, 1);
        this.endTimestamp = subtractDaysFromTimeStamp(this.endTimestamp, 1);

        const parentCell = this.table.getCellParent(this.startTimestamp);
        if (parentCell) {
          parentCell.appendChild(this.eventEl);
          this.parentEl = parentCell;
          mousePosition.x += cellWidth;
        } else {
          this.eventEl.remove();
          break;
        }
      }

      // Moving right
      while (mousePosition.x > xGapError + cellWidth) {
        hasMoved = true;
        this.startTimestamp = addDaysToTimeStamp(this.startTimestamp, 1);
        this.endTimestamp = addDaysToTimeStamp(this.endTimestamp, 1);

        const parentCell = this.table.getCellParent(this.startTimestamp);
        if (parentCell) {
          parentCell.appendChild(this.eventEl);
          this.parentEl = parentCell;
          mousePosition.x -= cellWidth;
        } else {
          this.eventEl.remove();
          break;
        }
      }

      // Moving up, 15 minutes at the time
      while (mousePosition.lastUpdatedY - mousePosition.y > yGapError) {
        hasMoved = true;
        this.startTimestamp = subtractMinutesFromTimestamp(
          this.startTimestamp,
          15
        );
        this.endTimestamp = subtractMinutesFromTimestamp(this.endTimestamp, 15);

        const parentCell = this.table.getCellParent(this.startTimestamp);
        if (parentCell) {
          parentCell.appendChild(this.eventEl);
          this.parentEl = parentCell;
          this.eventEl.style.top = `${this.#verticalOffset}px`;
        } else {
          this.eventEl.remove();
        }
        mousePosition.lastUpdatedY -= cellHeight * 0.25;
      }

      // Moving down, 15 minutes at the time
      while (mousePosition.y - mousePosition.lastUpdatedY > yGapError) {
        hasMoved = true;
        this.startTimestamp = addMinutesToTimestamp(this.startTimestamp, 15);
        this.endTimestamp = addMinutesToTimestamp(this.endTimestamp, 15);

        const parentCell = this.table.getCellParent(this.startTimestamp);
        if (parentCell) {
          parentCell.appendChild(this.eventEl);
          this.parentEl = parentCell;
          this.eventEl.style.top = `${this.#verticalOffset}px`;
        } else {
          this.eventEl.remove();
        }
        mousePosition.lastUpdatedY += cellHeight * 0.25;
      }

      if (!this.isPlaceholder) {
        this.storageHandler.updateEvent(this);
      }

      this.eventEl.setAttribute('start-time', this.startTimestamp);
      this.eventEl.setAttribute('end-time', this.endTimestamp);
    };

    const movingEventTime = 0;
    let interval;

    // Indicates if the editor was hidden or not
    let wasEditorHidden = false;

    const movingStart = () => {
      this.eventEl.style.cursor = 'move';
      wasEditorHidden = this.eventEditor.isEditorHidden();
      this.eventEditor.hideEditorVisually();
      hasMoved = false;
      // Making sure to not start multiple intervals
      if (interval) clearInterval(interval);
      interval = setInterval(movingFunction, movingEventTime);
    };

    // Starts the movement
    this.eventEl.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      movingStart();
      mousePosition.lastUpdatedY = e.clientY;
      mousePosition.y = mousePosition.lastUpdatedY;
    });

    this.eventEl.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      movingStart();
      mousePosition.lastUpdatedY = e.touches[0].clientY;
      mousePosition.y = mousePosition.lastUpdatedY;
    });

    this.eventEl.addEventListener('mousemove', (e) => {
      mousePosition.y = e.clientY;
      mousePosition.x = e.clientX - this.eventEl.getBoundingClientRect().left;
    });

    this.eventEl.addEventListener('touchmove', (e) => {
      mousePosition.y = e.touches[0].clientY;
      mousePosition.x =
        e.touches[0].clientX - this.eventEl.getBoundingClientRect().left;
    });

    // When the movement ends
    const endMovingEvent = (e) => {
      e.stopPropagation();
      this.eventEl.style.cursor = 'pointer';
      if (interval) {
        clearInterval(interval);
        interval = null;
      }

      // If the user clicked or the event editor was already shown
      if (!hasMoved || !wasEditorHidden) {
        // this.eventEditor.showEventEditor(this);
      } else this.eventEditor.hideEditor();
    };

    ['mouseup', 'mouseleave', 'mouseout', 'touchend', 'touchcancel'].forEach(
      (name) => {
        this.eventEl.addEventListener(name, endMovingEvent.bind(this));
      }
    );
  }

  updateEventTitle(newTitle) {
    this.title = newTitle;
    this.DOMElement.querySelector('.title').textContent = newTitle
      ? newTitle
      : '(Unnamed)';
    this.DOMElement.setAttribute('title', newTitle);
  }

  updateEventDescription(newDescription) {
    this.description = newDescription;
    this.DOMElement.querySelector('.description').textContent = newDescription;
    this.DOMElement.setAttribute('description', newDescription);
  }
}

export default Event;
