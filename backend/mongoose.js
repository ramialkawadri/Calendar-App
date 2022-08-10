// This file connects to MongoDB

const mongoose = require('mongoose');
const connectionURL = 'mongodb://127.0.0.1:27017/calendar-app';
mongoose.connect(connectionURL);
