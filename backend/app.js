const express = require('express');
const app = express();
const userRouter = require('./routers/user');
const eventRouter = require('./routers/event');

// Starting db
require('./mongoose');

const port = process.env.PORT ?? 3000;

app.use(express.json());
app.use(userRouter);
app.use(eventRouter);

app.listen(port, () => {
    console.log(`Backend started at port ${port}`);
});
