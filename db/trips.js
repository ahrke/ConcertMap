const db = require('./con');

/**
 * Get trips from the database with optional filter
 */
const getTrips = async(filter) => {
  const res = await db.query('SELECT trp.id, trp.name FROM trips trp WHERE coalesce(trp.user_id = $1, true)', [filter['user_id']]);
  return res.rows;
};


/**
 * Get trip data with all stops from the database given trip_id.
 */
const getTripStops = async(tripId) => {
  const query = `SELECT stp.event_id, stp.cus_event_id, stp.description FROM stops stp WHERE stp.trip_id = $1;`;
  const res = await db.query(query, [tripId]);
  for (let stop of res.rows) {
    stop.id = String(stop['event_id']) || `c${stop['cus_event_id']}`;
    delete stop['event_id'];
    delete stop['cus_event_id'];
  }
  return res.rows;
};

module.exports = { getTrips, getTripStops };
