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
    tabel,
    eventEditor,
    parentEl,
    startTimestamp,
    endTimestamp = null,
    title = '',
    description = '',
    isPlaceholder = true
  ) {
    this.moment = require('moment');
    this.tabel = tabel;
    this.eventEditor = eventEditor;
    this.eventEl = null;

    // Represents the cell containing the event
    this.parentEl = parentEl;

    this.startTimestamp = startTimestamp;
    if (!endTimestamp) {
      endTimestamp = this.moment(startTimestamp).add(1, 'hour').valueOf();
    }
    this.endTimestamp = endTimestamp;
    this.title = title;
    this.description = description;
    this.isPlaceholder = isPlaceholder;
    this.id = uuidv4();

    this.#initDom();
  }

  #initDom() {
    const eventEl = document.createElement('div');
    const titleEl = document.createElement('p');
    const descriptionEl = document.createElement('p');

    // Fixing the title
    titleEl.classList.add('title');
    titleEl.textContent = '(Unnamed)';
    eventEl.appendChild(titleEl);

    // Calculating the veritcal offset
    eventEl.style.top = `${
      (this.moment(this.startTimestamp).minute() / 60) *
      this.tabel.getCellHeight()
    }px`;

    // Fixing the description
    descriptionEl.classList.add('description');
    eventEl.appendChild(descriptionEl);

    eventEl.classList.add('event');
    eventEl.style.height = `${this.tabel.getCellHeight()}px`;

    this.parentEl.appendChild(eventEl);

    /* 
        This is a div that we put at the end of the placeholder, it is invisible
        but gives the appropite mouse cursor and changes it size while resizing so
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

    // Enable resizing
    this.#enableResizeEvents(resizeBoxEl, eventEl);

    // Enable moving
    this.#enableMovingEvents(eventEl);
    this.eventEl = eventEl;
  }

  get DOMElement() {
    return this.eventEl;
  }

  // A function that adds the appropite events for enabling resizing,
  // resizeBoxEl is the invisible box at the bottom of the eventEl
  #enableResizeEvents(resizeBoxEl, eventEl) {
    // The position are relative to the eventEl
    let mousePosition = {
      lastUpdatedY: 0,
      currentY: 0,
    };

    const cellHeight = this.tabel.getCellHeight(); // In pixels
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

      // Making the event bigger
      while (difference >= changeValue) {
        difference -= changeValue;
        const containerElHeight = getElementHeightFromCSS(eventEl);
        eventEl.style.height = `${containerElHeight + changeValue}px`;
        this.endTimestamp = addMinutesToTimestamp(this.endTimestamp, 15);
      }

      while (difference < 0 && difference <= -cellHeight / 4) {
        difference += changeValue;
        const containerElHeight = getElementHeightFromCSS(eventEl);

        if (containerElHeight - changeValue >= changeValue) {
          eventEl.style.height = `${Math.max(
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

      // Updating the object attribute and the event time
      eventEl.setAttribute('end-time', this.endTimestamp);
      this.eventEditor.updateEventEditorTimes();
    };

    let interval;

    const initialResizeElementHeight = resizeBoxEl.offsetHeight;
    // The height for the resize box while resizing
    const resizeBoxResizeHeight = `${this.tabel.getCellHeight() * 5}px`;

    // The interval periode of the resize event in milliseconds
    const intervalPeriode = 0;

    resizeBoxEl.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // When the resize begin we update the positions and start an interval, and
    // update the resize box height
    resizeBoxEl.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      mousePosition.lastUpdatedY =
        e.clientY - eventEl.getBoundingClientRect().top;
      mousePosition.currentY = mousePosition.lastUpdatedY;
      resizeBoxEl.style.height = resizeBoxResizeHeight;
      interval = setInterval(resizeEventFunction, intervalPeriode);
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
  }

  #enableMovingEvents(eventEl) {
    // The position are relative to the eventEl
    const mousePosition = {
      x: 0,
      y: 0,
      lastUpdatedY: 0,
    };

    // A variable to indicate if we have moved the event or not
    let hasMoved = false;

    const cellWidth = eventEl.parentNode.offsetWidth,
      cellHeight = this.tabel.getCellHeight();

    const movingFunction = () => {
      // If the changes are less or equal than this nothing happen in any direction
      const xGapError = cellWidth / 4;
      const yGapError = cellHeight / 6;

      // Moving left
      if (mousePosition.x < -xGapError) {
        hasMoved = true;
        this.startTimestamp = subtractDaysFromTimeStamp(this.startTimestamp, 1);
        this.endTimestamp = subtractDaysFromTimeStamp(this.endTimestamp, 1);

        const parentCell = this.tabel.getCellParent(this.startTimestamp);
        if (parentCell) {
          parentCell.appendChild(eventEl);
          this.parentEl = parentCell;
        }
        mousePosition.x += cellWidth;
      }

      // Moving right
      if (mousePosition.x > xGapError + cellWidth) {
        hasMoved = true;
        this.startTimestamp = addDaysToTimeStamp(this.startTimestamp, 1);
        this.endTimestamp = addDaysToTimeStamp(this.endTimestamp, 1);

        const parentCell = this.tabel.getCellParent(this.startTimestamp);
        if (parentCell) {
          parentCell.appendChild(eventEl);
          this.parentEl = parentCell;
        }
        mousePosition.x -= cellWidth;
      }

      // Moving up, 15 minutes at the time
      if (mousePosition.lastUpdatedY - mousePosition.y > yGapError) {
        hasMoved = true;
        this.startTimestamp = subtractMinutesFromTimestamp(
          this.startTimestamp,
          15
        );
        this.endTimestamp = subtractMinutesFromTimestamp(this.endTimestamp, 15);

        const parentCell = this.tabel.getCellParent(this.startTimestamp);
        if (parentCell) {
          parentCell.appendChild(eventEl);
          this.parentEl = parentCell;

          // Calculating the veritcal offset
          eventEl.style.top = `${
            (this.moment(this.startTimestamp).minute() / 60) * cellHeight
          }px`;
        }
        mousePosition.lastUpdatedY -= cellHeight * 0.25;
      }

      // Moving down, 15 minutes at the time
      if (mousePosition.y - mousePosition.lastUpdatedY > yGapError) {
        hasMoved = true;
        this.startTimestamp = addMinutesToTimestamp(this.startTimestamp, 15);
        this.endTimestamp = addMinutesToTimestamp(this.endTimestamp, 15);

        const parentCell = this.tabel.getCellParent(this.startTimestamp);
        if (parentCell) {
          parentCell.appendChild(eventEl);
          this.parentEl = parentCell;

          // Calculating the veritcal offset
          eventEl.style.top = `${
            (this.moment(this.startTimestamp).minute() / 60) * cellHeight
          }px`;
        }
        mousePosition.lastUpdatedY += cellHeight * 0.25;
      }

      eventEl.setAttribute('start-time', this.startTimestamp);
      eventEl.setAttribute('end-time', this.endTimestamp);
    };

    const movingEventTime = 0;
    let interval;

    // Indicates if the editor was hidden or not
    let wasEditorHidden;

    // Starts the movement
    eventEl.addEventListener('mousedown', (e) => {
      this.eventEl.style.cursor = 'move';
      wasEditorHidden = this.eventEditor.isEditorHidden();
      this.eventEditor.hideEditorVisually();
      mousePosition.lastUpdatedY = e.clientY;
      mousePosition.y = mousePosition.lastUpdatedY;
      hasMoved = false;

      // Making sure to not start multiple intervals
      if (interval) clearInterval(interval);
      // Starting the interval
      interval = setInterval(movingFunction, movingEventTime);
    });

    eventEl.addEventListener('mousemove', (e) => {
      mousePosition.y = e.clientY;
      mousePosition.x = e.clientX - eventEl.getBoundingClientRect().left;
    });

    // When the movement ends
    const endMovingEvent = (e) => {
      this.eventEl.style.cursor = 'pointer';
      e.stopPropagation();
      if (interval) {
        clearInterval(interval);
        interval = null;
      }

      if (!hasMoved || !wasEditorHidden) {
        this.eventEditor.showEventEditor(this);
      } else this.eventEditor.hideEditor();
    };

    eventEl.addEventListener('mouseup', endMovingEvent);
    eventEl.addEventListener('click', endMovingEvent);
  }
}

export default Event;
