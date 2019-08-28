

/**
 * Get user favourited and attended events from the database given their user_id.
 * @param {integer} user_id The user_id of the user
 * @return {Promise<{}>} A promise to the user.
 */
const getUserTags = function(user_id) {
  const query = {
    text: `
      SELECT * FROM tags
        WHERE user_id = $1;
    `,
    values: [user_id]
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
exports.getUserTags = getUserTags;
