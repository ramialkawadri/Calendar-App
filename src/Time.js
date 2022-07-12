const getTimezoneAbbre = (date = new Date()) =>
  date.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2];

export { getTimezoneAbbre };
