const express = require('express');
const app = express();

// Starting db
require('./mongoose');

const port = process.env.PORT ?? 3000;

app.use(express.json());

app.listen(port, () => {
    console.log(`Backend started at port ${port}`);
});
