const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");

const saltRounds = 10;

module.exports = (db) => {

  const handleAppError = (req, res, err) => {
    console.log(err);
    res.status(400);
    res.json({ success: false, error: err.message });
  };

  // GET a trip's data (all stops)
  router.get("/trips/:tripId/stops", async (req, res) => {
    try {
      const stops = await db.getTripStops(req.params.tripId);
      res.json(stops);
    } catch (err) {
      handleAppError(req, res, err);
    }
  });



  // Dave: GET / POSTS
  router.get('/login', (req, res) => {
    if (req.session.user_id) {
      res.redirect('/map');
    } else {
      res.render('login');
    }
  });

  router.get('/signup', (req, res) => {
    if (req.session.user_id) {
      res.redirect('/map');
    } else {
      res.render('signup');
    }
  });

  router.get('/newProfile', (req, res) => {
    if (req.session.user_id) {
      res.redirect('/users');
    } else {
      res.render('new_profile');
    }
  });


  // POST create a new user
  router.post("/signup", (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      let user = {
        email: req.body.email,
        password: hash
      };

      db.insertUser(user)
        .then(data => {
          console.log("data from insertUser:", data)
          req.session.user_id = data;
          res.render('new_profile')
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    });
  });

  // POST add a profile for a created user
  router.post("/profile", async (req, res) => {
    console.log("from /profile POST, req.body:", req.body)
    console.log("from same, user_id:", req.session.user_id)

    let profile = {
      user_id: req.session.user_id,
      name: req.body.name,
      bio: req.body.bio,
      avatar_uri: req.body.avatar_uri
    };

    await db.addProfile(profile)
      .then(data => {
        res.redirect('/map');
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });



  // POST/PUT routes
  router.post("/users", async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      delete req.body.password;
      const user = {
        email: req.body.email,
        password: hashedPassword
      };
      res.json(user);
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.post("/users/profile", async (req, res) => {
    try {
      const profile = {
        'user_id': req.session['user_id'],
        'avatar_uri': req.body['avatar_uri'],
        'name': req.body.name,
        'bio': req.body.bio
      };
      res.json(profile);
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.post("/users/tags", async (req, res) => {
    try {
      const tag = {
        'user_id': req.session['user_id'],
        'target_id': req.body['target_id'],
        'target_type': req.body['target_type'],
        'label': req.body.label
      };
      res.json(tag);
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.post("/events", async (req, res) => {
    try {
      const customEvent = {
        'user_id': req.session.user_id,
        'name': req.body.name,
        'description': req.body.description,
        'start_date': new Date(req.body.start_date),
        'venue': req.body.venue,
        'latlng': req.body.latlng
      };
      await db.insertCustomEvent(customEvent);
      res.json({ success: true });
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.post("/trips", async (req, res) => {
    if (!req.session.user_id) {
      res.redirect("/login");
    }
    try {
      const trip = {
        'user_id': req.session.user_id,
        'name': req.body.name
      };
      const newTrip = await db.insertTrip(trip);
      res.json({ success: true, newTrip });
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.post("/trips/:tripId/stops", async (req, res) => {
    try {
      const newStop = await db.insertTripStop(req.body.stop, req.body.prevStopId);
      res.json({ success: true, newStop });
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.post("/trips/:tripId/stops/:stopId/delete", async (req, res) => {
    try {
      await db.removeTripStop(req.params.stopId);
      res.json({ success: true });
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  // POST update a profile's bio column
  router.post("/users/profile/updateBio", (req, res) => {
    if (req.session.user_id) {
      let user = {
        user_id: req.session.user_id,
        bio: req.body.bio
      };
      console.log(user);

      db.updateProfileBio(user)
        .then(data => {
          let user = data;
          res.redirect('/profile/settings')
        })
        .catch(err => {
          res.status(500);
          res.json({ error: err.message });
        });
    } else {
      res.redirect('/login');
    }
  })

  // POST update a profile's avatar URI column
  router.post("/users/profile/updateAvatar", (req, res) => {
    if (req.session.user_id) {
      let user = {
        user_id: req.session.user_id,
        avatar_uri: req.body.avatar_uri
      };

      db.updateProfileAvatarUri(user)
        .then(data => {
          let user = data;
          res.redirect('/profile/settings', { user })
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    } else {
      res.redirect('/login');
    }
  });


  // POST add a favourite or attending tag
  router.post("/tag", (req, res) => {
    let tag = {
      user_id: req.session.user_id,
      event_id: req.body.event_id,
      trip_id: req.body.trip_id,
      cus_event_id: req.body.cus_event_id,
      label: req.body.label
    };
    console.log(tag);

    db.addTag(tag)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.status(500);
        res.json({ error: err.message });
      });
  });

  return router;
};
