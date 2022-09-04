const express = require('express');
const cors = require('cors');
const pool = require('./db');
const app = express();

const PORT = process.env.PORT || 8181;

// Middlewares:
app.use(cors());
app.use(express.json());

// Routes:


// Starting the server:
app.listen(PORT, () => {
    console.log(`The server has started on the port ${PORT}`);
})