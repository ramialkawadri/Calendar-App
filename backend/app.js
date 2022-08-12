const express = require('express');
const app = express();
const userRouter = require('./routers/user');
const eventRouter = require('./routers/event');
const path = require('path');

// Starting db
require('./mongoose');

const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(eventRouter);

// Sending index.html
const staticPath = path.join(__dirname, '../public/');
app.use(express.static(staticPath));
app.get('/', (req, res) => {
    res.sendFile('index.html');
});

app.listen(port, () => {
    console.log(`Backend started at port ${port}`);
});
