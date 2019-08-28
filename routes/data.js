const express = require('express');
const router = express.Router();

module.exports = (db) => {

  // GET a requested custom created event with artists
  router.get('/customEvent', (req, res) => {
    let customEvent = {};

    db.getCustomEventInfo(req.body.cus_event_id)
      .then(data => {
        customEvent = {
          name: data.name,
          description: data.description,
          start_date: data.start_date,
          location: data.location
        }

        getCustomEventArtists(data.id)
          .then(data => {
            let artists = data.map(artist => artist);
            customEvent["artists"] = artists;

            res.json(customEvent)
          })
          .catch(err => {
            res
              .status(500)
              .json({ error: err.message });
          });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // GET all trips in database
  router.get("/trips", (req, res) => {
    db.getUserCreatedTrips()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res
      .status(500)
        .json({ error: err.message });
    });
  });

  // GET a trip's data (all stops)
  router.get("/tripData", (req, res) => {
    db.getTripData(req.session.trip_id)
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res
      .status(500)
        .json({ error: err.message });
    });
  });


  return router;
}
