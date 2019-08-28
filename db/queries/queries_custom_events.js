const db = require('../index');

/**
 * Get custom event info from the database given custom event id.
 * @param {integer} cus_event_id The cus_event_id of the custom event
 * @return {Promise<{}>} A promise to the user.
 */
const getCustomEventInfo = function(cus_event_id) {
  const query = {
    text: `
      SELECT id, name, description, start_date, location FROM customEvents
        WHERE id = $1;
    `,
    values: [cus_event_id]
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
exports.getCustomEventInfo = getCustomEventInfo;

/**
 * Get custom event artists from the database given custom event id.
 * @param {integer} cus_event_id The cus_event_id of the custom event
 * @return {Promise<{}>} A promise to the user.
 */
const getCustomEventArtists = function(cus_event_id) {
  const query = {
    text: `
      SELECT name FROM artists
        WHERE cus_event_id = $1;
    `,
    values: [cus_event_id]
  };

  return new Promise((resolve, reject) => {
    db.query(query.text, query.values, (err, res) => {
      if (err) {
        console.error('query error',err.stack);
        reject(err);
      }
      resolve(res.rows);
    });
  })
}
exports.getCustomEventArtists = getCustomEventArtists;

