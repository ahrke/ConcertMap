const db = require('../index');

/**
 * Add a new tag to the database.
 * @param {{user_id: integer, concert_id: integer, trip_id: integer, cus_event_id: integer, label: string}} tag
 * @return {Promise<{}>} A promise to the user.
 */
const addTag =  function(tag) {
  let option = '';
  let arr = [tag.user_id]
  if (tag.event_id) {
    option = 'event_id';
    arr.push(tag.event_id);
  } else if (tag.trip_id) {
    option = 'trip_id';
    arr.push(tag.trip_id);
  } else {
    option = 'cus_events_id';
    arr.push(tag.cus_event_id);
  }
  arr.push(tag.label);
  const query = {
    text: `
      INSERT INTO tags (user_id, ${option}, label)
      VALUES
        ($1, $2, $3)
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
exports.addTag = addTag;
