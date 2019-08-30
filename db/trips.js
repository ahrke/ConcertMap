const db = require('./con');

/**
 * Get trips from the database with optional filter
 */
const getTrips = async (filter) => {
  filter = filter || {};
  const queryText = 'SELECT trp.id, trp.name FROM trips trp WHERE coalesce(trp.user_id = $1, true)';
  const res = await db.query(queryText, [filter['user_id']]);
  return res.rows;
};


/**
 * Get trip data with all stops from the database given trip_id.
 */
const getTripStops = async (tripId) => {
  const queryText = `SELECT stp.event_id, stp.cus_event_id, stp.description FROM stops stp WHERE stp.trip_id = $1;`;
  const res = await db.query(queryText, [tripId]);
  for (let stop of res.rows) {
    stop.id = String(stop['event_id']) || `c${stop['cus_event_id']}`;
    delete stop['event_id'];
    delete stop['cus_event_id'];
  }
  return res.rows;
};

const insertTrip = async (trip) => {
  const queryText = `INSERT INTO trips (user_id, name, last_stop_id) VALUES ($1, $2, null) RETURNING id`;
  const res = await db.query(queryText, [trip['user_id'], trip['name']]);
  if (res.rowCount !== 1) throw new Error('Insert new trip failed');
  return res.rows[0].id;
};

const insertTripStop = async (stop, lastStopId) => {
  const [cusEventId, eventId] = (stop['event_id'][0] === 'c' ? [stop['event_id'].substring(1), null] : [null, stop['event_id']]);
  const con = await db.connect();

  try {
    await con.query('BEGIN;');

    const insRes = await con.query({
      text: `INSERT INTO stops (trip_id, cus_event_id, event_id, description, last_stop_id) VALUES ($1, $2, $3, $4, null) RETURNING id`,
      values: [stop['trip_id'], cusEventId, eventId, stop['description']]
    });
    if (insRes.rowCount !== 1) throw new Error('Insert new stop into trip failed');
    const newStopId = insRes.rows[0].id;

    const uptPrevRes = await con.query({
      text: `UPDATE stops AS stp SET stp.next_stop_id = $2
          FROM (SELECT next_stop_id FROM stops WHERE id = $1 FOR UPDATE) old
          WHERE stp.id = $1 RETURNING old.next_stop_id;`,
      values: [lastStopId, newStopId]
    });
    if (uptPrevRes.rowCount !== 1) throw new Error('Insert new stop into trip failed');
    const nextStopId = uptPrevRes.rows[0]['next_stop_id'];

    if (nextStopId !== null) {
      const uptCurRes = await con.query({
        text: `UPDATE stops AS stp SET stp.next_stop_id = $2 WHERE stp.id = $1 RETURNING stp.next_stop_id`,
        values: [newStopId, nextStopId]
      });
      if (uptCurRes.rowCount !== 1) throw new Error('Insert new stop into trip failed');
    }

    await con.query('COMMIT;');
  } catch (err) {
    await con.query('ROLLBACK;');
    throw err;
  } finally {
    con.relase();
  }
};

module.exports = { getTrips, getTripStops };
