const Pool = require('pg').Pool;
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    user: "postgres",
    password: process.env.psql_pass,
    host: "localhost",
    port: 5432,
    database: "devT"
});

module.exports = pool;