// This file has functions for working with time
const moment = require('moment');

// Return the current timezone abbreviation
const getTimezoneAbbre = (date = new Date()) =>
    date.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2];

// All these functions works in milliseconds
const addDaysToTimeStamp = (timestamp, days) => timestamp + 86400000 * days;

const subtractDaysFromTimeStamp = (timestamp, days) =>
    timestamp - 86400000 * days;

const addHoursToTimeStamp = (timestamp, hours) => timestamp + 3600000 * hours;

const subtractHoursFromTimeStamp = (timestamp, hours) =>
    timestamp - 3600000 * hours;

const addMinutesToTimestamp = (timestamp, minutes) =>
    timestamp + minutes * 60000;

const subtractMinutesFromTimestamp = (timestamp, minutes) =>
    timestamp - minutes * 60000;

// Return the number of days between two dates
const daysBetween = (startTimestamp, endTimestamp) => {
    const start = moment(startTimestamp);
    const end = moment(endTimestamp);
    end.hours(start.hours()).minutes(start.minutes());
    return end.diff(start, 'days');
    // Math.floor((endTimestamp - startTimestamp) / 86400000);
};

export {
    getTimezoneAbbre,
    addMinutesToTimestamp,
    subtractMinutesFromTimestamp,
    addDaysToTimeStamp,
    subtractDaysFromTimeStamp,
    addHoursToTimeStamp,
    subtractHoursFromTimeStamp,
    daysBetween,
};
