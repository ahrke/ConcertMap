const db = require('../index');

/**
 * Add a new trip to the database.
 * @param {{user_id: integer, name: string}} trip
 * @return {Promise<{}>} A promise to the user.
 */
const addTrip =  function(trip) {
  const query = {
    text: `
      INSERT INTO trips (user_id, name)
      VALUES
        ($1, $2)
      RETURNING *;
    `,
    values: [trip.user_id, trip.name]
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
exports.addTrip = addTrip;

/**
 * Add a stop to the database.
 * @param {{trip_id: integer, concert_id: intger, cus_event_id: integer}} stop
 * @return {Promise<{}>} A promise to the user.
 */
const addStop =  function(stop) {
  let option = ''
  let arr = [stop.trip_id];
  if (stop.event_id) {
    option = 'event_id';
    arr.push(stop.event_id);
  } else {
    option = 'cus_event_id';
    arr.push(stop.cus_event_id);
  }
  const query = {
    text: `
      INSERT INTO stops (trip_id, ${option})
      VALUES
        ($1, $2)
      RETURNING *;
    `,
    values: arr
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
exports.addStop = addStop;