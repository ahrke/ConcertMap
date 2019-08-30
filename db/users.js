const db = require('./con');

/**
 * Get a single user from the database given their email.
 */
const getUserByEmail = async(email) => {
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

const insertUser = (user) => {
  const queryText = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id';
  const res = db.query(queryText, [user['email'], user['password']]);
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
  const res = await db.query(queryText, [profile['user_id'], profile['avatar_uri'], profile['bio']]);
  if (res.rowCount !== 1) throw new Error('Update profile failed');
};

module.exports = { getUserByEmail, getUserProfile, upsertUserProfile, getUserTags, insertUser };
