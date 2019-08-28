const db = require('../index');

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const query = {
    text: `
      SELECT * FROM users
      WHERE email = $1;
    `,
    values: [email]
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
exports.getUserWithEmail = getUserWithEmail;


/**
 * Get a user's info from the database given their user_id.
 * @param {integer} user_id The user_id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithUserId = function(user_id) {
  const query = {
    text: `
      SELECT * FROM profiles
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
exports.getUserWithUserId = getUserWithUserId;


/**
 * Get user favourited and attended events from the database given their user_id.
 * @param {integer} user_id The user_id of the user
 * @return {Promise<{}>} A promise to the user.
 */
const getUserCustomEvents = function(user_id) {
  const query = {
    text: `
      SELECT * FROM customEvents c
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
exports.getUserCustomEvents = getUserCustomEvents;


/**
 * Get user favourited and attended events from the database given their user_id.
 * @param {integer} user_id The user_id of the user
 * @return {Promise<{}>} A promise to the user.
 */
const getUserEventTags = function(user_id) {
  const query = {
    text: `
      SELECT * FROM tags
        WHERE user_id = $1
          AND trip_id IS NULL;
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
exports.getUserEventTags = getUserEventTags;


/**
 * Get user created trips from the database given their user_id.
 * @param {integer} user_id The user_id of the user
 * @return {Promise<{}>} A promise to the user.
 */
const getUserCreatedTrips = function(user_id) {
  const query = {
    text: `
      SELECT * FROM trips
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
exports.getUserCreatedTrips = getUserCreatedTrips;


/**
 * Get user favourited trips from the database given their user_id.
 * type of 1 => favourite
 * @param {integer} user_id The user_id of the user
 * @return {Promise<{}>} A promise to the user.
 */
const getUserFavouritedTrips = function(user_id) {
  const query = {
    text: `
      SELECT * FROM tags tg
        JOIN trips tr ON tg.trip_id = tr.id
        WHERE tg.user_id = $1
          AND tg.label = 'fav';
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
exports.getUserFavouritedTrips = getUserFavouritedTrips;



