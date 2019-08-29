const db = require('../index');

/**
 * Get all custom events from the database .
 * @return {Promise<{}>} A promise to the user.
 */
const getCustomEvents = function() {
  const query = {
    text: `
      SELECT id, name, description, start_date, venue, latlng FROM custom_events;
    `,
    values: []
  };

  return new Promise((resolve, reject) => {
    db.query(query.text, query.values, (err, res) => {
      if (err) {
        console.error('query error',err.stack);
        reject(err);
      }
      let customEvents = res.rows;
      const fillEvents = async (events) => {
        for (let event of events) {
          let currEvent = await getCustomEventInfo(event.id);
          event = currEvent;
        }

        resolve(customEvents)
      }

      fillEvents(customEvents);
    });
  })
}
exports.getCustomEvents = getCustomEvents;


/**
 * Get custom event info from the database given custom event id.
 * @param {integer} cus_event_id The cus_event_id of the custom event
 * @return {Promise<{}>} A promise to the user.
 */
const getCustomEventInfo = function(cus_event_id) {
  const query = {
    text: `
      SELECT id, name, description, start_date, venue, latlng FROM custom_events
        WHERE id = $1;
    `,
    values: [cus_event_id]
  };

  return new Promise((resolve, reject) => {
    db.query(query.text, query.values, (err, res) => {
      if (err) {
        console.error('query error',err.stack);
        reject(err);
      }
      let customEvent = res.rows[0];
      let loc = [customEvent.latlng.x, customEvent.latlng.y];
      customEvent.latlng = loc;
      getCustomEventArtists(customEvent.id)
        .then(data => {
          let artists = [];
          for (let artist of data) {
            artists.push(artist.name)
          }
          customEvent.artists = artists;

          resolve(customEvent);
        })
    });
  })
}
exports.getCustomEventInfo = getCustomEventInfo;

/**
 * Get custom event artists from the database given custom event id.
 * @param {integer} cus_event_id The cus_event_id of the custom event
 * @return {Promise<{}>} A promise to the user.
 */
const getCustomEventArtists = function(cus_event_id) {
  const query = {
    text: `
      SELECT name FROM artists
        WHERE cus_event_id = $1;
    `,
    values: [cus_event_id]
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
