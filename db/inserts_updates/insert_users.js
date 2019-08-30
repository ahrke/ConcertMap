const db = require('../index');

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const query = {
    text: `
      INSERT INTO users (name, email, password)
      VALUES
        ($1, $2, $3)
      RETURNING *;
    `,
    values: [user.name, user.email, user.password]
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
exports.addUser = addUser;

/**
 * Add a user profile info to the database.
 * @param {{id: integer, bio: string, avatar_uri: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addProfile =  function(user) {
  const query = {
    text: `
      INSERT INTO profiles (user_id, bio, avatar_uri)
      VALUES
        ($1, $2, $3)
      RETURNING *;
    `,
    values: [user.user_id, user.bio, user.avatar_uri]
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
exports.addProfile = addProfile;

/**
 * Update user profile bio to the database.
 * @param {{id: integer, bio: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const updateProfileBio =  function(user) {
  const query = {
    text: `
      UPDATE profiles
        SET bio = $2
        WHERE user_id = $1
      RETURNING *;
    `,
    values: [user.user_id, user.bio]
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
exports.updateProfileBio = updateProfileBio;

/**
 * Update user profile avatar to the database.
 * @param {{id: integer, avatar_uri: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const updateProfileAvatarUri =  function(user) {
  const query = {
    text: `
      UPDATE profiles
        SET avatar_uri = $2
        WHERE user_id = $1
      RETURNING *;
    `,
    values: [user.user_id, user.avatar_uri]
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
exports.updateProfileAvatarUri = updateProfileAvatarUri;

