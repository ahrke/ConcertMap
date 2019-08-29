const express = require('express');
const router = express.Router();
const { GOOGLE_API_KEY } = require('../config');

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

  // GET all current user's created trips
  router.get("/trips/my", (req, res) => {
    if (req.session.user_id) {
      let id = req.session.user_id;
      let userCreatedTripsPromise = db.getUserCreatedTrips(id);
      let userFavouritedTrips = db.getUserFavouritedTrips(id);
      Promise.all([userCreatedTripsPromise, userFavouritedTrips])
        .then(data => {
          console.log("==>results from trips/my:",data)
          let user = {
            user_id: id
          }
          let trips = [];
          for (let d of data) {
            for (let dd of d) {
              dd.heart = false;
              dd.user_id = id;
              trips.push(dd)
            }
          }
          res.render('all_trips',{user, trips, googleApiKey: GOOGLE_API_KEY});
        })
        .catch(err => {
          console.log("error trying to get all user created and fav trips. err:",err)
        })
      // db.getUserCreatedTrips(id)
      // .then(data => {

      // })
      // .catch(err => {
      //   res
      //   .status(500)
      //     .json({ error: err.message });
      // });
    } else {
      res.redirect('/login');
    }
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


  // GET every user's created trips
  router.get("/trips", (req, res) => {
    db.getAllTrips()
    .then(data => {
      let trips = data;
      let user = {
        user_id: req.session.user_id || null
      }
      res.render('all_trips',{user, trips, googleApiKey: GOOGLE_API_KEY});
    })
    .catch(err => {
      res
      .status(500)
        .json({ error: err.message });
    });
  });


  return router;
}
