const db = require('./con');

/**
 * Get all custom events from the database
 */
const getCustomEvents = async (filter) => {
  filter = filter || {};
  const queryText = `
    SELECT evt.id, evt.name, evt.description, evt.start_date, evt.venue, evt.latlng, array_agg(art.name) as artists
    FROM custom_events evt
    LEFT JOIN artists art
    ON evt.id = art.cus_event_id
    WHERE coalesce(evt.user_id = $1, true)
    GROUP BY evt.id;
  `;
  const eventsRes = await db.query(queryText, [filter['user_id']]);
  eventsRes.rows.forEach((event) => {
    event.artists = event.artists.filter(art => art !== null);
    event.latlng = [event.latlng.x, event.latlng.y];
    event.id = `c${event.id}`;
  });
  return eventsRes.rows;
};

/**
 * Add a new custom event to the database.
 * @param cusEvent {{user_id: integer, name: string, description: string, start_date: Date, venue: string, latlng: [integer, integer]}}
 */
const insertCustomEvent = async (cusEvent) => {
  if (cusEvent.latlng.length !== 2) throw new Error('Except latlng to be of type [integer, integer]');
  cusEvent.latlng = cusEvent.latlng.join(', ');
  const query = {
    text: `
      INSERT INTO custom_events (user_id, name, description, start_date, venue, latlng)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `,
    values: [cusEvent.user_id, cusEvent.name, cusEvent.description, cusEvent.start_date, cusEvent.venue, cusEvent.latlng]
  };
  const res = await db.query(query);
  if (res.rowCount !== 1) throw new Error('Insert custom event failed');
  return `c${res.rows[0].id}`;
};


module.exports = { getCustomEvents, insertCustomEvent };
