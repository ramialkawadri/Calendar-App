// This file connects to MongoDB
const mongoose = require('mongoose');
const connectionURL = process.env.MONGODB_URL;
mongoose.connect(connectionURL);
