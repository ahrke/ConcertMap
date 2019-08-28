const db = require('../index');


/**
 * Get a single user from the database given their email.
 * @param {email: string, password: string} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const userLogin = function(email, password) {
  return this.getUserWithEmail(email)
    .then(res => {
      return new Promise((resolve, reject) => {
        if (res.password === password) {
          resolve(res.id)
        } else {
          reject("fail. Fields do not match")
        }
      })
    })
      .then(user_id => {
        return this.getProfile(user_id)
      })
}
exports.userLogin = userLogin;


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
const getProfile = function(user_id) {
  console.log("=> query for profiles with id: ",user_id)
  const query = {
    text: `
      SELECT u.name, p.bio, p.avatar_uri
        FROM profiles p
        JOIN users u ON u.id = p.user_id
        WHERE p.user_id = $1;
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
exports.getProfile = getProfile;


/**
 * Get user favourited and attended events from the database given their user_id.
 * @param {integer} user_id The user_id of the user
 * @return {Promise<{}>} A promise to the user.
 */
const getUserCustomEvents = function(user_id) {
  const query = {
    text: `
      SELECT name, description, start_date, venue, latlng FROM customEvents
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
      resolve(res.rows);
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
      SELECT concert_id, cus_event_id, label FROM tags
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
      resolve(res.rows);
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
      resolve(res.rows);
    });
  })
}
exports.getUserCreatedTrips = getUserCreatedTrips;


/**
 * Get user favourited trips from the database given their user_id.
 * @param {integer} user_id The user_id of the user
 * @return {Promise<{}>} A promise to the user.
 */
const getUserFavouritedTrips = function(user_id) {
  const query = {
    text: `
      SELECT tr.id, tr.name FROM tags tg
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
      resolve(res.rows);
    });
  })
}
exports.getUserFavouritedTrips = getUserFavouritedTrips;



