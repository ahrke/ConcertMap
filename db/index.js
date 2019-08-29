const { Pool } = require('pg');
const { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD } = require('../config');

const pool = new Pool({
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  database: DB_NAME
});

module.exports = {
  query: (queryText, queryParams, callback) => {
    console.log("--==> from index. queryText: ", queryText)
    console.log("--==> from index. queryParams: ", queryParams)
    let start = Date.now()
    return pool.query(queryText, queryParams, (err, res) => {
      if (res === undefined) {
        callback("no data",NULL);
      }
      const duration = Date.now() - start;
      console.log("executed query", { duration, rows: res.rowCount });
      callback(err, res);
    });
  }
}
