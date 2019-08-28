const { Pool } = require('pg');
const { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD } = require('../config');

console.log(DB_HOST)

const pool = new Pool({
  name: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  database: DB_NAME
});

module.exports = {
  query: (queryText, queryParams, callback) => {
    let start = Date.now()
    return pool.query(queryText, queryParams, (err, res) => {
      const duration = Date.now() - start;
      console.log("executed query", { duration, rows: res.rowCount });
      callback(err, res);
    });
  }
}
