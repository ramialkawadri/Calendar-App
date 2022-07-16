// Handles the events storage
class StorageHandler {
  constructor() {
    this.events = [];
    this.storageKey = 'events;';

    // Loading the events
    const loadedEvents = localStorage.getItem(this.storageKey);
    if (loadedEvents) {
      this.events = JSON.parse(loadedEvents);
    }
  }

  #saveEvents() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.events));
  }

  // Create an event and saves it
  addEvent(event) {
    this.events.push({
      title: event.title,
      description: event.description,
      id: event.id,
      startTimestamp: event.startTimestamp,
      endTimestamp: event.endTimestamp,
    });
    this.#saveEvents();
  }

  #findEventById(event) {
    return this.events.find((e) => e.id === event.id);
  }

  #findEventIndexById(event) {
    return this.events.findIndex((e) => e.id === event.id);
  }

  updateEvent(event) {
    const eventObj = this.#findEventById(event);

    if (eventObj) {
      eventObj.title = event.title;
      eventObj.description = event.description;
      eventObj.startTimestamp = event.startTimestamp;
      eventObj.endTimestamp = event.endTimestamp;
      this.#saveEvents();
    }
  }

  deleteEvent(event) {
    const eventIndex = this.#findEventIndexById(event);
    if (eventIndex >= 0) {
      this.events.splice(eventIndex, 1);
      this.#saveEvents();
    }
  }

  // Returns all saved events between two time stamps
  getAllInRange(startTimestamp, endTimestamp) {
    return this.events.filter(
      (event) =>
        startTimestamp <= event.startTimestamp &&
        event.endTimestamp <= endTimestamp
    );
  }
}

export default StorageHandler;
