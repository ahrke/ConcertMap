const db = require('../index');

/**
 * Add a new custom event to the database.
 * @param {{user_id: integer, name: string, description: string, start_date: Date, venue: string, latlng: string}} customEvent
 * @return {Promise<{}>} A promise to the user.
 */
const addCustomEvent =  function(cusEvent) {
  const query = {
    text: `
      INSERT INTO custom_events (user_id, name, description, start_date, venue, latlng)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `,
    values: [cusEvent.user_id, cusEvent.name, cusEvent.description, cusEvent.start_date, cusEvent.venue, cusEvent.latlng]
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
exports.addCustomEvent = addCustomEvent;
