const getTimezoneAbbre = (date = new Date()) =>
  date.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2];

const addMinutesToTimestamp = (timestamp, minutes) =>
  minutes * 60000 + timestamp;

const subtractMinutesFromTimestamp = (timestamp, minutes) =>
  timestamp - minutes * 60000;

const addDaysToTimeStamp = (timestamp, days) => timestamp + 86400000 * days;

const subtractDaysFromTimeStamp = (timestamp, days) =>
  timestamp - 86400000 * days;

const addHoursToTimeStamp = (timestamp, hours) => timestamp + 3600000 * hours;

const subtractHoursFromTimeStamp = (timestamp, hours) =>
  timestamp - 3600000 * hours;

export {
  getTimezoneAbbre,
  addMinutesToTimestamp,
  subtractMinutesFromTimestamp,
  addDaysToTimeStamp,
  subtractDaysFromTimeStamp,
  addHoursToTimeStamp,
  subtractHoursFromTimeStamp,
};
