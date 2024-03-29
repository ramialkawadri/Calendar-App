import { getElementHeightFromCSS, windowMousePosition } from './utility';
import {
    addDaysToTimeStamp,
    addMinutesToTimestamp,
    subtractMinutesFromTimestamp,
    subtractDaysFromTimeStamp,
    daysBetween,
} from './time';
import moment from 'moment';

class Event {
    constructor(
        table,
        eventEditor,
        storageHandler,
        startTimestamp,
        endTimestamp = null,
        title = '',
        description = '',
        isPlaceholder = true,
        id = ''
    ) {
        this.table = table;
        this.eventEditor = eventEditor;
        this.storageHandler = storageHandler;

        // A list of the DOM elements that is represented
        this.eventEls = [];

        // Represents the cell containing the event
        this.startTimestamp = startTimestamp;

        // If no end time stamp is given, the duration of the event will be 1 hour
        endTimestamp ??= moment(startTimestamp).add(1, 'hour').valueOf();
        this.endTimestamp = endTimestamp;
        this.title = title;
        this.description = description;

        // A placeholder event is an event that is not yet added to the table but
        // used to help creating a new event
        this.isPlaceholder = isPlaceholder;
        if (id) {
            this.id = id;
            this.#initDOM();
        }
    }

    // Calculates the event height from the time, 1 hour is equal 1 cell height,
    // minutes converts to percentages
    height(startTimestamp, endTimestamp) {
        const startTime = moment(startTimestamp),
            endTime = moment(endTimestamp);
        return (
            (endTime.diff(startTime, 'minutes') / 60.0) *
            this.table.getCellHeight()
        );
    }

    get parentEl() {
        for (const event of this.eventEls) {
            if (event.parentNode) return event.parentNode;
        }
        return null;
    }

    // Returns the vertical offset from the table cell
    get #verticalOffset() {
        const startTime = moment(this.startTimestamp);
        return (startTime.minute() / 60) * this.table.getCellHeight();
    }

    // A function that adds the appropriate events for enabling resizing,
    // resizeBoxEl is the invisible box at the bottom of the eventEl
    #enableResizeEvents(eventEl, resizeBoxEl) {
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
            let difference =
                mousePosition.currentY - mousePosition.lastUpdatedY;

            // Too small change
            if (
                -smallChangeValue <= difference &&
                difference <= smallChangeValue
            )
                return;

            // Making the event bigger
            while (difference >= changeValue) {
                difference -= changeValue;
                this.endTimestamp = addMinutesToTimestamp(
                    this.endTimestamp,
                    15
                );
                this.#updateDOM();
            }

            while (difference <= -changeValue) {
                difference += changeValue;
                const containerElHeight = getElementHeightFromCSS(eventEl);

                if (containerElHeight - changeValue >= changeValue) {
                    this.endTimestamp = subtractMinutesFromTimestamp(
                        this.endTimestamp,
                        15
                    );
                    this.#updateDOM();
                }
            }

            // Updating the position
            mousePosition.lastUpdatedY = mousePosition.currentY - difference;

            if (!this.isPlaceholder) {
                this.storageHandler.updateEvent(this);
            }

            this.eventEditor.updateEventEditorTimes();
        };

        let interval;

        // The original resize box size
        const initialResizeElementHeight = resizeBoxEl.offsetHeight;
        // The height for the resize box while resizing
        const resizeBoxResizeHeight = `${this.table.getCellHeight() * 7}px`;

        // The interval period of the resize event in milliseconds
        const intervalPeriod = 0;

        resizeBoxEl.addEventListener('click', (e) => e.stopPropagation());

        // Indicate if the event editor was hidden at the start of editing
        let wasEditorHidden = true;

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
                e.clientY - eventEl.getBoundingClientRect().top;
            mousePosition.currentY = mousePosition.lastUpdatedY;
            resizeEventStart();
            document.body.addEventListener('mousemove', mouseMoveFunction);
        });

        resizeBoxEl.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            mousePosition.lastUpdatedY =
                e.touches[0].clientY - eventEl.getBoundingClientRect().top;
            mousePosition.currentY = mousePosition.lastUpdatedY;
            resizeEventStart();
            document.body.addEventListener('touchmove', touchMoveFunction);
        });

        // Updates the mouse position
        const mouseMoveFunction = (e) => {
            mousePosition.currentY =
                e.clientY - eventEl.getBoundingClientRect().top;
        };
        const touchMoveFunction = (e) => {
            mousePosition.currentY =
                e.touches[0].clientY - eventEl.getBoundingClientRect().top;
        };

        // Stops the resize function
        const stopInterval = () => {
            resizeBoxEl.style.height = `${initialResizeElementHeight}px`;
            if (interval) {
                document.body.removeEventListener(
                    'mousemove',
                    mouseMoveFunction
                );
                document.body.removeEventListener(
                    'touchmove',
                    touchMoveFunction
                );
                clearInterval(interval);
                interval = null;
            }

            if (wasEditorHidden) {
                this.eventEditor.hideEditor();
            }
        };

        ['mouseup', 'touchend', 'touchcancel', 'click'].forEach((name) => {
            resizeBoxEl.addEventListener(name, stopInterval.bind(this));
        });
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

        const cellWidth = this.table.getCellWidth(),
            cellHeight = this.table.getCellHeight();

        // How often we run the interval
        const movingEventTime = 0;
        let interval = null;

        // Indicates if the editor was hidden or not
        let wasEditorHidden = false;

        // When the movement ends
        const endMovingEvent = (e) => {
            if (e) e.stopPropagation();
            eventEl.style.cursor = 'pointer';
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
            if (!wasEditorHidden) {
                this.eventEditor.showEventEditor(this);
                wasEditorHidden = true;
            }
        };

        const movingFunction = () => {
            mousePosition.y = windowMousePosition.y;
            mousePosition.x =
                windowMousePosition.x - eventEl.getBoundingClientRect().left;

            // Stopping the moving when the elements gets recreated
            if (eventEl.getBoundingClientRect().left === 0) {
                endMovingEvent();
                return;
            }

            // Removing text selections so it doesn't interfere with the moving
            window.getSelection().removeAllRanges();

            // If the changes are less or equal than this nothing happen in any direction
            const xGapError = cellWidth / 2.0;
            const yGapError = cellHeight / 6.0;

            // Moving up, 15 minutes at the time
            while (mousePosition.lastUpdatedY - mousePosition.y > yGapError) {
                hasMoved = true;
                this.startTimestamp = subtractMinutesFromTimestamp(
                    this.startTimestamp,
                    15
                );
                this.endTimestamp = subtractMinutesFromTimestamp(
                    this.endTimestamp,
                    15
                );
                mousePosition.lastUpdatedY -= cellHeight * 0.25;
            }

            // Moving down, 15 minutes at the time
            while (mousePosition.y - mousePosition.lastUpdatedY > yGapError) {
                hasMoved = true;
                this.startTimestamp = addMinutesToTimestamp(
                    this.startTimestamp,
                    15
                );
                this.endTimestamp = addMinutesToTimestamp(
                    this.endTimestamp,
                    15
                );
                mousePosition.lastUpdatedY += cellHeight * 0.25;
            }

            // Moving left
            while (mousePosition.x < -xGapError) {
                hasMoved = true;
                this.startTimestamp = subtractDaysFromTimeStamp(
                    this.startTimestamp,
                    1
                );
                this.endTimestamp = subtractDaysFromTimeStamp(
                    this.endTimestamp,
                    1
                );
                mousePosition.x += cellWidth;
            }

            // Moving right
            while (mousePosition.x > xGapError + cellWidth) {
                hasMoved = true;
                this.startTimestamp = addDaysToTimeStamp(
                    this.startTimestamp,
                    1
                );
                this.endTimestamp = addDaysToTimeStamp(this.endTimestamp, 1);
                mousePosition.x -= cellWidth;
            }

            if (hasMoved) this.#updateDOM();

            if (!this.isPlaceholder) {
                this.storageHandler.updateEvent(this);
            }
        };

        const movingStart = () => {
            eventEl.style.cursor = 'move';
            wasEditorHidden = this.eventEditor.isEditorHidden();
            this.eventEditor.hideEditorVisually();
            hasMoved = false;
            // Making sure to not start multiple intervals
            if (interval) clearInterval(interval);
            interval = setInterval(movingFunction, movingEventTime);
        };

        // Starts the movement
        eventEl.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            movingStart();
            window.addEventListener('mouseup', endMovingEvent.bind(this));
            mousePosition.lastUpdatedY = e.clientY;
        });

        eventEl.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            movingStart();
            window.addEventListener('touchend', endMovingEvent.bind(this));
            mousePosition.lastUpdatedY = e.touches[0].clientY;
        });

        ['mouseup', 'touchend', 'touchcancel'].forEach((name) => {
            eventEl.addEventListener(name, endMovingEvent.bind(this));
        });

        eventEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!hasMoved) {
                this.eventEditor.showEventEditor(this);
                this.pushToFront();
            }
        });
    }

    #initDOM() {
        this.removeDOMElement();
        this.eventEls = [];

        for (
            let i = 0;
            i <= daysBetween(this.startTimestamp, this.endTimestamp);
            ++i
        ) {
            const eventEl = document.createElement('div');
            eventEl.classList.add('event');

            if (i === 0) {
                const elementsContainer = document.createElement('div');
                const titleEl = document.createElement('p');
                const descriptionEl = document.createElement('p');

                const timeViewerEl = document.createElement('div');

                // Fixing the title
                titleEl.classList.add('title');
                titleEl.textContent = this.title ? this.title : '(Unnamed)';
                elementsContainer.appendChild(titleEl);

                // Fixing the description
                descriptionEl.classList.add('description');
                descriptionEl.textContent = this.description;
                elementsContainer.appendChild(descriptionEl);

                // The time viewer
                timeViewerEl.classList.add('time');
                elementsContainer.appendChild(timeViewerEl);

                elementsContainer.classList.add('event-container');
                eventEl.appendChild(elementsContainer);
            }

            this.eventEls.push(eventEl);
        }

        this.#updateDOM();

        // Enabling moving
        this.eventEls.forEach((eventEl) => {
            this.#enableMovingEvents(eventEl);
        });

        // Enabling resizing event
        if (this.eventEls.length) {
            /* 
                This is a div that we put at the end of the placeholder, it is 
                invisible but gives the appropriate mouse cursor and changes it 
                size while resizing so that it helps resizing the container.
            */
            const eventEl = this.eventEls[this.eventEls.length - 1];
            const resizeBoxEl = document.createElement('div');
            resizeBoxEl.classList.add('resize-box');
            eventEl.appendChild(resizeBoxEl);

            // Enable resizing, moving and updating the eventEl
            this.#enableResizeEvents(eventEl, resizeBoxEl);
        }

        // Enabling hover affects on the nodes
        this.eventEls.forEach((event) => {
            event.addEventListener('mouseover', () => {
                this.eventEls.forEach((currentEvent) =>
                    currentEvent.classList.add('event-hover')
                );
            });

            event.addEventListener('mouseout', () => {
                this.eventEls.forEach((currentEvent) =>
                    currentEvent.classList.remove('event-hover')
                );
            });
        });
    }

    // Updates the DOM and returns the parent element
    #updateDOM() {
        if (
            daysBetween(this.startTimestamp, this.endTimestamp) !==
            this.eventEls.length - 1
        ) {
            this.#initDOM();
            return;
        }

        const time = moment(this.startTimestamp);
        this.eventEls.forEach((eventEl, index) => {
            // Changing the height and the vertical offset
            eventEl.style.height = `${this.height(
                time.valueOf(),
                this.endTimestamp
            )}px`;

            if (index === 0) {
                eventEl.style.top = `${this.#verticalOffset}px`;
                eventEl.querySelector('.title').textContent = this.title
                    ? this.title
                    : '(Unnamed)';
                eventEl.querySelector('.description').textContent =
                    this.description;
                eventEl.querySelector('.time').textContent = `${moment(
                    this.startTimestamp
                ).format('HH:mm')} - ${moment(this.endTimestamp).format(
                    'HH:mm'
                )}`;
            }

            const parentEl = this.table.getCellParent(time.valueOf());
            if (parentEl) {
                parentEl.appendChild(eventEl);
                eventEl.classList.remove('hidden');
            } else eventEl.classList.add('hidden');
            time.add(1, 'days').minutes(0).hour(0).seconds(0);
        });

        return this.parentEl;
    }

    // Saves the changes into the storage
    saveChanges() {
        if (!this.isPlaceholder) this.storageHandler.updateEvent(this);
    }

    updateEventTitle(newTitle) {
        this.title = newTitle;
        this.#updateDOM();
        this.saveChanges();
    }

    updateEventDescription(newDescription) {
        this.description = newDescription;
        this.#updateDOM();
        this.saveChanges();
    }

    updateEventTimes(startTimestamp, endTimestamp) {
        this.startTimestamp = startTimestamp;
        this.endTimestamp = endTimestamp;
        // We need to initDOM again
        this.#initDOM();
        this.#updateDOM();
        this.saveChanges();
    }

    removeDOMElement() {
        this.eventEls.forEach((el) => el.remove());
    }

    pushToFront() {
        this.eventEls.forEach((el) => {
            el.style.zIndex = '2';
        });
    }

    pushToNormalPosition() {
        this.eventEls.forEach((el) => {
            el.style.zIndex = '1';
        });
    }
}

export default Event;
