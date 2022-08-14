import { isLoggedIn } from '../authentication/auth';
import { getCalendar } from './index';

// Handles the events storage
class StorageHandler {
    // Create an event and saves it
    async addEvent(event) {
        if (isLoggedIn()) {
            await fetch('/event', {
                method: 'POST',
                body: JSON.stringify({
                    title: event.title,
                    description: event.description,
                    startTimestamp: event.startTimestamp,
                    endTimestamp: event.endTimestamp,
                    _id: event.id,
                }),
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: localStorage.getItem('token'),
                },
            });
        } else {
            alert('Please login!');
            getCalendar().generateEmptyTable();
        }
    }

    async updateEvent(event) {
        if (isLoggedIn()) {
            // await fetch('');
        }

        // const eventObj = this.#findEventById(event);
        // if (eventObj) {
        //     eventObj.title = event.title;
        //     eventObj.description = event.description;
        //     eventObj.startTimestamp = event.startTimestamp;
        //     eventObj.endTimestamp = event.endTimestamp;
        //     this.#saveEvents();
        // }
    }

    deleteEvent(event) {
        // const eventIndex = this.#findEventIndexById(event);
        // if (eventIndex >= 0) {
        //     this.events.splice(eventIndex, 1);
        //     this.#saveEvents();
        // }
    }

    // Returns all saved events between two time stamps
    async getAllInRange(startTimestamp, endTimestamp) {
        if (await isLoggedIn()) {
            const response = await fetch(
                `/event?start=${startTimestamp}&end=${endTimestamp}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                }
            );
            const events = await response.json();
            return events;
        } else return [];
    }
}

export default StorageHandler;
