const db = require('../index');

/**
 * Get all trips from the database.
 * @return {Promise<{}>} A promise to the user.
 */
const getAllTrips = function() {
  const query = {
    text: `
      SELECT * FROM trips;
    `,
    values: []
  };

  return new Promise((resolve, reject) => {
    db.query(query.text, query.values, (err, res) => {
      if (err) {
        console.error('query error',err.stack);
        reject(err);
      }
      resolve(res.rows[0]);
    });
  })
}
exports.getAllTrips = getAllTrips;


/**
 * Get trip data with all stops from the database given trip_id.
 * @param {integer} trip_id The trip_id of the user
 * @return {Promise<{}>} A promise to the user.
 */
const getTripData = function(trip_id) {
  const query = {
    text: `
      SELECT * FROM trips t
        JOIN stops s ON (t.id = s.trip_id)
        WHERE trip_id = $1;
    `,
    values: [trip_id]
  };

  return new Promise((resolve, reject) => {
    db.query(query.text, query.values, (err, res) => {
      if (err) {
        console.error('query error',err.stack);
        reject(err);
      }
      resolve(res.rows[0]);
    });
  })
}
exports.getTripData = getTripData;
