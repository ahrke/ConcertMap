const db = require('./con');

/**
 * Get a single user from the database given their email.
 */
const getUserByEmail = async(email) => {
  console.log("email from getUserByEmail:",email)
  const queryText = `SELECT usr.id, usr.email, usr.password FROM users usr WHERE email = $1;`;
  const res = db.query(queryText, [email]);
  if (res.rowCount === 0) throw new Error('User with email not found');
  return res.rows[0];
};

/**
 * Get a user's info from the database given their user_id.
 */
const getUserProfile = async(userId) => {
  const queryText = `
      SELECT usr.email, pf.name, pf.bio, pf.avatar_uri
      FROM users usr
      LEFT JOIN profiles pf
      ON usr.id = pf.user_id
      WHERE usr.id = $1;
    `;
  const res = await db.query(queryText, [userId]);
  if (res.rowCount === 0) throw new Error('UserId invalid');
  return res.rows[0];
};

/**
 * Get user favourited and attended events from the database given their user_id.
 */
const getUserTags = async(userId) => {
  const queryText = `
      SELECT tg.event_id, tg.cus_event_id, tg.trip_id, tg.label FROM tags tg
      WHERE user_id = $1;
  `;
  const tagsRes = await db.query(queryText, [userId]);
  const typedRes = [];
  for (let tag of tagsRes.rows) {
    if (tag['event_id']) typedRes.push({ 'label': tag.label, 'target_id': tag['event_id'], 'target_type': 'event' });
    if (tag['cus_event_id']) typedRes.push({ 'label': tag.label, 'target_id': `c${tag['cus_event_id']}`, 'target_type': 'event' });
    if (tag['trip_id']) typedRes.push({ 'label': tag.label, 'target_id': tag['trip_id'], 'target_type': 'trip' });
  }
  return typedRes;
};

const insertUser = async (user) => {
  const queryText = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id;';
  const res = await db.query(queryText, [user['email'], user['password']]);
  if (res.rowCount !== 1) throw new Error('User creation failed');
  return res.rows[0].id;
};

const upsertUserProfile = async(profile) => {
  const queryText = `
    INSERT INTO profiles (user_id, avatar_uri, bio)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id)
    DO UPDATE SET avatar_uri = $2, bio = $3
    RETURNING user_id;
  `;
  // const queryText = `
  //   INSERT INTO profiles (user_id, name, avatar_uri, bio)
  //   VALUES ($1, $2, $3, $4)
  //   RETURNING user_id;
  // `;
  const res = await db.query(queryText, [profile['user_id'], profile['name'], profile['avatar_uri'], profile['bio']]);
  if (res.rowCount !== 1) throw new Error('Update profile failed');
};

const addTag =  function(tag) {
  console.log("we're in add tag, with tag:",tag)
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

module.exports = { getUserByEmail, getUserProfile, upsertUserProfile, getUserTags, insertUser, addTag };
