const { Pool } = require('pg');
const { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD } = require('../config');

const pool = new Pool({
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  database: DB_NAME
});

module.exports = pool;
