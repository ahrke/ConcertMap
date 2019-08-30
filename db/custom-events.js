const db = require('./con');

/**
 * Get all custom events from the database
 */
const getCustomEvents = async(filter) => {
  filter = filter || {};
  const query = `
    SELECT evt.id, evt.name, evt.description, evt.start_date, evt.venue, evt.latlng, array_agg(art.name) as artists
    FROM custom_events evt
    LEFT JOIN artists art
    ON evt.id = art.cus_event_id
    WHERE coalesce(evt.user_id = $1, true)
    GROUP BY evt.id;
  `;
  const eventsRes = await db.query(query, [filter['user_id']]);
  eventsRes.rows.forEach((event) => {
    event.artists = event.artists.filter(art => art !== null);
    event.latlng = [event.latlng.x, event.latlng.y];
    event.id = `c${event.id}`;
  });
  return eventsRes.rows;
};

module.exports = { getCustomEvents };
