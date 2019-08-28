const db = require('../index');

/**
 * Add a new tag to the database.
 * @param {{user_id: integer, concert_id: integer, trip_id: integer, cus_event_id: integer, label: string}} tag
 * @return {Promise<{}>} A promise to the user.
 */
const addTag =  function(tag) {
  const query = {
    text: `
      INSERT INTO tags (user_id, concert_id, trip_id, cus_event_id, label)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
    values: [tag.user_id, tag.concert_id, tag.trip_id, tag.cus_event_id, tag.label]
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
exports.addTag = addTag;
