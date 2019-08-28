const express = require('express');
const router = express.Router();

module.exports = (db) => {

  // GET a requested custom created event with artists
  router.get('/customEvents/:cus_event_id', (req, res) => {
    let customEvent = {};

    db.getCustomEventInfo(req.params.cus_event_id)
      .then(data => {
        customEvent = {
          name: data.name,
          description: data.description,
          start_date: data.start_date,
          location: data.location
        }

        db.getCustomEventArtists(data.id)
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

  // GET a trip's data (all stops)
  router.get("/trips/:trip_id", (req, res) => {
    db.getTripData(req.params.trip_id)
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res
      .status(500)
        .json({ error: err.message });
    });
  });

  // GET all trips in database
  router.get("/trips", (req, res) => {
    db.getAllTrips()
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
