const db = require('./con');

/**
 * Get trips from the database with optional filter
 */
const getTrips = async (filter) => {
  filter = filter || {};
  const queryText = 'SELECT trp.id, trp.name, trp.last_stop_id FROM trips trp WHERE coalesce(trp.user_id = $1, true)';
  const res = await db.query(queryText, [filter['user_id']]);
  return res.rows;
};

const insertTrip = async (trip) => {
  const queryText = `INSERT INTO trips (user_id, name, last_stop_id) VALUES ($1, $2, null) RETURNING id`;
  const res = await db.query(queryText, [trip['user_id'], trip['name']]);
  if (res.rowCount !== 1) throw new Error('Insert new trip failed');
  return res.rows[0].id;
};


/**
 * Get trip data with all stops from the database given trip_id.
 */
const getTripStops = async (tripId) => {
  const queryText = `SELECT stp.id, stp.event_id, stp.cus_event_id, stp.next_stop_id, stp.description FROM stops stp WHERE stp.trip_id = $1;`;
  const res = await db.query(queryText, [tripId]);
  for (let stop of res.rows) {
    stop['event_id'] = stop['event_id'] ? `${stop['event_id']}` : `c${stop['cus_event_id']}`;
    delete stop['cus_event_id'];
  }
  return res.rows;
};

const removeTripStop = async (stopId) => {
  const con = await db.connect();
  try {
    await con.query('BEGIN;');

    const uptPrevRes = await con.query({
      text: `UPDATE stops AS stp SET next_stop_id = (SELECT stp2.next_stop_id FROM stops stp2 WHERE stp2.id = $1) WHERE stp.next_stop_id = $1 RETURNING stp.id;`,
      values: [stopId]
    });
    if (uptPrevRes.rowCount > 1) throw new Error('Deletion failed on trip stop');

    const uptTripRes = await con.query({
      text: `UPDATE trips AS trp SET last_stop_id = (SELECT stp.id FROM stops stp WHERE stp.next_stop_id = $1) WHERE trp.last_stop_id = $1 RETURNING trp.id;`,
      values: [stopId]
    });
    if (uptTripRes.rowCount > 1) throw new Error('Deletion failed on trip stop');

    const delRes = await con.query({
      text: `DELETE FROM stops AS stp WHERE stp.id = $1 RETURNING stp.next_stop_id;`,
      values: [stopId]
    });
    if (delRes.rowCount !== 1) throw new Error('Deletion failed on trip stop');

    await con.query('COMMIT;');
  } catch (err) {
    await con.query('ROLLBACK;');
    throw err;
  } finally {
    con.release();
  }
};

const insertTripStop = async (stop, prevStopId) => {
  const [cusEventId, eventId] = (stop['event_id'][0] === 'c' ? [stop['event_id'].substring(1), null] : [null, stop['event_id']]);
  const con = await db.connect();

  try {
    await con.query('BEGIN;');

    const insRes = await con.query({
      text: `INSERT INTO stops (trip_id, cus_event_id, event_id, description, next_stop_id) VALUES ($1, $2, $3, $4, null) RETURNING *`,
      values: [stop['trip_id'], cusEventId, eventId, stop['description']]
    });
    if (insRes.rowCount !== 1) throw new Error('Insert new stop into trip failed');
    const newStop = insRes.rows[0];
    const newStopId = newStop.id;

    let nextStopId = null;
    if (prevStopId) {
      // Link prev -> cur Return prev.next as next
      const uptPrevRes = await con.query({
        text: `UPDATE stops AS stp SET next_stop_id = $2
          FROM (SELECT next_stop_id FROM stops WHERE id = $1 FOR UPDATE) old
          WHERE stp.id = $1 RETURNING old.next_stop_id;`,
        values: [prevStopId, newStopId]
      });
      if (uptPrevRes.rowCount !== 1) throw new Error('Insert new stop into trip failed');
      // Link cur -> next if it exits
      nextStopId = uptPrevRes.rows[0]['next_stop_id'];
      if (nextStopId !== null) {
        const uptCurRes = await con.query({
          text: `UPDATE stops AS stp SET next_stop_id = $2 WHERE stp.id = $1 RETURNING stp.id`,
          values: [newStopId, nextStopId]
        });
        if (uptCurRes.rowCount !== 1) throw new Error('Insert new stop into trip failed');
      }
    }

    if (!prevStopId || nextStopId === null) {
      // Inserting as end node
      const uptTripRes = await con.query({
        text: `UPDATE trips as trp SET last_stop_id = $2 WHERE trp.id = $1 RETURNING trp.id`,
        values: [stop['trip_id'], newStopId]
      });
    }

    await con.query('COMMIT;');

    newStop['event_id'] = newStop['event_id'] ? `${newStop['event_id']}` : `c${newStop['cus_event_id']}`;
    delete newStop['cus_event_id'];

    return newStop;

  } catch (err) {
    await con.query('ROLLBACK;');
    throw err;
  } finally {
    con.release();
  }
};

module.exports = { getTrips, getTripStops, insertTrip, insertTripStop, removeTripStop };
